import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container } from '@mui/material';
import SharingFunctionality from '../SharingFunctionality/SharingFunctionality'; // Import Sharing Functionality component

const CreateProjectForm = () => {
  const [projectName, setProjectName] = useState('');
  const [numSimulations, setNumSimulations] = useState('');
  const [sharedMembers, setSharedMembers] = useState([]); // State to track added members

  const handleProjectSubmit = (event) => {
    event.preventDefault();
    console.log({
      projectName,
      numSimulations,
      sharedMembers,
    });
    // Process form submission
  };

  return (
    <Container maxWidth="sm">
      <Box
        component="form"
        onSubmit={handleProjectSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 5 }}
      >
        <Typography variant="h5" gutterBottom>
          Create a New Project
        </Typography>

        {/* Project Name Input */}
        <TextField
          label="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
          fullWidth
        />

        {/* Number of Simulations Input */}
        <TextField
          label="Number of Simulations"
          value={numSimulations}
          onChange={(e) => setNumSimulations(e.target.value)}
          type="number"
          required
          fullWidth
        />

        {/* Sharing Functionality */}
        <SharingFunctionality
          sharedMembers={sharedMembers}
          setSharedMembers={setSharedMembers}
        />

        <Button variant="contained" type="submit">
          Create Project
        </Button>
      </Box>
    </Container>
  );
};

export default CreateProjectForm;
