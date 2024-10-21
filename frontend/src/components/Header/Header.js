import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Header = ({ userId }) => {
  const navigate = useNavigate();

  const handleEditPage = () => {
    navigate(`/edit-user/${userId}`);
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

      {/* This Box ensures the button is pushed to the right */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Right-aligned button */}
      <Button 
        variant="contained" 
        sx={{ backgroundColor: '#00CDCC', color: 'white' }} 
        onClick={handleEditPage}
        disabled={!userId} // Disable if userId is not available
      >
        Edit Profile
      </Button>
    </Box>
  );
};

export default Header;
