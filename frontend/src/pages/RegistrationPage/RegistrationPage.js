import React from 'react';
import { Box, Container } from '@mui/material';
import RegistrationForm from '../../components/RegistrationForm/RegistrationForm';

const RegistrationPage = () => {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <RegistrationForm />
    </Box>
  );
};

export default RegistrationPage;
