import React from 'react';
import { Box } from '@mui/material';
import Header from '../../components/Header/Header'; // Import the Header component
import FormSection from '../../components/FormSection/FormSection'; // Import the FormSection component
import './_form-page.scss'; // Import the custom SCSS


const FormPage = () => {
  return (
    <Box sx={{ backgroundColor: '#0b1225', minHeight: '100vh' }}>
      <Header /> {/* Render the Header */}
      <FormSection /> {/* Render the FormSection */}
    </Box>
  );
};

export default FormPage;
