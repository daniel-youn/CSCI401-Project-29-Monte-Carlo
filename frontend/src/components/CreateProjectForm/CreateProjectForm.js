import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Container, useTheme, Dialog, DialogContent, DialogActions } from '@mui/material';
import SharingFunctionality from '../SharingFunctionality/SharingFunctionality';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const CreateProjectForm = () => {
  const [projectName, setProjectName] = useState('');
  const [numSimulations, setNumSimulations] = useState(0);
  const [sharedMembers, setSharedMembers] = useState([]); 
  const [successMessage, setSuccessMessage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openDialog, setOpenDialog] = useState(false); // Dialog state for non-admin warning
  const [countdown, setCountdown] = useState(3); // Countdown timer for redirect

  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = Cookies.get('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      checkAdminStatus(storedUserId);
    }
  }, []);

  const checkAdminStatus = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/user/users/${userId}`);
      const userData = await response.json();
      if (userData.is_admin) {
        setIsAdmin(true);
      } else {
        setOpenDialog(true); // Open dialog for non-admin users
        startCountdown();
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/'); // Redirect after countdown ends
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();

    if (!userId || !isAdmin) {
      return;
    }

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
      } else {
        const result = await response.json();
        setSuccessMessage(result.error || 'Error creating project');
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      setSuccessMessage('An error occurred while creating the project.');
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

          {isAdmin && (
            <>
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
            </>
          )}
        </Box>
      </Container>

      {/* Dialog for non-admin warning */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogContent>
          <Typography sx={{ fontSize: '1rem', color: theme.palette.text.primary, textAlign: 'center' }}>
            You are not an admin and cannot create a new project. Redirecting in {countdown} seconds...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/')} color="primary">
            Go to Home
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateProjectForm;
