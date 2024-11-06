import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Header from '../../components/Header/Header'; // Import the Header component
import FormSection from '../../components/FormSection/FormSection'; // Import the FormSection component
import ContentContainer from '../../components/ContentContainer/ContentContainer';
import Cookies from 'js-cookie';
import { useParams, useNavigate } from 'react-router-dom';
const FormPage = () => {
  const [hasCrossCheck, setHasCrossCheck] = useState(false);
  const { projectId, hasCrossCheckParam } = useParams();
  const navigate = useNavigate();

  // Function to check if user has cross-check access
  const checkCrossCheckAccess = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/user/users/${userId}`);
      const userData = await response.json();
      console.log("User Data:", userData);

      // Replace this with your actual condition based on user data
      return userData.projects[projectId].access_data.cross_check_access;  // Assuming `hasCrossCheckAccess` is a field in `userData`
    } catch (error) {
      console.error("Error checking cross-check access:", error);
      return false;
    }
  };

  // Use effect to handle async function and navigation
  useEffect(() => {
    const fetchCrossCheckAccess = async () => {
      const storedUserId = Cookies.get('userId');
      if (!storedUserId) {
        console.error("User ID not found in cookies");
        return;
      }

      const access = await checkCrossCheckAccess(storedUserId);
      setHasCrossCheck(access);

      // If URL parameter does not match access, update the URL
      if (String(access) !== hasCrossCheckParam) {
        navigate(`/form/${projectId}/${access}`);
      }
    };

    fetchCrossCheckAccess();
  }, [projectId, hasCrossCheckParam, navigate]); // Dependencies to re-run when projectId or hasCrossCheckParam changes


  return (
    <Box sx={{ backgroundColor: '#0b1225', minHeight: '100vh' }}>
      <FormSection projectID={projectId} renderCrossCheck={hasCrossCheck} />{/* Render the FormSection */}
    </Box>
  );
};

export default FormPage;
