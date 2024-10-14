from flask import Blueprint, jsonify, request
from app import db
from app.schemas.volatility_distribution_schema import volatility_distribution_schema  # Adjust the import as necessary
from marshmallow import ValidationError

# Create a Blueprint for volatility distribution-related routes
volatility_distribution_routes = Blueprint('volatility_distribution_routes', __name__)

# MongoDB collection for volatility distributions
volatility_distribution_collection = db['volatility_distributions']

# 1. Create a new volatility distribution
@volatility_distribution_routes.route('/volatility_distributions', methods=['POST'])
def create_volatility_distribution():
    data = request.json
    try:
        distribution_data = volatility_distribution_schema.load(data)

        # Insert into MongoDB
        result = volatility_distribution_collection.insert_one(distribution_data)
        return jsonify({'message': 'Volatility distribution created successfully', 'output_id': distribution_data['output_id']}), 201

    except ValidationError as err:
        return jsonify(err.messages), 400

# 2. Get volatility distribution by output_id
@volatility_distribution_routes.route('/volatility_distributions/<output_id>', methods=['GET'])
def get_volatility_distribution(output_id):
    distribution = volatility_distribution_collection.find_one({'output_id': output_id}, {'_id': False})
    if distribution:
        return jsonify(distribution), 200
    return jsonify({'message': 'Volatility distribution not found'}), 404

# 3. Update volatility distribution by output_id
@volatility_distribution_routes.route('/volatility_distributions/<output_id>', methods=['PUT'])
def update_volatility_distribution(output_id):
    updates = request.json
    result = volatility_distribution_collection.update_one({'output_id': output_id}, {'$set': updates})
    if result.matched_count:
        return jsonify({'message': 'Volatility distribution updated successfully'}), 200
    return jsonify({'message': 'Volatility distribution not found'}), 404

# 4. Delete volatility distribution by output_id
@volatility_distribution_routes.route('/volatility_distributions/<output_id>', methods=['DELETE'])
def delete_volatility_distribution(output_id):
    result = volatility_distribution_collection.delete_one({'output_id': output_id})
    if result.deleted_count:
        return jsonify({'message': 'Volatility distribution deleted successfully'}), 200
    return jsonify({'message': 'Volatility distribution not found'}), 404

# 5. Get all volatility distributions
@volatility_distribution_routes.route('/volatility_distributions', methods=['GET'])
def get_all_volatility_distributions():
    distributions = list(volatility_distribution_collection.find({}, {'_id': False}))
    return jsonify(distributions), 200
