import numpy as np
from flask import Blueprint, jsonify, request
from app import db
from app.models import validate_objectid
from marshmallow import ValidationError

simulation_routes = Blueprint('simulation_routes', __name__)
simulation_collection = db['simulations']

# simulations route
@simulation_routes.route('/monte_carlo', methods=['POST'])
def monte_carlo_simulation():
    data = request.json
    try:
        # validation
        user_id = validate_objectid(data.get('user_id'))
        if not user_id:
            return jsonify({'message': 'Invalid user ID'}), 400

        #TODO:@daniel9 --> these are default parameters i set (@zionsc), i dont know what to do here
        num_simulations = data.get('num_simulations', 1000)  # default == 1000 simulations
        timesteps = data.get('timesteps', 10)  # default==10 timestamp
        initial_value = data.get('initial_value', 100)  # default val

        # actual simulation code
        simulation_results = []
        for _ in range(num_simulations):
            path = [initial_value]
            for _ in range(timesteps):
                # normal distribution
                change = np.random.normal(0, 1)
                path.append(path[-1] + change)
            simulation_results.append(path)

        # simulation into DB
        simulation_data = {
            'user_id': user_id,
            'num_simulations': num_simulations,
            'timesteps': timesteps,
            'initial_value': initial_value,
            'results': simulation_results
        }
        result = simulation_collection.insert_one(simulation_data)

        return jsonify({'message': 'Monte Carlo simulation completed', 'simulation_id': str(result.inserted_id)}), 201

    except ValidationError as err:
        return jsonify(err.messages), 400
