from concurrent.futures import ThreadPoolExecutor
import pprint
from flask import Blueprint, jsonify, request
from bson import ObjectId
from app import db
from marshmallow import ValidationError
from datetime import datetime
import numpy as np
from app.schemas.user_schema import user_schema
from scipy.stats import uniform, norm, triang
from app.schemas.simulation_schema import simulation_schema
from app.schemas.projects_schema import projects_schema
from joblib import Parallel, delayed

# Create a Blueprint for simulation-related routes
simulation_routes = Blueprint('simulation_routes', __name__)

# MongoDB collection for simulations
simulation_collection = db['simulations']
user_collection = db['users']
project_collection = db['project_schema']
model_variables_collection = db['model_variables']

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

# 6. Delete all outputs
@simulation_routes.route('/simulations', methods=['DELETE'])
def delete_all_outputs():
    result = simulation_collection.delete_many({})  # This deletes all documents in the collection
    return jsonify({'message': f'{result.deleted_count} simulations deleted successfully'}), 200

def get_distribution(model_variables, factor_name):
    """Helper function to return the correct distribution based on user input."""
    factor_params = model_variables["factors"][factor_name]
    distribution_type = factor_params['distribution_type']
    
    if distribution_type == 'uniform':
        min_val = factor_params["min_val"]
        max_val = factor_params["max_val"]
        return uniform(loc=min_val, scale=max_val - min_val)
    elif distribution_type == 'normal':
        mean = factor_params["mean"]
        stddev = factor_params["stddev"]
        return norm(loc=mean, scale=stddev)
    elif distribution_type == 'triangular':
        mode = factor_params["mode"]
        min_val = factor_params["min_val"]
        max_val = factor_params["max_val"]
        return triang(c=(mode - min_val) / (max_val - min_val), loc=min_val, scale=max_val - min_val)

@simulation_routes.route('/input_data', methods=['POST'])
def input_data():
    try:
        # Parse request data
        data = request.get_json()
        user_id = data["user_id"]
        project_id = data["project_id"]
        factors = data["factors"]
        
        # Find the project in the project collection
        project = project_collection.find_one({"_id": ObjectId(project_id)})
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Find the normal_sim_id for the given project
        normal_sim_id = project.get("normal_sim_id")
        if not normal_sim_id:
            return jsonify({"error": "Normal simulation not found for project"}), 404
        
        # Update or create the model variables for the simulation
        model_vars = model_variables_collection.find_one({"user_id": user_id, "simulation_id": normal_sim_id})
        
        if not model_vars:
            # Create new model variable data structure
            new_model_variable = {
                "user_id": user_id,
                "simulation_id": normal_sim_id,
                "factors": factors,
            }
            model_variables_collection.insert_one(new_model_variable)
        else:
            # Update the factors in the existing model variable document
            model_variables_collection.update_one(
                {"user_id": user_id, "simulation_id": normal_sim_id},
                {"$set": {"factors": factors}}
            )
        
        # Call the normalFactorRunSim function to run the simulation
        _ , output_id, sim_id_or_output_id = normalFactorRunSim(normal_sim_id, project_id)
        
        # Now, update the form_submitted field in the user's document
        user = user_collection.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Update the 'form_submitted' field for the specific project in the user's projects
        user_collection.update_one(
            {"user_id": user_id, f"projects.{project_id}": {"$exists": True}},
            {"$set": {f"projects.{project_id}.access_data.form_submitted": True}}
        )
        
        # Handle cross-check if necessary
        access_data = project.get("access_data", {})
        cross_check_access = access_data.get("cross_check_access", False)
        
        if cross_check_access:
            # TODO: update cross-check model vars if needed and call simulation again
            pass
        
        # Return success response
        return jsonify({
            'message': 'Simulation completed and form submitted successfully.',
            'id': output_id,
            'id_type': sim_id_or_output_id
        }), 200
    
    except ValidationError as ve:
        return jsonify({'error': ve.messages}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def normalFactorRunSim(simulation_id, project_id):
    # Get simulation data
    simulation = simulation_collection.find_one({'simulation_id': simulation_id}, {'_id': False})
    if not simulation:
        return jsonify({'message': 'Simulation not found'}), 404
    
    # Step 2: Fetch project and model variables
    model_vars_list = list(model_variables_collection.find({"simulation_id": simulation_id}))
    if not model_vars_list:
        return jsonify({'message': 'No model variables found'}), 404
            
    num_users = len(model_vars_list)
    num_simulations = project_collection.find_one({'_id': ObjectId(project_id)})['num_simulations']
            
    def compute_for_year(year):
        sim_data = []

        # Pre-fetch the distributions outside the loop to avoid redundant calls
        wtp_standard_dists = [get_distribution(model, "willingness_to_pay_standard") for model in model_vars_list]
        wtp_premium_dists = [get_distribution(model, "willingness_to_pay_premium") for model in model_vars_list]
        num_standard_users_dists = [get_distribution(model, "num_standard_users_per_deal") for model in model_vars_list]
        num_premium_users_dists = [get_distribution(model, "num_premium_users_per_deal") for model in model_vars_list]
        num_deals_dists = [get_distribution(model, "num_deals_per_year_" + str(year)) for model in model_vars_list]
        discount_dists = [get_distribution(model, "expected_discount_per_deal") for model in model_vars_list]

        # Generate all samples at once using vectorized operations
        for _ in range(num_simulations):
            random_index = np.random.randint(0, num_users)
            
            # Select the pre-fetched distributions for the randomly selected model
            wtp_standard = wtp_standard_dists[random_index].rvs()
            wtp_premium = wtp_premium_dists[random_index].rvs()
            num_standard_users = num_standard_users_dists[random_index].rvs()
            num_premium_users = num_premium_users_dists[random_index].rvs()
            num_deals = num_deals_dists[random_index].rvs()
            discount = discount_dists[random_index].rvs()

            # Calculate deal size and revenue
            deal_size = (wtp_standard * num_standard_users) + (wtp_premium * num_premium_users)
            year_revenue = deal_size * num_deals * (1 - discount)

            sim_data.append(year_revenue)

        return sim_data
    
    def compute_statistics_for_year(year):
        data = np.array(compute_for_year(year))
        return {
            'mean': np.mean(data),
            'median': np.median(data),
            'std_dev': np.std(data),
            'min': np.min(data),
            'max': np.max(data),
            'percentile_5': np.percentile(data, 5),
            'percentile_95': np.percentile(data, 95)
        }

    # Parallelize computation across 5 years
    yearly_sim_data = Parallel(n_jobs=-1)(delayed(compute_statistics_for_year)(year) for year in range(1, 6))
    
    assert len(yearly_sim_data) == 5
    
    # TODO: cleanup the old unused output objects
    output_id = db["outputs"].update_one(
    {'simulation_id': simulation_id},  # Query filter to match the document
    {
        '$set': {
            'summary_statistics': yearly_sim_data
        }
    },
        upsert=True  # Insert if no matching document is found
    ).upserted_id

    if output_id:
        print(f"Inserted new document with ID: {output_id}")
    else:
        print(f"Updated existing document with simulation_id: {simulation_id}")
    
    res_id = output_id if output_id else simulation_id
    sim_id_or_output_id = "output_id" if output_id else "simulation_id"
            
    return yearly_sim_data, res_id, sim_id_or_output_id

@simulation_routes.route('/get_aggregate_distribution/<project_id>', methods=['GET'])
def get_aggregate_distribution(project_id):
    result = project_collection.find_one({'_id': ObjectId(project_id)})
    if not result or 'normal_sim_id' not in result:
        return jsonify({"error": "Normal simulation not found for project"}), 404
    
    normal_sim_id = result['normal_sim_id']
    model_variables = list(model_variables_collection.find({'simulation_id': normal_sim_id}))
    if not model_variables:
        return jsonify({"error": "Model variables not found for normal simulation"}), 404

    sample_size = 10000

    # Function to sample distributions
    def sample_distributions(model):
        wtp_standard_dist = get_distribution(model, "willingness_to_pay_standard")
        wtp_premium_dist = get_distribution(model, "willingness_to_pay_premium")
        num_standard_users_dist = get_distribution(model, "num_standard_users_per_deal")
        num_premium_users_dist = get_distribution(model, "num_premium_users_per_deal")
        num_deals_year_1_dist = get_distribution(model, "num_deals_per_year_1")
        num_deals_year_2_dist = get_distribution(model, "num_deals_per_year_2")
        num_deals_year_3_dist = get_distribution(model, "num_deals_per_year_3")
        num_deals_year_4_dist = get_distribution(model, "num_deals_per_year_4")
        num_deals_year_5_dist = get_distribution(model, "num_deals_per_year_5")
        discount_dist = get_distribution(model, "expected_discount_per_deal")

        # Sample in bulk using numpy
        return {
            'wtp_standard': wtp_standard_dist.rvs(sample_size),
            'wtp_premium': wtp_premium_dist.rvs(sample_size),
            'num_standard_users': num_standard_users_dist.rvs(sample_size),
            'num_premium_users': num_premium_users_dist.rvs(sample_size),
            'num_deals_year_1': num_deals_year_1_dist.rvs(sample_size),
            'num_deals_year_2': num_deals_year_2_dist.rvs(sample_size),
            'num_deals_year_3': num_deals_year_3_dist.rvs(sample_size),
            'num_deals_year_4': num_deals_year_4_dist.rvs(sample_size),
            'num_deals_year_5': num_deals_year_5_dist.rvs(sample_size),
            'discount': discount_dist.rvs(sample_size)
        }

    # Parallelize sampling
    with ThreadPoolExecutor() as executor:
        sampled_results = list(executor.map(sample_distributions, model_variables))
    
    # Aggregate samples
    wtp_standard_values = np.concatenate([result['wtp_standard'] for result in sampled_results])
    wtp_premium_values = np.concatenate([result['wtp_premium'] for result in sampled_results])
    num_standard_users_values = np.concatenate([result['num_standard_users'] for result in sampled_results])
    num_premium_users_values = np.concatenate([result['num_premium_users'] for result in sampled_results])
    num_deals_year_1_values = np.concatenate([result['num_deals_year_1'] for result in sampled_results])
    num_deals_year_2_values = np.concatenate([result['num_deals_year_2'] for result in sampled_results])
    num_deals_year_3_values = np.concatenate([result['num_deals_year_3'] for result in sampled_results])
    num_deals_year_4_values = np.concatenate([result['num_deals_year_4'] for result in sampled_results])
    num_deals_year_5_values = np.concatenate([result['num_deals_year_5'] for result in sampled_results])
    discount_values = np.concatenate([result['discount'] for result in sampled_results])
    
    # Function to compute histogram in parallel
    def compute_histogram(values):
        bin_size = (max(values) - min(values)) / 100
        return np.histogram(values, bins=np.arange(min(values), max(values), bin_size))

    with ThreadPoolExecutor() as executor:
        histograms = list(executor.map(compute_histogram, [
            wtp_standard_values, wtp_premium_values, num_standard_users_values, 
            num_premium_users_values, num_deals_year_1_values, num_deals_year_2_values, 
            num_deals_year_3_values, num_deals_year_4_values, num_deals_year_5_values, 
            discount_values
        ]))

    # Prepare the response
    return jsonify({
        "wtp_standard": {
            "x_values": histograms[0][1].tolist(),
            "y_values": histograms[0][0].tolist()
        },
        "wtp_premium": {
            "x_values": histograms[1][1].tolist(),
            "y_values": histograms[1][0].tolist()
        },
        "num_standard_users": {
            "x_values": histograms[2][1].tolist(),
            "y_values": histograms[2][0].tolist()
        },
        "num_premium_users": {
            "x_values": histograms[3][1].tolist(),
            "y_values": histograms[3][0].tolist()
        },
        "num_deals_year_1": {
            "x_values": histograms[4][1].tolist(),
            "y_values": histograms[4][0].tolist()
        },
        "num_deals_year_2": {
            "x_values": histograms[5][1].tolist(),
            "y_values": histograms[5][0].tolist()
        },
        "num_deals_year_3": {
            "x_values": histograms[6][1].tolist(),
            "y_values": histograms[6][0].tolist()
        },
        "num_deals_year_4": {
            "x_values": histograms[7][1].tolist(),
            "y_values": histograms[7][0].tolist()
        },
        "num_deals_year_5": {
            "x_values": histograms[8][1].tolist(),
            "y_values": histograms[8][0].tolist()
        },
        "discount": {
            "x_values": histograms[9][1].tolist(),
            "y_values": histograms[9][0].tolist()
        }
    }), 200