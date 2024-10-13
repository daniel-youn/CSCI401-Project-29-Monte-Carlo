from flask import Blueprint, jsonify, request
from app import db
from app.models import validate_objectid
from app.schemas import user_schema, simulation_schema, model_variables_schema, output_schema, summary_statistics_schema, volatility_distribution_schema, additional_calculations_schema # Import from schemas
from marshmallow import ValidationError
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash


# Define blueprints routes
# user_routes = Blueprint('user_routes', __name__)
# simulation_routes = Blueprint('simulation_routes', __name__)
# model_variables_routes = Blueprint('model_variables_routes', __name__)
# output_routes = Blueprint('output_routes', __name__)
# summary_statistics_routes = Blueprint('summary_statistics_routes', __name__)
# volatility_distribution_routes = Blueprint('volatility_distribution_routes', __name__)
# additional_calculations_routes = Blueprint('additional_calculations_routes', __name__)

# Collections
user_collection = db['users']
simulation_collection = db['simulations']  
model_variables_collection = db['model_variables']
output_collection = db['outputs']
summary_statistics_collection = db['summary_statistics']
volatility_distribution_collection = db['volatility_distributions']
additional_calculations_collection = db['additional_calculations']

# Route for login: 
# @user_routes.route('/login', methods=['POST'])
# def login_user():
#     data = request.json
#     try:
#         # only email and password for login
#         user_data = user_schema.load(data, partial=True)

#         # find by email --
#         user = user_collection.find_one({'email': user_data['email']})
#         if not user:
#             return jsonify({'message': 'Invalid email or password'}), 401

#         # pass check
#         if not check_password_hash(user['password'], user_data['password']):
#             return jsonify({'message': 'Invalid email or password'}), 401

#         # 200 succ
#         return jsonify({'message': 'Login successful', 'user_id': str(user['_id'])}), 200

#     except ValidationError as err: # 400 err
#         return jsonify(err.messages), 400

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

# # Route to get user and populate product details by references
# @user_routes.route('/get/', methods=['GET'])
# def get_user(user_id):
#     data = request.json
#     oid = validate_objectid(data.get('user_id'))
#     if not oid:
#         return jsonify({'message': 'Invalid user ID'}), 400

#     user = user_collection.find_one({'_id': oid})
#     if not user:
#         return jsonify({'message': 'User not found'}), 404

#     # Fetch product details for each referenced product_id
#     simulation_details = []
#     for simulation_id in user.get('simulations', []):
#         simulation = product_collection.find_one({'_id': product_id}, {'_id': False})
#         if product:
#             product_details.append(product)

#     user['products'] = product_details  # Add product details to user data
#     del user['product_ids']  # Optionally remove product_ids

#     return jsonify(user), 200
