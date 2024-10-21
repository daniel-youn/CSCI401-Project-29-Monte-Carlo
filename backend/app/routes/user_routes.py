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
        # Load the user data from the request
        user_data = user_schema.load(data)

        # Explicitly set user_id as the email
        user_data['user_id'] = user_data['email']
        user_data['isAdmin'] = False

        # Check for existing user by email (now user_id)
        existing_user = user_collection.find_one({'user_id': user_data['user_id']})
        if existing_user:
            return jsonify({'message': 'User already exists'}), 409  # Conflict status code

        # Hash the password
        user_data['password'] = generate_password_hash(user_data['password'])

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

# # route for regi
# @user_routes.route('/add', methods=['POST'])
# def add_user():
#     data = request.json
#     try:
#         user_data = user_schema.load(data)

#         # hash using werkzerg thing
#         user_data['password'] = generate_password_hash(user_data['password'])

#         # into mongodb
#         result = user_collection.insert_one(user_data)
#         return jsonify({'message': 'User added', 'id': str(result.inserted_id)}), 201

#     except ValidationError as err:
#         return jsonify(err.messages), 400