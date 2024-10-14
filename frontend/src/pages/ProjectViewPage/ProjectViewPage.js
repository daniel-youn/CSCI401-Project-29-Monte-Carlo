import React from 'react';
import { Box } from '@mui/material';
import Header from '../../components/Header/Header'; // Import the Header component
import ProjectView from '../../components/ProjectView/ProjectView'; // Import the ProjectView component
import ContentContainer from '../../components/ContentContainer/ContentContainer';
const ProjectViewPage = () => {
  return (
    <Box sx={{ backgroundColor: '#0b1225', minHeight: '100vh' }}>
      <Header /> {/* Render the Header */}
      <ContentContainer title={"My Project One"} contentBackgroundColor={"#232439"} padding={"2rem"} contentPadding={"0rem"} marginTop={"1rem"}>{/* Container for form section*/}
        <ProjectView />{/* Render the FormSection */}
      </ContentContainer>
    </Box>
  );
};

export default ProjectViewPage;
