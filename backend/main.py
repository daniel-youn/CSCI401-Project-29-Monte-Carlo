import os
from flask import Flask, jsonify, request
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)

# Get the environment variables from the .env file
MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = os.getenv('DB_NAME')
COLLECTION_NAME = os.getenv('COLLECTION_NAME')
BACKEND_PORT = os.getenv('BACKEND_PORT')

# MongoDB connection
client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
db = client[DB_NAME]  # Access the database
collection = db[COLLECTION_NAME]  # Access the collection

@app.route('/')
def home():
    return "Hello, Flask!"

@app.route('/api/documents', methods=['GET'])
def get_documents():
    documents = list(collection.find({}, {'_id': False}))
    return jsonify(documents), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=BACKEND_PORT)  # Specify your desired port here
