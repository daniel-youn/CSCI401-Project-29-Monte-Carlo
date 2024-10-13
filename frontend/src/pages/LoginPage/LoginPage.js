import React from 'react';
import { Box, Typography, Container, Divider } from '@mui/material';
import LoginForm from '../../components/LoginForm/LoginForm';
import './_login-page.scss'; // Import the custom SCSS

const LoginPage = () => {
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
