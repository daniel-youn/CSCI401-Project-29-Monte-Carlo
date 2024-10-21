import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Container, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // Import js-cookie to read cookies
import UserService from '../../apis/UserService';

const EditUserForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // New password field
  const [isEditing, setIsEditing] = useState(false); // Editing mode state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch current user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch the userId from the cookie
        const userId = Cookies.get('userId');
        if (!userId) {
          setError('User ID not found in cookies.');
          return;
        }

        const user = await UserService.getUser(userId);
        setFirstName(user.first_name);
        setLastName(user.last_name);
        setEmail(user.email);
      } catch (err) {
        setError('Error fetching user data.');
      }
    };

    fetchUserData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
    };

    // If password is filled in, include it in the update
    if (password) {
      updatedData.password = password;
    }

    try {
      // Fetch the userId from the cookie again to update the user
      const userId = Cookies.get('userId');
      if (!userId) {
        setError('User ID not found in cookies.');
        return;
      }

      await UserService.updateUser(userId, updatedData);
      setSuccess('User info updated successfully!');
      setIsEditing(false); // Exit editing mode after success
    } catch (err) {
      setError('Error updating user data.');
    }
  };

  // Enable edit mode
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Cancel editing and revert changes
  const handleCancelClick = () => {
    setIsEditing(false);
    // Optionally, reset fields back to the fetched user data
  };

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 4,
          padding: 2,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Edit User Info
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* First Name */}
        {!isEditing ? (
          <Typography sx={{ mb: 2 }}>First Name: {firstName}</Typography>
        ) : (
          <TextField
            margin="normal"
            required
            fullWidth
            id="firstName"
            label="First Name"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        )}

        {/* Last Name */}
        {!isEditing ? (
          <Typography sx={{ mb: 2 }}>Last Name: {lastName}</Typography>
        ) : (
          <TextField
            margin="normal"
            required
            fullWidth
            id="lastName"
            label="Last Name"
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        )}

        {/* Email */}
        {!isEditing ? (
          <Typography sx={{ mb: 2 }}>Email: {email}</Typography>
        ) : (
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}

        {/* Password (Optional) */}
        {isEditing && (
          <TextField
            margin="normal"
            fullWidth
            id="password"
            label="New Password (Optional)"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {/* Buttons for editing */}
        {!isEditing ? (
          <Button
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleEditClick}
          >
            Edit Info
          </Button>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleCancelClick}
            >
              Cancel
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default EditUserForm;
