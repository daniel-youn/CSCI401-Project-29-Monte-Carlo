import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Container, useTheme } from '@mui/material';
import SharingFunctionality from '../SharingFunctionality/SharingFunctionality';
import Cookies from 'js-cookie';

const CreateProjectForm = () => {
  const [projectName, setProjectName] = useState('');
  const [numSimulations, setNumSimulations] = useState(0);
  const [sharedMembers, setSharedMembers] = useState([]); 
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [userId, setUserId] = useState(null); 

  const theme = useTheme();

  useEffect(() => {
    const storedUserId = Cookies.get('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleProjectSubmit = async (event) => {
    event.preventDefault();

    if (!userId) {
      setErrorMessage('User ID not found. Please log in.');
      return;
    }

    // Log sharedMembers to check the format before sending
    console.log('sharedMembers before sending:', sharedMembers);

    const projectData = {
      project_name: projectName,
      num_simulations: numSimulations,
      shared_users: sharedMembers,
      admin_user_id: userId,
    };

    try {
      const response = await fetch('http://localhost:5001/api/project/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(`Project created successfully with ID: ${result.project_id}`);
        setErrorMessage(null);
      } else {
        const result = await response.json();
        setErrorMessage(result.error || 'Error creating project');
        setSuccessMessage(null);
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      setErrorMessage('An error occurred while creating the project.');
      setSuccessMessage(null);
    }
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

          <TextField
            label="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Number of Simulations"
            value={numSimulations}
            onChange={(e) => setNumSimulations(parseInt(e.target.value, 10) || 0)}
            type="number"
            required
            fullWidth
          />


          <SharingFunctionality
            sharedMembers={sharedMembers}
            setSharedMembers={setSharedMembers}
          />

          {successMessage && <Typography variant="body1" color="success.main">{successMessage}</Typography>}
          {errorMessage && <Typography variant="body1" color="error.main">{errorMessage}</Typography>}

          <Button variant="contained" type="submit" 
            sx={{
                backgroundColor: 'white',
                color: '#0b1225',
                fontWeight: 'bold',
                borderRadius: '5px',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                }
            }}>
            Create Project
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateProjectForm;
