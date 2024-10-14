const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const MonteCarloServices = {
  async createSimulation(simulationData) {
    try {
      const response = await fetch(`${BACKEND_URL}/simulations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulationData)
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Simulation created successfully:', data);
      } else {
        console.error('Error creating simulation:', data);
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
  },
  async getSimulation(simulationId) {
    try {
      const response = await fetch(`${BACKEND_URL}/simulations/${simulationId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Simulation fetched successfully:', data);
      } else {
        console.error('Error fetching simulation:', data);
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
  },
  async updateSimulation(simulationId, updates) {
    try {
      const response = await fetch(`${BACKEND_URL}/simulations/${simulationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Simulation updated successfully:', data);
      } else {
        console.error('Error updating simulation:', data);
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
  },
  async deleteSimulation(simulationId) {
    try {
      const response = await fetch(`${BACKEND_URL}/simulations/${simulationId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Simulation deleted successfully:', data);
      } else {
        console.error('Error deleting simulation:', data);
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
  },
  async getAllSimulations() {
    try {
      const response = await fetch(`${BACKEND_URL}/simulations`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (response.ok) {
        console.log('All simulations fetched successfully:', data);
      } else {
        console.error('Error fetching simulations:', data);
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
  },
  async runSimulationWithInputData(modelVariables) {
    try {
      const response = await fetch(`${BACKEND_URL}/input_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelVariables)
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Simulation completed successfully:', data);
      } else {
        console.error('Error running simulation:', data);
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
  }
}

export default MonteCarloServices;