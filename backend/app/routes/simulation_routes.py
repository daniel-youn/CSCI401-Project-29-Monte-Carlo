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

# Create a Blueprint for simulation-related routes
simulation_routes = Blueprint('simulation_routes', __name__)

# MongoDB collection for simulations
simulation_collection = db['simulations']
user_collection = db['users']
project_collection = db['project_schema']
model_varibales_collection = db['model_variables']

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
    # maybe store in db the simulation state like running, error, finished, etc
    try:
        # Parse request data
        model_variables = request.get_json()
        user_id = model_variables["user_id"]
        project_id = model_variables["project_id"]
        factors = model_variables["factors"]
        
        # Find the user in the database
        user = user_collection.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # Find the project in the database
        project = project_collection.find_one({"_id": ObjectId(project_id)})
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Find the normal_sim_id for the given project
        normal_sim_id = project.get("normal_sim_id")
        # cross_check_sim_id = project.get("cross_check_sim_id")
        
        # UPDATE FOR NORMAL SIM
        # Find the model_var_id for the given project
        project = user['projects'].get(project_id)
        if not project:
            return jsonify({"error": "Project not found for user"}), 404
        model_var_id = project.get("model_var_id", {})
        
        if not model_var_id:
            # Create new model variable data structure
            new_model_variable = {
                "user_id": user_id,
                "simulation_id": normal_sim_id,
                "project_id": project_id,
                "factors": factors,
            }
            
            result = model_varibales_collection.insert_one(new_model_variable)
            model_var_id = str(result.inserted_id)
            
            # Update the user record in the database with the modified projects
            user_collection.update_one(
                {"user_id": user_id},
                {"$set": {"projects": user['projects']}}  # Save the updated projects back to the user
            )
            
            simulation = simulation_collection.find_one({"simulation_id": normal_sim_id})
            model_variable_ids = simulation.get('model_variables', [])

            if model_var_id not in model_variable_ids:
                model_variable_ids.append(model_var_id)
                simulation_collection.update_one(
                    {"simulation_id": normal_sim_id},
                    {"$set": {"model_variables": model_variable_ids}}
                )
        
        else:
            # Save the updated model variable back to the database
            model_varibales_collection.update_one({"model_var_id": model_var_id}, {"$set": {"factors": factors}})
            
        # TODO: call run simulation function here
        normalFactorRunSim(normal_sim_id, project_id)
        
        # TODO: UPDATE THE CROSS CHECK MODEL VARS IF APPLICABLE
        access_data = project.get("access_data", {})
        cross_check_access = access_data.get("cross_check_access", False)
        
        if cross_check_access:
            pass
        # TODO: call run simulation here again
        
        # Return success response
        return jsonify({
            'message': 'Simulation completed successfully.'
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
    
    model_vars_ids_list = simulation['model_variables']
    model_vars_list = []
    for model_vars_id in model_vars_ids_list:
        model_vars = db["model_variables"].find_one({'model_variables_id': model_vars_id}, {'_id': False})
        if model_vars:
            model_vars_list.append(model_vars)
            
    num_users = len(model_vars_list)
    num_simulations = db["project"].find_one({'project_id': project_id}, {'_id': False})['num_simulations']
    
    def compute_for_year(year):
        sim_data = []
        for i in range(0, num_simulations):
            #pick a user randomly
            model = model_vars_list[np.random.randint(0, num_users)]
            factors = model['factors']
            # TODO: figure out if getting the data is done correctly
            wtp_standard_dist = get_distribution(model, "willingness_to_pay_standard")
            wtp_premium_dist = get_distribution(model, "willingness_to_pay_premium")
            num_standard_users_dist = get_distribution(model, "num_standard_users_per_deal")
            num_premium_users_dist = get_distribution(model, "num_premium_users_per_deal")
            num_deals_dist = get_distribution(model, "num_deals_per_year" + str(year))
            discount_dist = get_distribution(model, "expected_discount_per_deal")
            
            # TODO: store deal size somehere
            deal_size = (wtp_standard_dist.rvs() * num_standard_users_dist.rvs()) + (wtp_premium_dist.rvs() * num_premium_users_dist.rvs())
            year_revenue = deal_size * num_deals_dist.rvs() * (1 - discount_dist.rvs())
            sim_data.append(year_revenue)
            
        return sim_data
    
    yearly_sim_data = []
    for year in range(1, 6):
        data = compute_for_year(year)
        mean = np.mean(data)
        median = np.median(data)
        std_dev = np.std(data)
        min_val = np.min(data)
        max_val = np.max(data)
        percentile_5 = np.percentile(data, 5)
        percentile_95 = np.percentile(data, 95)
        yearly_sim_data.append({
            'mean': mean,
            'median': median,
            'std_dev': std_dev,
            'min': min_val,
            'max': max_val,
            'percentile_5': percentile_5,
            'percentile_95': percentile_95
        });
    
    assert len(yearly_sim_data) == 5
    # Store simulation data in output collection
    # TODO: cleanup the old unused output objects
    output_id = db.outputs.insert_one({
        'simulation_id': simulation_id,
        'summary_statistics': yearly_sim_data
    }).inserted_id
        
            
    return yearly_sim_data