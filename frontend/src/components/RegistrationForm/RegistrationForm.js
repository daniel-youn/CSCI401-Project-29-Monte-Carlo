import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container, Alert, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from react-router-dom
import UserService from '../../apis/UserService';
import '../../pages/LoginPage/_login-page.scss';  // Use the same SCSS for consistency

const RegistrationForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();  // Use useNavigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setSuccess('');
    } else {
      setError('');
      try {
        // Call UserService to create a new user
        await UserService.createUser({
          email: email,
          user_id: email,
          password: password,
          first_name: firstName,
          last_name: lastName,
        });
        setSuccess('User registered successfully!');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');

        // Wait for 2 seconds before redirecting to login page
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error) {
        setError('Error registering user.');
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleSubmit}
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

        {success && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* First Name Input */}
        <TextField
          margin="dense"
          required
          fullWidth
          id="firstName"
          label="First Name"
          name="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
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

        {/* Last Name Input */}
        <TextField
          margin="dense"
          required
          fullWidth
          id="lastName"
          label="Last Name"
          name="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
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

        {/* Email Input */}
        <TextField
          margin="dense"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
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

        {/* Confirm Password Input */}
        <TextField
          margin="dense"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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

        {/* Register Button */}
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
          Register
        </Button>

        {/* Already have an account link */}
        <Button
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
          onClick={() => navigate('/')} // Use navigate to programmatically redirect
        >
          Already have an account? Login here
        </Button>
      </Box>
    </Container>
  );
};

export default RegistrationForm;
