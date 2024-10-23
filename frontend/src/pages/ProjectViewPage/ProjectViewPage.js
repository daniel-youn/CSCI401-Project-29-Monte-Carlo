import React from 'react';
import { Box } from '@mui/material';
import Header from '../../components/Header/Header'; // Your existing Header component
import ProjectView from '../../components/ProjectView/ProjectView'; // Updated ProjectView component

const ProjectViewPage = () => {
  return (
    <Box>
      <ProjectView /> {/* Render the updated ProjectView component */}
    </Box>
  );
};

export default ProjectViewPage;
