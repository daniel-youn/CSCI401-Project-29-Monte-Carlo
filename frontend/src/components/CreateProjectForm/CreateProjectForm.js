import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, useTheme } from '@mui/material';
import SharingFunctionality from '../SharingFunctionality/SharingFunctionality'; // Import Sharing Functionality component

const CreateProjectForm = () => {
  const [projectName, setProjectName] = useState('');
  const [numSimulations, setNumSimulations] = useState('');
  const [sharedMembers, setSharedMembers] = useState([]); // State to track added members

  const theme = useTheme(); // For consistent theme application

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
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh', padding: '3rem' }}>
      <Container maxWidth="md">
        <Box
          component="form"
          onSubmit={handleProjectSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 5 }}
        >
          <Typography variant="h5" gutterBottom sx={{ color: theme.palette.text.primary }}>
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

          <Button variant="contained" type="submit" 
            sx={{
                backgroundColor: 'white',
                color: '#0b1225',  // White button with dark text
                fontWeight: 'bold',
                borderRadius: '5px',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',  // Slightly translucent white on hover
                }
                }}
            >
            Create Project
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateProjectForm;
