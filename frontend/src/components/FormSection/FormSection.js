import React, { useState, useEffect } from 'react';
import { Box, Grid, Button, Typography, useTheme } from '@mui/material';
import GraphForm from '../GraphForm/GraphForm';
import MonteCarloServices from '../../apis/MonteCarloServices';

// Mock simulation and user IDs
const mock_sim_id = "sim_123";
const mock_user_id = "user_123";

const FormSection = () => {
  const theme = useTheme(); // For consistent theming

  // State to hold the input data for all six GraphForms
  const [formData, setFormData] = useState({
    willingness_to_pay_standard: {},
    willingness_to_pay_premium: {},
    num_standard_users_per_deal: {},
    num_premium_users_per_deal: {},
    num_deals_year_1: {}, num_deals_year_2: {}, num_deals_year_3: {}, num_deals_year_4: {}, num_deals_year_5: {},
    expected_discount_per_deal: {},
    initial_market_size: {},
    year_over_year_growth_rate: {}
  });

  // State to handle error message
  const [errorMessage, setErrorMessage] = useState('');
  const [userId, setUserId] = useState(''); // State to hold the current user ID

  // Function to fetch user ID from session storage (or API)
  const getUserID = () => {
    const storedUserId = sessionStorage.getItem('user_id'); // Retrieve user ID from session storage
    if (storedUserId) {
      setUserId(storedUserId); // Set the user ID in state
    } else {
      setErrorMessage('User not logged in. Please log in.');
    }
  };

  // Run the function to fetch the user ID when the component mounts
  useEffect(() => {
    getUserID();
  }, []);

  // Handler to update the state when a GraphForm's inputs change
  const handleFormChange = (key, data) => {
    setFormData((prevState) => ({
      ...prevState,
      [key]: data
    }));
  };

  // Function to validate if each form has all required inputs filled
  const isFormComplete = (form) => {
    if (form.mean && form.stddev) return true; // Validation for 'normal' distribution (distribution key removed)
    if (form.min_val && form.max_val) return true; // Validation for 'uniform'
    if (form.min_val && form.max_val && form.mode) return true; // Validation for 'triangular'
    return false;
  };

  // Handler to submit all form data together
  const handleSubmit = () => {
    const allFormsComplete = Object.keys(formData).every((key) => isFormComplete(formData[key]));

    if (allFormsComplete) {
      const finalFormData = {
        user_id: mock_user_id,  // Add the mock user ID here
        simulation_id: mock_sim_id,  // Add the mock simulation ID here
        factors: {                   // Spread formData under 'factors'
          ...formData
        }
      };

      setErrorMessage('');
      MonteCarloServices.runSimulationWithInputData(finalFormData)
        .then(() => {
          console.log("Submitted data for all forms: ", formData);
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
    <Box sx={{ bgcolor: theme.palette.background.default, padding: '3rem', minHeight: '100vh' }}>
      <Grid container spacing={4}>
        {/* Render 6 GraphForms with descriptive keys */}
        <Grid item xs={12} md={6}>
          <GraphForm
            factorName='willingness_to_pay_standard'
            factorTitle="Willingness to Pay (Standard)"
            width={"40rem"}
            height={"30rem"}
            onFormChange={(data) => handleFormChange('willingness_to_pay_standard', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <GraphForm
            factorName='willingness_to_pay_premium'
            factorTitle="Willingness to Pay (Premium)"
            width={"40rem"}
            height={"30rem"}
            onFormChange={(data) => handleFormChange('willingness_to_pay_premium', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <GraphForm
            factorName='num_standard_users_per_deal'
            factorTitle="Number of Standard Users per Deal"
            width={"40rem"}
            height={"30rem"}
            onFormChange={(data) => handleFormChange('num_standard_users_per_deal', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <GraphForm
            factorName='num_premium_users_per_deal'
            factorTitle="Number of Premium Users per Deal"
            width={"40rem"}
            height={"30rem"}
            onFormChange={(data) => handleFormChange('num_premium_users_per_deal', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <GraphForm
            factorName='expected_discount_per_deal'
            factorTitle="Expected Discount per Deal"
            width={"40rem"}
            height={"30rem"}
            onFormChange={(data) => handleFormChange('expected_discount_per_deal', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <GraphForm
            factorName='num_deals_year_1'
            factorTitle="Number of Deals For Year 1"
            width={"40rem"}
            height={"30rem"}
            onFormChange={(data) => handleFormChange('num_deals_year_1', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <GraphForm
            factorName='num_deals_year_2'
            factorTitle="Number of Deals For Year 2"
            width={"40rem"}
            height={"30rem"}
            onFormChange={(data) => handleFormChange('num_deals_year_2', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <GraphForm
            factorName='num_deals_year_3'
            factorTitle="Number of Deals For Year 3"
            width={"40rem"}
            height={"30rem"}
            onFormChange={(data) => handleFormChange('num_deals_year_3', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <GraphForm
            factorName='num_deals_year_4'
            factorTitle="Number of Deals For Year 4"
            width={"40rem"}
            height={"30rem"}
            onFormChange={(data) => handleFormChange('num_deals_year_4', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <GraphForm
            factorName='num_deals_year_5'
            factorTitle="Number of Deals For Year 5"
            width={"40rem"}
            height={"30rem"}
            onFormChange={(data) => handleFormChange('num_deals_year_5', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <GraphForm
            factorName='initial_market_size'
            factorTitle="Initial Market Size (Year 1)"
            width={"40rem"}
            height={"30rem"}
            onFormChange={(data) => handleFormChange('initial_market_size', data)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <GraphForm
            factorName='year_over_year_growth_rate'
            factorTitle="Year-over-Year Growth Rate"
            width={"40rem"}
            height={"30rem"}
            onFormChange={(data) => handleFormChange('year_over_year_growth_rate', data)}
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
    </Box>
  );
};

export default FormSection;
