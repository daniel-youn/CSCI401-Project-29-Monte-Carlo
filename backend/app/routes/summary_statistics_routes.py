from flask import Blueprint, jsonify, request
from app import db
from app.schemas.summary_statistics_schema import summary_statistics_schema  # Adjust the import as necessary
from marshmallow import ValidationError

# Create a Blueprint for summary statistics-related routes
summary_statistics_routes = Blueprint('summary_statistics_routes', __name__)

# MongoDB collection for summary statistics
summary_statistics_collection = db['summary_statistics']

# 1. Create new summary statistics
@summary_statistics_routes.route('/summary_statistics', methods=['POST'])
def create_summary_statistics():
    data = request.json
    try:
        stats_data = summary_statistics_schema.load(data)

        # Insert into MongoDB
        result = summary_statistics_collection.insert_one(stats_data)
        return jsonify({'message': 'Summary statistics created successfully', 'output_id': stats_data['output_id']}), 201

    except ValidationError as err:
        return jsonify(err.messages), 400

# 2. Get summary statistics by output_id
@summary_statistics_routes.route('/summary_statistics/<output_id>', methods=['GET'])
def get_summary_statistics(output_id):
    stats = summary_statistics_collection.find_one({'output_id': output_id}, {'_id': False})
    if stats:
        return jsonify(stats), 200
    return jsonify({'message': 'Summary statistics not found'}), 404

# 3. Update summary statistics by output_id
@summary_statistics_routes.route('/summary_statistics/<output_id>', methods=['PUT'])
def update_summary_statistics(output_id):
    updates = request.json
    result = summary_statistics_collection.update_one({'output_id': output_id}, {'$set': updates})
    if result.matched_count:
        return jsonify({'message': 'Summary statistics updated successfully'}), 200
    return jsonify({'message': 'Summary statistics not found'}), 404

# 4. Delete summary statistics by output_id
@summary_statistics_routes.route('/summary_statistics/<output_id>', methods=['DELETE'])
def delete_summary_statistics(output_id):
    result = summary_statistics_collection.delete_one({'output_id': output_id})
    if result.deleted_count:
        return jsonify({'message': 'Summary statistics deleted successfully'}), 200
    return jsonify({'message': 'Summary statistics not found'}), 404

# 5. Get all summary statistics
@summary_statistics_routes.route('/summary_statistics', methods=['GET'])
def get_all_summary_statistics():
    stats_list = list(summary_statistics_collection.find({}, {'_id': False}))
    return jsonify(stats_list), 200
