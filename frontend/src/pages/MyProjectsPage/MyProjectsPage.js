import React from 'react';
import { Box } from '@mui/material';
import Header from '../../components/Header/Header'; // Your existing Header component
import ProjectDashboard from '../../components/ProjectDashboard/ProjectDashboard'; // Updated ProjectView component

const MyProjectsPage = () => {
  return (
    <Box sx={{ backgroundColor: '#0b1225', minHeight: '100vh' }}>
      <ProjectDashboard /> {/* Render the updated ProjectView component */}
    </Box>
  );
};

export default MyProjectsPage;
