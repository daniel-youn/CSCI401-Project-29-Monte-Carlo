// Define the base API URL for the backend
const API_URL = 'http://localhost:5001/api/user';

const UserService = {
  // Function to create a new user
  async createUser(userData) {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const result = await response.json();
      if (response.ok) {
        console.log('User created successfully:', result);
        return result;
      } else {
        console.error('Error creating user:', result);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  },

  // Function to retrieve a user by user ID
  async getUser(userId) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (response.ok) {
        console.log('User retrieved:', result);
        return result;
      } else {
        console.error('Error retrieving user:', result);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  },

  // Function to update a user's information
  async updateUser(userId, updatedData) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      const result = await response.json();
      if (response.ok) {
        console.log('User updated successfully:', result);
        return result;
      } else {
        console.error('Error updating user:', result);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  },

  // Function to delete a user by user ID
  async deleteUser(userId) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (response.ok) {
        console.log('User deleted successfully:', result);
        return result;
      } else {
        console.error('Error deleting user:', result);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  },

  // Function to log in a user
  async loginUser(loginData) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      const result = await response.json();
      if (response.ok) {
        console.log('Login successful:', result);
        return result;
      } else {
        console.error('Error logging in:', result);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  },
};

export default UserService;
