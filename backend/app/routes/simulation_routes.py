from flask import Blueprint, jsonify, request
from bson import ObjectId
from app import db
from app.schemas.model_variables_schema import model_variables_schema
from marshmallow import ValidationError
from datetime import datetime
import numpy as np
from scipy.stats import uniform, norm, triang

# Create a Blueprint for simulation-related routes
simulation_routes = Blueprint('simulation_routes', __name__)

# MongoDB collection for simulations
simulation_collection = db['simulations']

# 1. Create new simulation
@simulation_routes.route('/simulations', methods=['POST'])
def create_simulation():
    data = request.json
    try:
        # Load and validate data
        simulation_data = simulation_schema.load(data)

        # Add creation timestamp
        simulation_data['created_at'] = datetime.now()

        # Insert into MongoDB
        result = simulation_collection.insert_one(simulation_data)
        return jsonify({'message': 'Simulation created successfully', 'simulation_id': simulation_data['simulation_id']}), 201

    except ValidationError as err:
        return jsonify(err.messages), 400

# 2. Get simulation by simulation_id
@simulation_routes.route('/simulations/<simulation_id>', methods=['GET'])
def get_simulation(simulation_id):
    simulation = simulation_collection.find_one({'simulation_id': simulation_id}, {'_id': False})
    if simulation:
        return jsonify(simulation), 200
    return jsonify({'message': 'Simulation not found'}), 404

# 3. Update simulation by simulation_id
@simulation_routes.route('/simulations/<simulation_id>', methods=['PUT'])
def update_simulation(simulation_id):
    updates = request.json
    result = simulation_collection.update_one({'simulation_id': simulation_id}, {'$set': updates})
    if result.matched_count:
        return jsonify({'message': 'Simulation updated successfully'}), 200
    return jsonify({'message': 'Simulation not found'}), 404

# 4. Delete simulation by simulation_id
@simulation_routes.route('/simulations/<simulation_id>', methods=['DELETE'])
def delete_simulation(simulation_id):
    result = simulation_collection.delete_one({'simulation_id': simulation_id})
    if result.deleted_count:
        return jsonify({'message': 'Simulation deleted successfully'}), 200
    return jsonify({'message': 'Simulation not found'}), 404

# 5. Get all simulations
@simulation_routes.route('/simulations', methods=['GET'])
def get_all_simulations():
    simulations = list(simulation_collection.find({}, {'_id': False}))
    return jsonify(simulations), 200

def get_distribution(distribution_type, min_val, max_val):
    """Helper function to return the correct distribution based on user input."""
    if distribution_type == 'uniform':
        return uniform(loc=min_val, scale=max_val - min_val)
    elif distribution_type == 'normal':
        mean = (min_val + max_val) / 2
        stddev = (max_val - min_val) / 6  # Assuming ~99.7% of values fall within [min, max]
        return norm(loc=mean, scale=stddev)
    elif distribution_type == 'triangular':
        mid = (min_val + max_val) / 2
        return triang(c=(mid - min_val) / (max_val - min_val), loc=min_val, scale=max_val - min_val)

@simulation_routes.route('/run_simulation', methods=['POST'])
def run_simulation():
    try:
        # Parse request data
        data = request.get_json()
        model_variables = data.get('model_variables')

        # Validate input using the ModelVariablesSchema
        errors = model_variables_schema.validate(model_variables)
        if errors:
            return jsonify(errors), 400

        # Extract ranges and distribution type
        distribution_type = model_variables['distribution_type']
        
        # Revenue Parameters
        wtp_standard_dist = get_distribution(distribution_type, *model_variables['willingness_to_pay_standard'])
        wtp_premium_dist = get_distribution(distribution_type, *model_variables['willingness_to_pay_premium'])
        num_standard_users_dist = get_distribution(distribution_type, *model_variables['num_standard_users_per_deal'])
        num_premium_users_dist = get_distribution(distribution_type, *model_variables['num_premium_users_per_deal'])
        num_deals_dist = get_distribution(distribution_type, *model_variables['num_deals_per_year'])
        discount_dist = get_distribution(distribution_type, *model_variables['expected_discount_per_deal'])

        # Cross-Check Factors
        market_size_dist = get_distribution(distribution_type, *model_variables['initial_market_size'])
        yoy_growth_rate_dist = get_distribution(distribution_type, *model_variables['yoy_growth_rate'])

        # Number of simulations and timesteps (if needed)
        number_of_simulations = data['number_of_simulations']
        timesteps = data.get('timesteps', 1)  # Optional timesteps if needed

        # Run Monte Carlo simulations
        results = []
        for _ in range(number_of_simulations):
            wtp_standard = wtp_standard_dist.rvs()
            wtp_premium = wtp_premium_dist.rvs()
            num_standard_users = num_standard_users_dist.rvs()
            num_premium_users = num_premium_users_dist.rvs()
            num_deals = num_deals_dist.rvs()
            discount = discount_dist.rvs()

            market_size = market_size_dist.rvs()
            growth_rate = yoy_growth_rate_dist.rvs()

            # Example calculation of revenue for one simulation
            total_revenue = (
                num_deals * (
                    num_standard_users * wtp_standard +
                    num_premium_users * wtp_premium
                ) * (1 - discount)
            ) * (market_size * (1 + growth_rate))

            results.append(total_revenue)

        # Compute summary statistics
        mean_outcome = np.mean(results)
        median_outcome = np.median(results)
        std_dev = np.std(results)
        min_outcome = np.min(results)
        max_outcome = np.max(results)
        percentile_5 = np.percentile(results, 5)
        percentile_95 = np.percentile(results, 95)

        # Store simulation data in MongoDB
        output_id = db.outputs.insert_one({
            'user_id': model_variables['user_id'],
            'simulation_id': model_variables['simulation_id'],
            'simulation_results': results,
            'summary_statistics': '',  # To be updated
            'volatility_distribution': '',  # To be updated
            'additional_calculation': ''  # To be updated
        }).inserted_id

        # Insert summary statistics
        summary_statistics_id = db.summary_statistics.insert_one({
            'user_id': model_variables['user_id'],
            'simulation_id': model_variables['simulation_id'],
            'output_id': str(output_id),
            'mean_outcome': mean_outcome,
            'median_outcome': median_outcome,
            'standard_deviation': std_dev,
            'min_outcome': min_outcome,
            'max_outcome': max_outcome,
            'percentile_5': percentile_5,
            'percentile_95': percentile_95
        }).inserted_id

        # Update output with summary statistics
        db.outputs.update_one(
            {'_id': output_id},
            {'$set': {'summary_statistics': str(summary_statistics_id)}}
        )

        # Return success response
        return jsonify({
            'message': 'Simulation completed successfully.',
            'output_id': str(output_id)
        }), 200
    
    except ValidationError as ve:
        return jsonify({'error': ve.messages}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500