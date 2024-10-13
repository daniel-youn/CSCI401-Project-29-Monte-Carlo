import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (event) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log("Email:", email, "Password:", password);
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
          fontFamily: 'HelveticaRegular, sans-serif', // Apply Helvetica Regular font
        }}
      >
        {/* Smaller Input Boxes with Square Edges */}
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
            style: { color: '#D5D5D5', fontSize: '0.8rem' }, // Smaller label font size
          }}
          InputProps={{
            style: { color: '#D5D5D5', fontSize: '0.8rem', height: '40px', padding: '10px' }, // Adjust padding for proper alignment
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '0px', // Square edges for input box
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
            style: { color: '#D5D5D5', fontSize: '0.8rem' }, // Smaller label font size
          }}
          InputProps={{
            style: { color: '#D5D5D5', fontSize: '0.8rem', height: '40px', padding: '10px' }, // Adjust padding for proper alignment
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '0px', // Square edges for input box
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

        {/* Sign In Button with Green Background */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            mt: 2,
            mb: 1,
            backgroundColor: '#00CDCC', // Green background color
            color: 'white',
            fontSize: '0.8rem', // Smaller button text size
            borderRadius: '0px', // Square edges for button
            '&:hover': {
              backgroundColor: '#00CDCC', // Darker green on hover
            },
          }}
        >
          Sign In
        </Button>

        {/* New Account Button with Green Border */}
        <Button
          component={Link}
          to="/register"
          fullWidth
          variant="outlined"
          sx={{
            mt: 1,
            mb: 2,
            borderColor: '#00CDCC', // Green border color
            color: 'white',
            fontSize: '0.8rem', // Smaller button text size
            borderRadius: '0px', // Square edges for button
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
