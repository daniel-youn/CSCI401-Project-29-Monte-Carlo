import React, { useState } from 'react';
import { Box, Divider, Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material';
import ProjectForm from '../../components/ProjectForm/ProjectForm';
import ProjectThumbnail from '../../components/ProjectThumbnail/ProjectThumbnail';

const MyProjectsPage = () => {
  const [openForm, setOpenForm] = useState(false);

  const handleOpenForm = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const projects = [
    {
      projectName: 'Project Alpha',
      description: 'A description for Project Alpha.',
      contributors: 10,
    },
    {
      projectName: 'Project Beta',
      description: 'A description for Project Beta.',
      contributors: 5,
    },
    {
      projectName: 'Project Gamma',
      description: 'A description for Project Gamma.',
      contributors: 8,
    },
    {
      projectName: 'Project Delta',
      description: 'A description for Project Delta.',
      contributors: 3,
    },
    {
      projectName: 'Project Epsilon',
      description: 'A description for Project Epsilon.',
      contributors: 15,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Page Header */}
      <Typography variant="h4" gutterBottom>
        My Projects
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {/* Grid to organize projects */}
      <Grid container spacing={4}>
        {projects.map((project, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <ProjectThumbnail
              projectName={project.projectName}
              description={project.description}
              contributors={project.contributors}
              onMoreDetails={() => console.log(`Details for ${project.projectName}`)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Button to open the new form */}
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" color="primary" onClick={handleOpenForm}>
          Start a New Project
        </Button>
      </Box>

      {/* Dialog for the form */}
      <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="sm">
        <DialogTitle>Start a New Project</DialogTitle>
        <DialogContent>
          <ProjectForm />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyProjectsPage;
