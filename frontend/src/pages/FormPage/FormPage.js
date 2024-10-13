import React from 'react';
import { Box } from '@mui/material';
import Header from '../../components/Header/Header'; // Import the Header component
import FormSection from '../../components/FormSection/FormSection'; // Import the FormSection component
import ContentContainer from '../../components/ContentContainer/ContentContainer';
const FormPage = () => {
  return (
    <Box sx={{ backgroundColor: '#0b1225', minHeight: '100vh' }}>
      <Header /> {/* Render the Header */}
      <ContentContainer title={"My Project One"} backgroundColor={"#232439"}>{/* Container for form section*/}
        <FormSection />{/* Render the FormSection */}
      </ContentContainer>
    </Box>
  );
};

export default FormPage;
