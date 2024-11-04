from flask import Blueprint, jsonify, request
from app import db
from app.schemas.user_schema import user_schema
from marshmallow import ValidationError
from werkzeug.security import generate_password_hash, check_password_hash

# Create a Blueprint for user-related routes
user_routes = Blueprint('user_routes', __name__)

# MongoDB collection for users
user_collection = db['users']

@user_routes.route('/users', methods=['POST'])
def create_user():
    data = request.json
    try:
        # Create a local user object based on user input
        user_data = {
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'email': data['email'],
            'user_id': data['email'],  # Set user_id to the email
            'password': generate_password_hash(data['password']),  # Hash the password
            'isAdmin': False,  # Default value for is_admin
            'simulations': [],  # Initialize with an empty list of simulations
            'settings': {},  # Initialize with empty settings
            'projects': {}  # Initialize with empty projects
        }
        
        # Check for existing user by email (now user_id)
        existing_user = user_collection.find_one({'user_id': user_data['user_id']})
        if existing_user:
            return jsonify({'message': 'User already exists'}), 409  # Conflict status code

        # Insert into MongoDB
        result = user_collection.insert_one(user_data)
        return jsonify({'message': 'User created successfully', 'user_id': str(result.inserted_id)}), 201

    except ValidationError as err:
        return jsonify(err.messages), 400


# 2. Get user by user_id
@user_routes.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    user = user_collection.find_one({'user_id': user_id}, {'_id': False})
    if user:
        return jsonify(user), 200
    return jsonify({'message': 'User not found'}), 404

# 3. Update user by user_id
@user_routes.route('/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    updates = request.json
    
    # If password is provided, hash the new password
    if 'password' in updates:
        updates['password'] = generate_password_hash(updates['password'])

    result = user_collection.update_one({'user_id': user_id}, {'$set': updates})
    
    if result.matched_count:
        return jsonify({'message': 'User updated successfully'}), 200
    return jsonify({'message': 'User not found'}), 404


# 4. Delete user by user_id
@user_routes.route('/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    result = user_collection.delete_one({'user_id': user_id})
    if result.deleted_count:
        return jsonify({'message': 'User deleted successfully'}), 200
    return jsonify({'message': 'User not found'}), 404

# 5. Get all users
@user_routes.route('/users', methods=['GET'])
def get_all_users():
    users = list(user_collection.find({}, {'_id': False}))
    return jsonify(users), 200


# Route for login: 
@user_routes.route('/login', methods=['POST'])
def login_user():
    data = request.json
    try:
        # only email and password for login
        user_data = user_schema.load(data, partial=True)

        # find by email --
        user = user_collection.find_one({'email': user_data['email']})
        if not user:
            return jsonify({'message': 'Invalid email or password'}), 401

        # pass check
        if not check_password_hash(user['password'], user_data['password']):
            return jsonify({'message': 'Invalid email or password'}), 401

        # 200 succ
        return jsonify({'message': 'Login successful', 'user_id': str(user['_id'])}), 200

    except ValidationError as err: # 400 err
        return jsonify(err.messages), 400
    
# set is_admin varible to given true or false value
@user_routes.route('/users/setAdminRole/<user_id>', methods=['PUT'])
def set_admin_role(user_id):
    data = request.json

    try:
        # Find the user by user_id
        user = user_collection.find_one({'user_id': user_id}, {'_id': False})
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Update the is_admin field with the provided value
        user_collection.update_one(
            {'user_id': user_id},
            {'$set': {'is_admin': data['is_admin']}}
        )

        # Return a success response
        return jsonify({'message': 'User admin role updated successfully'}), 200

    except ValidationError as err:
        # Handle validation errors
        return jsonify(err.messages), 400

    except Exception as e:
        # Catch any other exceptions and return a 500 response
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

# set cross_check_access varible to given true or false value
@user_routes.route('/users/setCrossCheckAccess/<user_id>', methods=['PUT'])
def set_cross_check_access_role(user_id):
    data = request.json

    try:
        project_id = data["project_id"]
        cross_check_access = data["cross_check_access"]
        
        user_collection.update_one(
            {"user_id": user_id, f"projects.{project_id}": {"$exists": True}},
            {"$set": {f"projects.{project_id}.access_data.cross_check_access": cross_check_access}}
        )

        # Return a success response
        return jsonify({'message': 'User cross check status set to ' + str(cross_check_access)}), 200

    except ValidationError as err:
        # Handle validation errors
        return jsonify(err.messages), 400

    except Exception as e:
        # Catch any other exceptions and return a 500 response
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500
    