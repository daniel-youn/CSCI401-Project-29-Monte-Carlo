import os
from flask import Flask
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Initialize the Flask app
app = Flask(__name__)

# Get the environment variables from the .env file
MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = os.getenv('DB_NAME')

# MongoDB connection
client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
db = client[DB_NAME]  # Access the database

# Import the routes
from app.routes import user_routes, simulation_routes, model_variables_routes, output_routes, summary_statistics_routes, volatility_distribution_routes, additional_calculations_routes

# Register the blueprints
app.register_blueprint(user_routes, url_prefix='/api/user')
app.register_blueprint(simulation_routes, url_prefix='/api/simulation')
app.register_blueprint(model_variables_routes, url_prefix='/api/model_variables')
app.register_blueprint(output_routes, url_prefix='/api/output')
app.register_blueprint(summary_statistics_routes, url_prefix='/api/summary_statistics')
app.register_blueprint(volatility_distribution_routes, url_prefix='/api/volatility_distribution')
app.register_blueprint(additional_calculations_routes, url_prefix='/api/additional_calculations')
