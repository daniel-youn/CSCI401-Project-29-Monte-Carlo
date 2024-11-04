import React, { useState, useEffect } from 'react';
import { Box, Grid, Button, Typography, useTheme, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams to extract projectId
import OverlayGraphForm from '../OverlayGraphForm/OverlayGraphForm';
import MonteCarloServices from '../../apis/MonteCarloServices';
import Cookies from 'js-cookie'; // Make sure to import the js-cookie library

const OverlayFormSection = ({ renderCrossCheck = false, projectID = "N/A", aggregateData = null }) => {
  console.log(renderCrossCheck, projectID)
  console.log(aggregateData)
  const isNumber = (value) => typeof value === 'number' && !isNaN(value);
  const navigate = useNavigate(); // For redirecting after successful submission
  const theme = useTheme(); // For consistent theming
  const { projectId } = useParams(); // Get projectId from the route params
  const [formData, setFormData] = useState({
    willingness_to_pay_standard: {},
    willingness_to_pay_premium: {},
    num_standard_users_per_deal: {},
    num_premium_users_per_deal: {},
    num_deals_year_1: {},
    num_deals_year_2: {},
    num_deals_year_3: {},
    num_deals_year_4: {},
    num_deals_year_5: {},
    expected_discount_per_deal: {},
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false); // State for controlling the modal
  const [userId, setUserId] = useState('');

  const getUserID = () => {
    const storedUserId = Cookies.get('userId');  // Now retrieving from cookies, not session storage
    if (storedUserId) {
      setUserId(storedUserId);  // Set the userId from cookies
    } else {
      setErrorMessage('User not logged in. Please log in.');
    }
  };

  useEffect(() => {
    getUserID();
  }, []);

  const handleFormChange = (key, data) => {
    setFormData((prevState) => ({
      ...prevState,
      [key]: data,
    }));
  };
    
  const isFormComplete = (form) => {
    if (Object.keys(form).length === 0) {
      return false;
    }
  
    if (!form.distribution_type) {
      return false;
    }
  
    if (form.distribution_type === 'normal') {
      return isNumber(form.mean) && isNumber(form.stddev);
    } else if (form.distribution_type === 'uniform') {
      return isNumber(form.min_val) && isNumber(form.max_val);
    } else if (form.distribution_type === 'triangular') {
      return (
        isNumber(form.min_val) &&
        isNumber(form.max_val) &&
        isNumber(form.mode)
      );
    }
  
    return false;
  };
  
  const handleSubmit = () => {
    console.log(formData)
    const allFormsComplete = Object.keys(formData).every((key) => isFormComplete(formData[key]));

    if (allFormsComplete) {
      const finalFormData = {
        user_id: userId,
        project_id: projectId, // Use dynamic projectId from the route
        factors: {
          willingness_to_pay_standard: formData.willingness_to_pay_standard,
          willingness_to_pay_premium: formData.willingness_to_pay_premium,
          num_standard_users_per_deal: formData.num_standard_users_per_deal,
          num_premium_users_per_deal: formData.num_premium_users_per_deal,
          num_deals_per_year_1: formData.num_deals_year_1,
          num_deals_per_year_2: formData.num_deals_year_2,
          num_deals_per_year_3: formData.num_deals_year_3,
          num_deals_per_year_4: formData.num_deals_year_4,
          num_deals_per_year_5: formData.num_deals_year_5,
          expected_discount_per_deal: formData.expected_discount_per_deal,
        }
      };

      setErrorMessage('');
      MonteCarloServices.runSimulationWithInputData(finalFormData)
        .then(() => {
          console.log("Submitted data for all forms: ", finalFormData);
          setSuccessModalOpen(true); // Open the success modal on successful submission
          setTimeout(() => {
            navigate('/my-projects-page'); // Redirect to Project Dashboard after 2 seconds
          }, 2000); // 2-second delay before redirecting
        })
        .catch((error) => {
          setErrorMessage('Submission failed. Please try again.');
          console.error(error);
        });
    } else {
      setErrorMessage('Please fill in all required fields for each form.');
    }
  };

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      <Grid container spacing={4}>
        {/* Render 6 OverlayGraphForms with descriptive keys */}
        <Grid item xs={12} md={6}>
          <OverlayGraphForm
            factorName='willingness_to_pay_standard'
            factorTitle="Willingness to Pay (Standard)"
            aggregateData={aggregateData?.wtp_standard}
            onFormChange={(data) => handleFormChange('willingness_to_pay_standard', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <OverlayGraphForm
            factorName='willingness_to_pay_premium'
            factorTitle="Willingness to Pay (Premium)"
            aggregateData={aggregateData?.wtp_premium}
            onFormChange={(data) => handleFormChange('willingness_to_pay_premium', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <OverlayGraphForm
            factorName='num_standard_users_per_deal'
            factorTitle="Number of Standard Users per Deal"
            aggregateData={aggregateData?.num_standard_users}
            onFormChange={(data) => handleFormChange('num_standard_users_per_deal', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <OverlayGraphForm
            factorName='num_premium_users_per_deal'
            factorTitle="Number of Premium Users per Deal"
            aggregateData={aggregateData?.num_premium_users}
            onFormChange={(data) => handleFormChange('num_premium_users_per_deal', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <OverlayGraphForm
            factorName='expected_discount_per_deal'
            factorTitle="Expected Discount per Deal"
            aggregateData={aggregateData?.discount}
            onFormChange={(data) => handleFormChange('expected_discount_per_deal', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <OverlayGraphForm
            factorName='num_deals_year_1'
            factorTitle="Number of Deals For Year 1"
            aggregateData={aggregateData?.num_deals_year_1}
            onFormChange={(data) => handleFormChange('num_deals_year_1', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <OverlayGraphForm
            factorName='num_deals_year_2'
            factorTitle="Number of Deals For Year 2"
            width={"40rem"}
            height={"30rem"}
            aggregateData={aggregateData?.num_deals_year_2}
            onFormChange={(data) => handleFormChange('num_deals_year_2', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <OverlayGraphForm
            factorName='num_deals_year_3'
            factorTitle="Number of Deals For Year 3"
            aggregateData={aggregateData?.num_deals_year_3}
            onFormChange={(data) => handleFormChange('num_deals_year_3', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <OverlayGraphForm
            factorName='num_deals_year_4'
            factorTitle="Number of Deals For Year 4"
            aggregateData={aggregateData?.num_deals_year_4}
            onFormChange={(data) => handleFormChange('num_deals_year_4', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <OverlayGraphForm
            factorName='num_deals_year_5'
            factorTitle="Number of Deals For Year 5"
            aggregateData={aggregateData?.num_deals_year_5}
            onFormChange={(data) => handleFormChange('num_deals_year_5', data)}
          />
        </Grid>
      </Grid>

      {/* Error Message */}
      {
        errorMessage && (
          <Box sx={{ textAlign: 'center', marginTop: '1rem' }}>
            <Typography variant="body1" color="error">
              {errorMessage}
            </Typography>
          </Box>
        )
      }

      {/* Submit Button */}
      <Box sx={{ textAlign: 'center', marginTop: '2rem' }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            backgroundColor: 'white',
            color: '#0b1225',  // White button with dark text
            fontWeight: 'bold',
            borderRadius: '5px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.8)',  // Slightly translucent white on hover
            },
          }}>
          Submit
        </Button>
      </Box>

      {/* Success Modal */}
      <Dialog open={successModalOpen} onClose={() => setSuccessModalOpen(false)}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Form submission was successful! Redirecting to the Project Dashboard...
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/my-projects-page')} color="primary">
            Go to Dashboard
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default OverlayFormSection;
