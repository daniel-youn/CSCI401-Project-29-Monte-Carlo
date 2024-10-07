import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv('MONGO_URI')

try:
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
    client.server_info()  # Force a call to check connection
    print("Connection successful")
except Exception as e:
    print("Error:", e)