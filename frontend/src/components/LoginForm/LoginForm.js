import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import UserService from '../../apis/UserService'; // Import UserService

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);  // State to handle error messages
  const navigate = useNavigate();  // Initialize useNavigate hook for navigation

  const handleLogin = async (event) => {
    event.preventDefault();

    // Create the login data object
    const loginData = {
      email,
      password
    };

    try {
      // Call the loginUser function from UserService
      const response = await UserService.loginUser(loginData);
      console.log("Login successful:", response);

      // If login is successful, redirect to the projects page
      navigate('/my-projects-page');  // Navigate to the MyProjectsPage route
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please check your credentials.');  // Set error message on failure
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'left',
          fontFamily: 'HelveticaRegular, sans-serif',
        }}
      >
        {/* Error Message */}
        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Email Input */}
        <TextField
          margin="dense"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputLabelProps={{
            style: { color: '#D5D5D5', fontSize: '0.8rem' },
          }}
          InputProps={{
            style: { color: '#D5D5D5', fontSize: '0.8rem', height: '40px', padding: '10px' },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '0px',
              '& fieldset': {
                borderColor: '#D5D5D5',
              },
              '&:hover fieldset': {
                borderColor: '#D5D5D5',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#D5D5D5',
              },
            },
          }}
        />

        {/* Password Input */}
        <TextField
          margin="dense"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputLabelProps={{
            style: { color: '#D5D5D5', fontSize: '0.8rem' },
          }}
          InputProps={{
            style: { color: '#D5D5D5', fontSize: '0.8rem', height: '40px', padding: '10px' },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '0px',
              '& fieldset': {
                borderColor: '#D5D5D5',
              },
              '&:hover fieldset': {
                borderColor: '#D5D5D5',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#D5D5D5',
              },
            },
          }}
        />

        {/* Sign In Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            mt: 2,
            mb: 1,
            backgroundColor: '#00CDCC',
            color: 'white',
            fontSize: '0.8rem',
            borderRadius: '0px',
            '&:hover': {
              backgroundColor: '#00CDCC',
            },
          }}
        >
          Sign In
        </Button>

        {/* New Account Button */}
        <Button
          component={Link}
          to="/register"
          fullWidth
          variant="outlined"
          sx={{
            mt: 1,
            mb: 2,
            borderColor: '#00CDCC',
            color: 'white',
            fontSize: '0.8rem',
            borderRadius: '0px',
            '&:hover': {
              borderColor: '#00CDCC',
            },
          }}
        >
          New Account
        </Button>
      </Box>
    </Container>
  );
};

export default LoginForm;
