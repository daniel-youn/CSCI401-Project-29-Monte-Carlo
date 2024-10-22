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
        normalFactorRunSim(normal_sim_id, project_id)
        
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
            'message': 'Simulation completed and form submitted successfully.'
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
    model_vars_list = []
    model_vars_cursor = model_variables_collection.find({"simulation_id": simulation_id})
    for model_var in model_vars_cursor:
        model_vars_list.append(model_var)
            
    num_users = len(model_vars_list)
    num_simulations = project_collection.find_one({'_id': ObjectId(project_id)})['num_simulations']
    
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
            num_deals_dist = get_distribution(model, "num_deals_per_year_" + str(year))
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
        })
    
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

        
            
    return yearly_sim_data

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
    
    wtp_standard_dist_values = []
    wtp_premium_dist_values = []
    num_standard_users_dist_values = []
    num_premium_users_dist_values = []
    num_deals_year_1_dist_values = []
    num_deals_year_2_dist_values = []
    num_deals_year_3_dist_values = []
    num_deals_year_4_dist_values = []
    num_deals_year_5_dist_values = []
    discount_dist_values = []
    
    for model in model_variables:
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
        
        #sample sample_size times each factor and store the results
        for i in range(sample_size):
            wtp_standard_dist_values.append(wtp_standard_dist.rvs())
            wtp_premium_dist_values.append(wtp_premium_dist.rvs())
            num_standard_users_dist_values.append(num_standard_users_dist.rvs())
            num_premium_users_dist_values.append(num_premium_users_dist.rvs())
            num_deals_year_1_dist_values.append(num_deals_year_1_dist.rvs())
            num_deals_year_2_dist_values.append(num_deals_year_2_dist.rvs())
            num_deals_year_3_dist_values.append(num_deals_year_3_dist.rvs())
            num_deals_year_4_dist_values.append(num_deals_year_4_dist.rvs())
            num_deals_year_5_dist_values.append(num_deals_year_5_dist.rvs())
            discount_dist_values.append(discount_dist.rvs())
        
        # divide each factor values into buckett (x-values)  and y-values will be the frequency of the values in the bucket
        # for each factor
        # return the x-values and y-values for each factor
    bin_size_wtp_standard = (max(wtp_standard_dist_values) - min(wtp_standard_dist_values)) / 100
    freqs_wtp_standard, bin_edges_wtp_standard = np.histogram(wtp_standard_dist_values, bins=np.arange(min(wtp_standard_dist_values), max(wtp_standard_dist_values), bin_size_wtp_standard))
    
    bin_size_wtp_premium = (max(wtp_premium_dist_values) - min(wtp_premium_dist_values)) / 100
    freqs_wtp_premium, bin_edges_wtp_premium = np.histogram(wtp_premium_dist_values, bins=np.arange(min(wtp_premium_dist_values), max(wtp_premium_dist_values), bin_size_wtp_premium))
    
    bin_size_num_standard_users = (max(num_standard_users_dist_values) - min(num_standard_users_dist_values)) / 100
    freqs_num_standard_users, bin_edges_num_standard_users = np.histogram(num_standard_users_dist_values, bins=np.arange(min(num_standard_users_dist_values), max(num_standard_users_dist_values), bin_size_num_standard_users))
    
    bin_size_num_premium_users = (max(num_premium_users_dist_values) - min(num_premium_users_dist_values)) / 100
    freqs_num_premium_users, bin_edges_num_premium_users = np.histogram(num_premium_users_dist_values, bins=np.arange(min(num_premium_users_dist_values), max(num_premium_users_dist_values), bin_size_num_premium_users))

    bin_size_num_deals_year_1 = (max(num_deals_year_1_dist_values) - min(num_deals_year_1_dist_values)) / 100
    freqs_num_deals_year_1, bin_edges_num_deals_year_1 = np.histogram(num_deals_year_1_dist_values, bins=np.arange(min(num_deals_year_1_dist_values), max(num_deals_year_1_dist_values), bin_size_num_deals_year_1))
    
    bin_size_num_deals_year_2 = (max(num_deals_year_2_dist_values) - min(num_deals_year_2_dist_values)) / 100
    freqs_num_deals_year_2, bin_edges_num_deals_year_2 = np.histogram(num_deals_year_2_dist_values, bins=np.arange(min(num_deals_year_2_dist_values), max(num_deals_year_2_dist_values), bin_size_num_deals_year_2))
    
    bin_size_num_deals_year_3 = (max(num_deals_year_3_dist_values) - min(num_deals_year_3_dist_values)) / 100
    freqs_num_deals_year_3, bin_edges_num_deals_year_3 = np.histogram(num_deals_year_3_dist_values, bins=np.arange(min(num_deals_year_3_dist_values), max(num_deals_year_3_dist_values), bin_size_num_deals_year_3))
    
    bin_size_num_deals_year_4 = (max(num_deals_year_4_dist_values) - min(num_deals_year_4_dist_values)) / 100
    freqs_num_deals_year_4, bin_edges_num_deals_year_4 = np.histogram(num_deals_year_4_dist_values, bins=np.arange(min(num_deals_year_4_dist_values), max(num_deals_year_4_dist_values), bin_size_num_deals_year_4))
    
    bin_size_num_deals_year_5 = (max(num_deals_year_5_dist_values) - min(num_deals_year_5_dist_values)) / 100
    freqs_num_deals_year_5, bin_edges_num_deals_year_5 = np.histogram(num_deals_year_5_dist_values, bins=np.arange(min(num_deals_year_5_dist_values), max(num_deals_year_5_dist_values), bin_size_num_deals_year_5))

    bin_size_discount = (max(discount_dist_values) - min(discount_dist_values)) / 100
    freqs_discount, bin_edges_discount = np.histogram(discount_dist_values, bins=np.arange(min(discount_dist_values), max(discount_dist_values), bin_size_discount))
    
    return jsonify({
        "wtp_standard": {
            "x_values": bin_edges_wtp_standard.tolist(),
            "y_values": freqs_wtp_standard.tolist()
        },
        "wtp_premium": {
            "x_values": bin_edges_wtp_premium.tolist(),
            "y_values": freqs_wtp_premium.tolist()
        },
        "num_standard_users": {
            "x_values": bin_edges_num_standard_users.tolist(),
            "y_values": freqs_num_standard_users.tolist()
        },
        "num_premium_users": {
            "x_values": bin_edges_num_premium_users.tolist(),
            "y_values": freqs_num_premium_users.tolist()
        },
        "num_deals_year_1": {
            "x_values": bin_edges_num_deals_year_1.tolist(),
            "y_values": freqs_num_deals_year_1.tolist()
        },
        "num_deals_year_2": {
            "x_values": bin_edges_num_deals_year_2.tolist(),
            "y_values": freqs_num_deals_year_2.tolist()
        },
        "num_deals_year_3": {
            "x_values": bin_edges_num_deals_year_3.tolist(),
            "y_values": freqs_num_deals_year_3.tolist()
        },
        "num_deals_year_4": {
            "x_values": bin_edges_num_deals_year_4.tolist(),
            "y_values": freqs_num_deals_year_4.tolist()
        },
        "num_deals_year_5": {
            "x_values": bin_edges_num_deals_year_5.tolist(),
            "y_values": freqs_num_deals_year_5.tolist()
        },
        "discount": {
            "x_values": bin_edges_discount.tolist(),
            "y_values": freqs_discount.tolist()
        }
    }), 200
        
        
            
        
        
