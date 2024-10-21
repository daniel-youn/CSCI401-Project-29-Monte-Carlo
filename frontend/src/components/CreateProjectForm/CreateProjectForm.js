import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Container, useTheme } from '@mui/material';
import SharingFunctionality from '../SharingFunctionality/SharingFunctionality'; // Import Sharing Functionality component
import Cookies from 'js-cookie'; // Import js-cookie to retrieve the userId

const CreateProjectForm = () => {
  const [projectName, setProjectName] = useState('');
  const [numSimulations, setNumSimulations] = useState('');
  const [sharedMembers, setSharedMembers] = useState([]); // State to track added members
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [userId, setUserId] = useState(null); // State to store the userId from cookies

  const theme = useTheme(); // For consistent theme application

  // Get userId from cookies when the component mounts
  useEffect(() => {
    const storedUserId = Cookies.get('userId'); // Get the userId from cookies
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

    // Data to send to the backend
    const projectData = {
      project_name: projectName,
      num_simulations: numSimulations,
      shared_users: sharedMembers,
      admin_user_id: userId, // Use userId from cookies
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

          {/* Display Success or Error Message */}
          {successMessage && <Typography variant="body1" color="success.main">{successMessage}</Typography>}
          {errorMessage && <Typography variant="body1" color="error.main">{errorMessage}</Typography>}

          <Button variant="contained" type="submit" 
            sx={{
                backgroundColor: 'white',
                color: '#0b1225',  // White button with dark text
                fontWeight: 'bold',
                borderRadius: '5px',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',  // Slightly translucent white on hover
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
