import React, { useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import navigate to programmatically redirect
import Cookies from 'js-cookie'; // Import js-cookie to check for cookies
import LoginForm from '../../components/LoginForm/LoginForm';
import './_login-page.scss'; // Import the custom SCSS

const LoginPage = () => {
  const navigate = useNavigate(); // Initialize navigate for redirection

  useEffect(() => {
    // Check if the userId cookie exists
    const userId = Cookies.get('userId');
    
    // If userId exists, redirect to my-projects-page
    if (userId) {
      navigate('/my-projects-page');
    }
  }, [navigate]); // Run this effect only once when the component mounts

  return (
    <div className="login-page-container">
      {/* Left side with the image */}
      <div className="graph-container">
        <div className="graph-header">
          <Typography variant="h3" className="title">
            CaseFlow
          </Typography>
          <Typography variant="h5" className="subtitle">
            Build Better Business Cases with Confidence
          </Typography>
        </div>
      </div>

      {/* Right side with the form */}
      <div className="form-container">
        <Container className="login-box" disableGutters={true}>
          <Typography variant="h4" className="welcome-text">
            Welcome Back
          </Typography>
          <LoginForm />
        </Container>
      </div>
    </div>
  );
};

export default LoginPage;
