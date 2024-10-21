import React from 'react';
import EditUserForm from '../../components/EditUserForm/EditUserForm';  // Import the form
import { useParams } from 'react-router-dom';  // To get the userId from the URL if needed
import Header from '../../components/Header/Header';  // Import the Header component
import { Box } from '@mui/material';  // Import Box for consistent layout

const EditUserPage = () => {
  const { userId } = useParams();  // Assume you are passing userId in the URL params

  return (
    <Box>
      <Box sx={{ padding: '2rem' }}>
        <EditUserForm userId={userId} />  {/* Pass userId to the form */}
      </Box>
    </Box>
  );
};

export default EditUserPage;
