# from flask import Blueprint, jsonify, request
# from app import db
# from app.models import validate_objectid
# from app.schemas import user_schema, simulation_schema, model_variables_schema, output_schema, summary_statistics_schema
# from marshmallow import ValidationError
# from werkzeug.security import generate_password_hash
# from werkzeug.security import check_password_hash

# # Collections
# user_collection = db['users']
# simulation_collection = db['simulations']  
# model_variables_collection = db['model_variables']
# output_collection = db['outputs']
# summary_statistics_collection = db['summary_statistics']
# volatility_distribution_collection = db['volatility_distributions']
# additional_calculations_collection = db['additional_calculations']

import requests
from pprint import pprint 

# Base URL for the API
BASE_URL = "http://127.0.0.1:5001/api"

# Mock data
users = [
    {
        "email": "adminUser@usc.edu",
        "password": "admin123",
        "first_name": "ad",
        "last_name": "min"
    },
    {
        "email": "testUser@usc.edu",
        "password": "test123",
        "first_name": "test",
        "last_name": "user"
    },
    {
        "email": "newUser@usc.edu",
        "password": "test234",
        "first_name": "new",
        "last_name": "user"
    }
]

projects = [
    {
        "project_name": "test project 1",
        "shared_users": ["testUser@usc.edu"],
        "admin_user_id": "adminUser@usc.edu",
        "num_simulations": 10000
    }
]

# Functions to make API calls using mock data

def test_get_users():
    response = requests.get(f"{BASE_URL}/user/users")
    print("GET /user/users")
    print(f"Status Code: {response.status_code}")
    # print(f"Response: {response.json()}\n")
    pprint(response.json())
    print("\n")

def test_post_user(user_data):
    response = requests.post(f"{BASE_URL}/user/users", json=user_data)
    print(f"POST /user/users: {user_data}")
    print(f"Status Code: {response.status_code}")
    # print(f"Response: {response.json()}\n")
    pprint(response.json())
    print("\n")

def test_post_project(project_data):
    response = requests.post(f"{BASE_URL}/project/projects", json=project_data)
    print(f"POST /project/projects: {project_data['project_name']}")
    print(f"Status Code: {response.status_code}")
    # print(f"Response: {response.json()}\n")
    pprint(response.json())
    print("\n")
    return response.json().get("project_id")

def test_get_project(project_id):
    response = requests.get(f"{BASE_URL}/project/projects/{project_id}")
    print(f"GET /project/projects/{project_id}")
    print(f"Status Code: {response.status_code}")
    # print(f"Response: {response.json()}\n")
    pprint(response.json())
    print("\n")


def test_delete_user(user_id):
    response = requests.delete(f"{BASE_URL}/user/users/{user_id}")
    print(f"DELETE /user/users/{user_id}")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print(f"User with ID {user_id} successfully deleted.\n")
    else:
        print(f"Failed to delete user with ID {user_id}. Response: {response.json()}\n")

# Helper function to initialize data
def initialize_data():
    # Post all users
    for user in users:
        test_post_user(user)
    
    # Post all projects
    for project in projects:
        project_id = test_post_project(project)
        # Optionally test fetching the project
        if project_id:
            test_get_project(project_id)

if __name__ == "__main__":
    # Initialize the database with mock data
    # initialize_data()
    test_delete_user(users[2]["email"])
    test_post_user(users[2])
    

    # You can add repeated API calls below as needed
    # For example, you can call test_get_users() repeatedly if you want to check for updated user lists
    test_get_users()
