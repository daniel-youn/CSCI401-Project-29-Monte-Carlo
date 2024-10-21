import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Container, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserService from '../../apis/UserService'; // Assuming you have an API service

const EditUserForm = ({ userId }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch current user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await UserService.getUser(userId);
        setFirstName(user.first_name);
        setLastName(user.last_name);
        setEmail(user.email);
      } catch (err) {
        setError('Error fetching user data.');
      }
    };

    fetchUserData();
  }, [userId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await UserService.updateUser(userId, {
        first_name: firstName,
        last_name: lastName,
        email: email,
      });

      setSuccess('User info updated successfully!');
      setTimeout(() => {
        navigate('/projects'); // Redirect after successful update
      }, 2000);
    } catch (err) {
      setError('Error updating user data.');
    }
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

        {/* First Name Input */}
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

        {/* Last Name Input */}
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

        {/* Email Input */}
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

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Save Changes
        </Button>
      </Box>
    </Container>
  );
};

export default EditUserForm;
