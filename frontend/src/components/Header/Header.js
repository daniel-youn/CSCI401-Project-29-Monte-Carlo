import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // Import js-cookie to retrieve and remove the cookie

const Header = () => {
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve userId from the cookie
    const storedUserId = Cookies.get('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleEditPage = () => {
    navigate(`/edit-user/${userId}`);
  };

  const handleLogout = () => {
    // Remove the userId cookie
    Cookies.remove('userId');
    // Redirect to the login page
    navigate('/');
  };

  const handleBackToProjects = () => {
    // Navigate to the My Projects page
    navigate('/my-projects-page');
  };

  return (
    <Box 
      sx={{ 
        backgroundColor: '#0b1225', 
        padding: '1.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}
    >
      {/* Left-aligned title */}
      <Typography variant="h4" sx={{ color: 'white' }}>
        CaseFlow
      </Typography>

      {/* This Box ensures the buttons are pushed to the right */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Right-aligned buttons */}
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        {/* Back to Projects Button */}
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: 'white', 
            color: '#0b1225',  // White button with dark text
            fontWeight: 'bold', 
            borderRadius: '5px', 
            '&:hover': { 
              backgroundColor: 'rgba(255, 255, 255, 0.8)',  // Slightly translucent white on hover
            }
          }} 
          onClick={handleBackToProjects}
        >
          My Projects
        </Button>

        {/* Edit Profile Button */}
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: 'white', 
            color: '#0b1225',  // White button with dark text
            fontWeight: 'bold', 
            borderRadius: '5px', 
            '&:hover': { 
              backgroundColor: 'rgba(255, 255, 255, 0.8)',  // Slightly translucent white on hover
            }
          }} 
          onClick={handleEditPage}
          disabled={!userId} // Disable if userId is not available
        >
          Edit Profile
        </Button>

        {/* Logout Button */}
        <Button 
          variant="outlined" 
          sx={{ 
            color: 'white', 
            borderColor: 'white', 
            fontWeight: 'bold',
            '&:hover': { 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',  // Slightly translucent on hover
            }
          }} 
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Header;
