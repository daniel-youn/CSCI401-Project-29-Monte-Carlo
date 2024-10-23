from flask import Blueprint, jsonify, request
from app import db
from app.schemas.output_schema import output_schema  # Adjust the import as necessary
from marshmallow import ValidationError
from bson import ObjectId

# Create a Blueprint for output-related routes
output_routes = Blueprint('output_routes', __name__)

# MongoDB collection for outputs
output_collection = db['outputs']

# 1. Create new output
@output_routes.route('/outputs', methods=['POST'])
def create_output():
    data = request.json
    try:
        # Load and validate data
        output_data = output_schema.load(data)

        # Insert into MongoDB
        result = output_collection.insert_one(output_data)
        return jsonify({'message': 'Output created successfully', 'output_id': output_data['output_id']}), 201

    except ValidationError as err:
        return jsonify(err.messages), 400

# 2. Get output by output_id
@output_routes.route('/outputs/<output_id>', methods=['GET'])
def get_output(output_id):
    try:
        # Attempt to find by ObjectId if applicable
        output = output_collection.find_one({'_id': ObjectId(output_id)}, {'_id': False})

        if output:
            return jsonify(output), 200
        else:
            return jsonify({'message': 'Output not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400 

# 3. Update output by output_id
@output_routes.route('/outputs/<output_id>', methods=['PUT'])
def update_output(output_id):
    updates = request.json
    result = output_collection.update_one({'output_id': output_id}, {'$set': updates})
    if result.matched_count:
        return jsonify({'message': 'Output updated successfully'}), 200
    return jsonify({'message': 'Output not found'}), 404

# 4. Delete output by output_id
@output_routes.route('/outputs/<output_id>', methods=['DELETE'])
def delete_output(output_id):
    result = output_collection.delete_one({'output_id': output_id})
    if result.deleted_count:
        return jsonify({'message': 'Output deleted successfully'}), 200
    return jsonify({'message': 'Output not found'}), 404

# 5. Get all outputs
@output_routes.route('/outputs', methods=['GET'])
def get_all_outputs():
    outputs = list(output_collection.find({}, {'_id': False}))
    return jsonify(outputs), 200

# 6. Delete all outputs
@output_routes.route('/outputs', methods=['DELETE'])
def delete_all_outputs():
    result = output_collection.delete_many({})  # This deletes all documents in the collection
    return jsonify({'message': f'{result.deleted_count} outputs deleted successfully'}), 200

# 7. Get output by simulation_id
@output_routes.route('/outputs/simulation/<simulation_id>', methods=['GET'])
def get_output_by_simulation_id(simulation_id):
    try:
        # Find all outputs with the given simulation_id
        outputs = list(output_collection.find({'simulation_id': simulation_id}, {'_id': False}))

        if outputs:
            return jsonify(outputs), 200
        else:
            return jsonify({'message': 'No outputs found for the given simulation ID'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400