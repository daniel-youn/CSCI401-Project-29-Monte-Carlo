from flask import Blueprint, jsonify, request
from app import db
from app.schemas.model_variables_schema import model_variables_schema  # Adjust the import as necessary
from marshmallow import ValidationError

# Create a Blueprint for model variables-related routes
model_variables_routes = Blueprint('model_variables_routes', __name__)

# MongoDB collection for model variables
model_variables_collection = db['model_variables']

# 1. Create new model variables
@model_variables_routes.route('/model_variables', methods=['POST'])
def create_model_variables():
    data = request.json
    try:
        # Load and validate data
        model_variables_data = model_variables_schema.load(data)

        # Insert into MongoDB
        result = model_variables_collection.insert_one(model_variables_data)
        return jsonify({'message': 'Model variables created successfully', 'simulation_id': model_variables_data['simulation_id']}), 201

    except ValidationError as err:
        return jsonify(err.messages), 400

# 2. Get model variables by simulation_id
@model_variables_routes.route('/model_variables/<simulation_id>', methods=['GET'])
def get_model_variables(simulation_id):
    model_variables = model_variables_collection.find_one({'simulation_id': simulation_id}, {'_id': False})
    if model_variables:
        return jsonify(model_variables), 200
    return jsonify({'message': 'Model variables not found'}), 404

# 3. Update model variables by simulation_id
@model_variables_routes.route('/model_variables/<simulation_id>', methods=['PUT'])
def update_model_variables(simulation_id):
    updates = request.json
    result = model_variables_collection.update_one({'simulation_id': simulation_id}, {'$set': updates})
    if result.matched_count:
        return jsonify({'message': 'Model variables updated successfully'}), 200
    return jsonify({'message': 'Model variables not found'}), 404

# 4. Delete model variables by simulation_id
@model_variables_routes.route('/model_variables/<simulation_id>', methods=['DELETE'])
def delete_model_variables(simulation_id):
    result = model_variables_collection.delete_one({'simulation_id': simulation_id})
    if result.deleted_count:
        return jsonify({'message': 'Model variables deleted successfully'}), 200
    return jsonify({'message': 'Model variables not found'}), 404

# 5. Get all model variables
@model_variables_routes.route('/model_variables', methods=['GET'])
def get_all_model_variables():
    model_variables = list(model_variables_collection.find({}, {'_id': False}))
    return jsonify(model_variables), 200
