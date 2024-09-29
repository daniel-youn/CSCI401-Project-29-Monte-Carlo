import React, { useState } from 'react';
import { Dialog, DialogActions, DialogTitle, DialogContent, Container, Typography, Box, Grid, Divider, Button } from '@mui/material';
import ProjectThumbnail from '../../components/ProjectThumbnail/ProjectThumbnail';
import ProjectForm from '../../components/ProjectForm/ProjectForm';

const MyProjectsPage = () => {
  const [projects, setProjects] = useState([
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
      projectName: 'Project Long',
      description:
        'A long description A long description A long description A long description A long description A long description',
      contributors: 8,
    },
  ]);

  const [openForm, setOpenForm] = useState(false);

  const handleOpenForm = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  return (
    <Container maxWidth="lg">
      {/* Page Title */}
      <Typography variant="h4" gutterBottom>
        My Projects
      </Typography>

      {/* Header for Columns */}
      <Box sx={{ mb: 2, mt: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Project Title Header */}
          <Grid item xs={4}>
            <Typography variant="body1" fontWeight="bold">
              Title
            </Typography>
          </Grid>

          {/* Description Header */}
          <Grid item xs={3}>
            <Typography variant="body1" fontWeight="bold">
              Description
            </Typography>
          </Grid>

          {/* Contributors Header */}
          <Grid item xs={2}>
            <Typography variant="body1" fontWeight="bold" align="center">
              Contributors
            </Typography>
          </Grid>

          {/* Action Button Header */}
          <Grid item xs={3} sx={{ textAlign: 'right' }}>
            <Typography variant="body1" fontWeight="bold">
              Actions
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Project Thumbnails */}
      {projects.map((project, index) => (
        <ProjectThumbnail
          key={index}
          projectName={project.projectName}
          description={project.description}
          contributors={project.contributors}
          onMoreDetails={() => console.log(`More details for ${project.projectName}`)}
        />
      ))}

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
