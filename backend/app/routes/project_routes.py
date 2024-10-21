from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from marshmallow import ValidationError
from datetime import datetime
from bson.objectid import ObjectId
from pymongo.errors import DuplicateKeyError
from app.schemas.projects_schema import projects_schema  # Adjust the import as necessary
from app import db
project_routes = Blueprint('project_routes', __name__)
projects_collection = db['project_schema']
@project_routes.route('/projects', methods=['POST'])
def create_project():
    try:
        # Validate input data using the schema
        project_data = projects_schema.load(request.json)
        project_data['creation_time'] = datetime.utcnow()  # Ensure creation time is set
        
        # Insert the validated data into MongoDB
        inserted_id = projects_collection.insert_one(project_data).inserted_id
        
        return jsonify({"message": "Project created", "project_id": str(inserted_id)}), 201
    
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    except DuplicateKeyError:
        return jsonify({"error": "Project with this ID already exists"}), 400

@project_routes.route('/projects', methods=['GET'])
def get_all_projects():
    projects = projects_collection.find()
    
    # Convert MongoDB documents to Python dictionaries and return them as JSON
    return jsonify([projects_schema.dump(project) for project in projects]), 200

@project_routes.route('/projects/<project_id>', methods=['PUT'])
def update_project(project_id):
    try:
        # Validate the input data using Marshmallow
        updated_data = projects_schema.load(request.json, partial=True)

        # Update the project in MongoDB
        result = projects_collection.update_one({"_id": ObjectId(project_id)}, {"$set": updated_data})
        
        if result.matched_count:
            return jsonify({"message": "Project updated"}), 200
        else:
            return jsonify({"error": "Project not found"}), 404
    
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

@project_routes.route('/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    result = projects_collection.delete_one({"_id": ObjectId(project_id)})
    
    if result.deleted_count:
        return jsonify({"message": "Project deleted"}), 200
    else:
        return jsonify({"error": "Project not found"}), 404
