//TODO: ADD URL PROPERLY
const UserService = {
  async createUser(userData) {
    try {
      const response = await fetch('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      const result = await response.json();
      if (response.ok) {
        console.log('User created successfully:', result);
      } else {
        console.error('Error creating user:', result);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  },

  async getUser(userId) {
    try {
      const response = await fetch(`/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (response.ok) {
        console.log('User retrieved:', result);
      } else {
        console.error('Error retrieving user:', result);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  },

  async updateUser(userId, updatedData) {
    try {
      const response = await fetch(`/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      const result = await response.json();
      if (response.ok) {
        console.log('User updated successfully:', result);
      } else {
        console.error('Error updating user:', result);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  },

  async deleteUser(userId) {
    try {
      const response = await fetch(`/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (response.ok) {
        console.log('User deleted successfully:', result);
      } else {
        console.error('Error deleting user:', result);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  },

  async loginUser(loginData) {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
      const result = await response.json();
      if (response.ok) {
        console.log('Login successful:', result);
      } else {
        console.error('Error logging in:', result);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
};

export default UserService;
