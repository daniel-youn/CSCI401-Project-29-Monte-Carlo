import React from 'react';
import { Box } from '@mui/material';
import Header from '../../components/Header/Header'; // Your existing Header component
import ProjectView from '../../components/ProjectView/ProjectView'; // Updated ProjectView component

const ProjectViewPage = () => {
  return (
    <Box sx={{ backgroundColor: '#0b1225', minHeight: '100vh' }}>
      <Header /> {/* Keep your existing header */}
      <ProjectView /> {/* Render the updated ProjectView component */}
    </Box>
  );
};

export default ProjectViewPage;
