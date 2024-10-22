import React from 'react';
import { Box } from '@mui/material';
import Header from '../../components/Header/Header'; // Import the Header component
import FormSection from '../../components/FormSection/FormSection'; // Import the FormSection component
import ContentContainer from '../../components/ContentContainer/ContentContainer';
import { useParams } from 'react-router-dom';
const FormPage = () => {
  const { projectId, hasCrossCheck } = useParams();
  console.log(projectId, hasCrossCheck)
  return (
    <Box sx={{ backgroundColor: '#0b1225', minHeight: '100vh' }}>
      <FormSection projectID={projectId} renderCrossCheck={hasCrossCheck} />{/* Render the FormSection */}
    </Box>
  );
};

export default FormPage;
