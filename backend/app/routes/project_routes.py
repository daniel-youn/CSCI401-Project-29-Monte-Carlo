from flask import Flask, request, jsonify, Blueprint
from marshmallow import ValidationError
from datetime import datetime
from bson.objectid import ObjectId
from pymongo.errors import DuplicateKeyError
from app.schemas.projects_schema import projects_schema  # Adjust the import as necessary
from app.schemas.simulation_schema import simulation_schema
from app import db
from app.routes.simulation_routes import normalFactorRunSim, crossCheckSim, get_distribution
from app.routes.simulation_routes import model_variables_collection, simulation_collection, project_collection


project_routes = Blueprint('project_routes', __name__)
projects_collection = db['project_schema']
simulation_collection = db['simulations']
user_collection = db['users']

@project_routes.route('/projects', methods=['POST'])
def create_project():
    try:
        data = request.get_json()
        print(data)
        # Step 1: Add user-defined values and default initial values
        project_data = {
            "project_name": data['project_name'],
            "shared_users": data['shared_users'],
            "admin_user_id": data['admin_user_id'],
            "num_simulations": data['num_simulations'],
            "creation_time": datetime.utcnow(),
            "is_published": False,  # Default unpublished
            "revenue_mean_5th_year": 0.0,  # Default value
            "revenue_std_5th_year": 0.0  # Default value
        }
        
        # Step 2: Create the project and insert it into MongoDB
        inserted_project_id = projects_collection.insert_one(project_data).inserted_id
        
        # Step 3: Create simulation entries for the project
        simulations = [
            {
                "output_id": "",  # Placeholder for output_id
                "project_id": str(inserted_project_id),  # Set project_id now that project is created
                "status": "pending",
                "simulation_type": "normal",
                "simulation_id": "temp"
            },
            {
                "output_id": "",  # Placeholder for output_id
                "project_id": str(inserted_project_id),  # Set project_id
                "status": "pending",
                "simulation_type": "admin",
                "simulation_id": "temp"
            },
            {
                "output_id": "",  # Placeholder for output_id
                "project_id": str(inserted_project_id),  # Set project_id
                "status": "pending",
                "simulation_type": "cross-check",
                "simulation_id": "temp"
            }
        ]

        # Insert the simulations into the database and update their IDs
        for sim in simulations:
            simulation_schema.load(sim)  # Validate the simulation data
            inserted_simulation_id = simulation_collection.insert_one(sim).inserted_id
            sim['simulation_id'] = str(inserted_simulation_id)  # Set the simulation ID to the MongoDB ID
            # Update the inserted simulation document with the simulation ID
            simulation_collection.update_one(
                {"_id": inserted_simulation_id},
                {"$set": {"simulation_id": str(inserted_simulation_id)}}
            )
        
        # Update the project with the simulation IDs
        project_data['normal_sim_id'] = str(simulations[0]['simulation_id'])
        project_data['admin_sim_id'] = str(simulations[1]['simulation_id'])
        project_data['cross_check_sim_id'] = str(simulations[2]['simulation_id'])

        # Update the project in the database with the simulation IDs
        projects_collection.update_one(
            {"_id": inserted_project_id},
            {"$set": {
                "normal_sim_id": project_data['normal_sim_id'],
                "admin_sim_id": project_data['admin_sim_id'],
                "cross_check_sim_id": project_data['cross_check_sim_id']
            }}
        )
        
        # TODO: update user projects
        for user in project_data['shared_users']:
            user_id = user["user_id"]
            cross_check_access = user["cross_check_access"]
            
            access_data = {
                "cross_check_access": cross_check_access,  
                "form_submitted": False,       
                "is_admin": False              
            }

            # Prepare the project info to be added to the user
            project_info = {
                "project_id": str(inserted_project_id),
                "access_data": access_data
            }

            # Update the user's projects in the database
            user_collection.update_one(
                {"user_id": user_id},
                {"$set": {f"projects.{inserted_project_id}": project_info}},  # Use dot notation to set the new project
                upsert=True  # Create a new document if no user found
            )

            
        # Create access data for the admin user
        access_data = {
            "cross_check_access": False,  # Default value
            "form_submitted": False,       # Default value
            "is_admin": True               # Default value
        }

        # Prepare the project info to be added to the admin user
        project_info = {
            "project_id": str(inserted_project_id),
            "access_data": access_data
        }

        # Update the admin user's projects in the database
        user_collection.update_one(
            {"user_id": project_data['admin_user_id']},
            {"$set": {f"projects.{inserted_project_id}": project_info}},  # Use dot notation to set the new project
            upsert=True  # Create a new document if no user found
        )

        return jsonify({"message": "Project and simulations created", "project_id": str(inserted_project_id)}), 201

    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    except DuplicateKeyError:
        return jsonify({"error": "Project with this ID already exists"}), 400

@project_routes.route('/projects', methods=['GET'])
def get_all_projects():
    projects = projects_collection.find()
    
    # Convert MongoDB documents to Python dictionaries and return them as JSON
    return jsonify([projects_schema.dump(project) for project in projects]), 200

@project_routes.route('/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    try:
        # Convert project_id to ObjectId
        project = projects_collection.find_one({"_id": ObjectId(project_id)})
        
        if project:
            # Convert the MongoDB document to a JSON serializable format
            project_data = {
                "project_id": str(project["_id"]),
                "project_name": project["project_name"],
                "creation_time": project["creation_time"],
                "is_published": project["is_published"],
                "revenue_mean_5th_year": project["revenue_mean_5th_year"],
                "revenue_std_5th_year": project["revenue_std_5th_year"],
                "shared_users": project["shared_users"],
                "admin_user_id": project["admin_user_id"],
                "normal_sim_id": project.get("normal_sim_id"),
                "admin_sim_id": project.get("admin_sim_id"),
                "cross_check_sim_id": project.get("cross_check_sim_id"),
                "num_simulations": project["num_simulations"]
            }
            return jsonify(project_data), 200
        else:
            return jsonify({"error": "Project not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

@project_routes.route('/projects/addUsers', methods=['POST'])
def add_user_to_project():
    try:
        data = request.get_json()
        project_id = data["project_id"]
        users = data["users"]
        
        project = projects_collection.find_one({"_id": ObjectId(project_id)})
        
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Loop through each user in the list and update their records
        for user_data in users:
            user_id = user_data["user_id"]
            cross_check_access = user_data["cross_check_access"]

            # Fetch the user by user_id
            user = user_collection.find_one({"user_id": user_id})
            if not user:
                return jsonify({"error": f"User with ID {user_id} not found"}), 404

            # Check if the user is already part of the project
            shared_users = project.get("shared_users", [])
            if any(u['user_id'] == user_id for u in shared_users):
                continue  # Skip users already in the project

            # Construct access data for this user
            access_data = {
                "cross_check_access": cross_check_access,
                "form_submitted": False,
                "is_admin": False
            }

            # Construct project info for the user's document
            project_info = {
                "project_id": str(project_id),
                "access_data": access_data
            }

            # Update the user's projects in the database
            user_collection.update_one(
                {"user_id": user_id},
                {"$set": {f"projects.{project_id}": project_info}},
                upsert=True
            )

            # Add the user to the shared_users list in the project as a dictionary
            projects_collection.update_one(
                {"_id": ObjectId(project_id)},
                {"$addToSet": {"shared_users": {"user_id": user_id, "cross_check_access": cross_check_access}}}
            )
        
        return jsonify({"message": "Users added to project"}), 200

    except ValidationError as err:
        return jsonify({"error": err.messages}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@project_routes.route('/projects/removeUser', methods=['POST'])
def remove_user_from_project():
    try:
        data = request.get_json()
        project_id = data["project_id"]
        user_id = data["user_id"]

        # Check if the project exists
        project = projects_collection.find_one({"_id": ObjectId(project_id)})
        if not project:
            return jsonify({"error": "Project not found"}), 404

        # Check if the user exists
        user = user_collection.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Remove the user from the project's shared_users list
        projects_collection.update_one(
            {"_id": ObjectId(project_id)},
            {"$pull": {"shared_users": {"user_id": user_id}}}
        )

        # Remove the project from the user's projects
        user_collection.update_one(
            {"user_id": user_id},
            {"$unset": {f"projects.{project_id}": ""}}
        )

        # Delete the user's model variables associated with the project's simulations
        normal_sim_id = project.get("normal_sim_id")
        cross_check_sim_id = project.get("cross_check_sim_id")

        model_variables_collection.delete_many({
            "user_id": user_id,
            "simulation_id": {"$in": [normal_sim_id, cross_check_sim_id]}
        })

        # Re-run the simulations to update the results
        normalFactorRunSim(normal_sim_id, project_id)
        crossCheckSim(cross_check_sim_id, project_id)

        return jsonify({"message": "User removed from project and simulations updated"}), 200

    except ValidationError as err:
        return jsonify({"error": err.messages}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500