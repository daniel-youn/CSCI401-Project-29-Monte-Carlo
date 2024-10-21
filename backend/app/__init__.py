# import os
# from flask import Flask
# from pymongo import MongoClient
# from pymongo.server_api import ServerApi
# from dotenv import load_dotenv

# # Load environment variables from .env
# load_dotenv()

# # Initialize the Flask app
# app = Flask(__name__)

# # Get the environment variables from the .env file
# MONGO_URI = os.getenv('MONGO_URI')
# DB_NAME = os.getenv('DB_NAME')

# # MongoDB connection
# client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
# db = client[DB_NAME]  # Access the database

# # Import the routes
# # from backend.app.routes.routes import user_routes, simulation_routes, model_variables_routes, output_routes, summary_statistics_routes, volatility_distribution_routes, additional_calculations_routes

# from app.routes.user_routes import user_routes  # Import user-related routes
# from app.routes.simulation_routes import simulation_routes  # Import simulation-related routes
# from app.routes.model_variables_routes import model_variables_routes  # Import model variables routes
# from app.routes.output_routes import output_routes  # Import output-related routes
# from app.routes.summary_statistics_routes import summary_statistics_routes  # Import summary statistics routes
# from app.routes.volatility_distribution_routes import volatility_distribution_routes  # Import volatility distribution routes
# from app.routes.additional_calculations_routes import additional_calculations_routes  # Import additional calculations routes


# # Register the blueprints
# app.register_blueprint(user_routes, url_prefix='/api/user')
# app.register_blueprint(simulation_routes, url_prefix='/api/simulation')
# app.register_blueprint(model_variables_routes, url_prefix='/api/model_variables')
# app.register_blueprint(output_routes, url_prefix='/api/output')
# app.register_blueprint(summary_statistics_routes, url_prefix='/api/summary_statistics')
# app.register_blueprint(volatility_distribution_routes, url_prefix='/api/volatility_distribution')
# app.register_blueprint(additional_calculations_routes, url_prefix='/api/additional_calculations')

import os
from flask import Flask, jsonify
from flask_cors import CORS  # Import CORS
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import logging

# Load environment variables from .env
load_dotenv()

# Initialize the Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set up logging
logging.basicConfig(level=logging.INFO)

# Get the environment variables from the .env file
MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = os.getenv('DB_NAME')

# MongoDB connection
try:
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
    db = client[DB_NAME]  # Access the database
    logging.info("Connected to MongoDB successfully.")
except Exception as e:
    logging.error(f"Failed to connect to MongoDB: {e}")

# Import the routes
from app.routes.user_routes import user_routes
from app.routes.simulation_routes import simulation_routes
from app.routes.model_variables_routes import model_variables_routes
from app.routes.output_routes import output_routes
from app.routes.summary_statistics_routes import summary_statistics_routes
from app.routes.volatility_distribution_routes import volatility_distribution_routes
from app.routes.additional_calculations_routes import additional_calculations_routes
from app.routes.project_routes import project_routes
# Register the blueprints
app.register_blueprint(user_routes, url_prefix='/api/user')
app.register_blueprint(simulation_routes, url_prefix='/api/simulation')
app.register_blueprint(model_variables_routes, url_prefix='/api/model_variables')
app.register_blueprint(output_routes, url_prefix='/api/output')
app.register_blueprint(summary_statistics_routes, url_prefix='/api/summary_statistics')
app.register_blueprint(volatility_distribution_routes, url_prefix='/api/volatility_distribution')
app.register_blueprint(additional_calculations_routes, url_prefix='/api/additional_calculations')
app.register_blueprint(project_routes, url_prefix='/api/projects')
# Add a basic route for health checks
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200
