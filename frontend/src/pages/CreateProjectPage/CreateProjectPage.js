import React from 'react';
import { Box } from '@mui/material';
import Header from '../../components/Header/Header';
import CreateProjectForm from '../../components/CreateProjectForm/CreateProjectForm'; // Import the form component
import ContentContainer from '../../components/ContentContainer/ContentContainer';

const CreateProjectPage = () => {
  return (
    <Box sx={{ backgroundColor: '#0b1225', minHeight: '100vh' }}>
      <Header /> {/* Render the Header */}
      <ContentContainer
        title={"Create a New Project"}
        contentBackgroundColor={"#232439"}
        padding={"2rem"}
        contentPadding={"0rem"}
        marginTop={"1rem"}
      >
        <CreateProjectForm /> {/* Render the Create Project Form */}
      </ContentContainer>
    </Box>
  );
};

export default CreateProjectPage;
