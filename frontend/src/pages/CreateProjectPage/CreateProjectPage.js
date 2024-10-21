import React from 'react';
import { Box } from '@mui/material';
import Header from '../../components/Header/Header';
import CreateProjectForm from '../../components/CreateProjectForm/CreateProjectForm.js'; // Import the form component
import ContentContainer from '../../components/ContentContainer/ContentContainer';

const CreateProjectPage = () => {
  return (
    <Box sx={{ backgroundColor: '#0b1225', minHeight: '100vh' }}>
        <CreateProjectForm /> {/* Render the Create Project Form */}
    </Box>
  );
};

export default CreateProjectPage;
