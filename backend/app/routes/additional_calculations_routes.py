from flask import Blueprint, jsonify, request
from app import db
from app.schemas.additional_calculations_schema import additional_calculations_schema  # Adjust the import as necessary
from marshmallow import ValidationError

# Create a Blueprint for additional calculations-related routes
additional_calculations_routes = Blueprint('additional_calculations_routes', __name__)

# MongoDB collection for additional calculations
additional_calculations_collection = db['additional_calculations']

# 1. Create new additional calculations
@additional_calculations_routes.route('/additional_calculations', methods=['POST'])
def create_additional_calculations():
    data = request.json
    try:
        # Load and validate data
        additional_calculations_data = additional_calculations_schema.load(data)

        # Insert into MongoDB
        result = additional_calculations_collection.insert_one(additional_calculations_data)
        return jsonify({'message': 'Additional calculations created successfully', 'output_id': additional_calculations_data['output_id']}), 201

    except ValidationError as err:
        return jsonify(err.messages), 400

# 2. Get additional calculations by output_id
@additional_calculations_routes.route('/additional_calculations/<output_id>', methods=['GET'])
def get_additional_calculations(output_id):
    additional_calculations = additional_calculations_collection.find_one({'output_id': output_id}, {'_id': False})
    if additional_calculations:
        return jsonify(additional_calculations), 200
    return jsonify({'message': 'Additional calculations not found'}), 404

# 3. Update additional calculations by output_id
@additional_calculations_routes.route('/additional_calculations/<output_id>', methods=['PUT'])
def update_additional_calculations(output_id):
    updates = request.json
    result = additional_calculations_collection.update_one({'output_id': output_id}, {'$set': updates})
    if result.matched_count:
        return jsonify({'message': 'Additional calculations updated successfully'}), 200
    return jsonify({'message': 'Additional calculations not found'}), 404

# 4. Delete additional calculations by output_id
@additional_calculations_routes.route('/additional_calculations/<output_id>', methods=['DELETE'])
def delete_additional_calculations(output_id):
    result = additional_calculations_collection.delete_one({'output_id': output_id})
    if result.deleted_count:
        return jsonify({'message': 'Additional calculations deleted successfully'}), 200
    return jsonify({'message': 'Additional calculations not found'}), 404

# 5. Get all additional calculations
@additional_calculations_routes.route('/additional_calculations', methods=['GET'])
def get_all_additional_calculations():
    additional_calculations = list(additional_calculations_collection.find({}, {'_id': False}))
    return jsonify(additional_calculations), 200
