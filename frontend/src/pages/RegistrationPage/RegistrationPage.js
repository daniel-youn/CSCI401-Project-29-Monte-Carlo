import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import RegistrationForm from '../../components/RegistrationForm/RegistrationForm';
import '../LoginPage/_login-page.scss';  // Use the same SCSS for consistency

const RegistrationPage = () => {
  return (
    <div className="login-page-container">
      {/* Left side with the image or branding */}
      <div className="graph-container">
        <div className="graph-header">
          <Typography variant="h3" className="title">
            CaseFlow
          </Typography>
          <Typography variant="h5" className="subtitle">
            Register to Get Started
          </Typography>
        </div>
      </div>

      {/* Right side with the form */}
      <div className="form-container">
        <Container className="login-box" disableGutters={true}>
          <Typography variant="h4" className="welcome-text">
            Create Your Account
          </Typography>
          <RegistrationForm />
        </Container>
      </div>
    </div>
  );
};

export default RegistrationPage;
