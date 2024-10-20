import React, { useState } from 'react';
import { Box, Grid, Button, Typography } from '@mui/material';
import GraphForm from '../GraphForm/GraphForm';
import MonteCarloServices from '../../apis/MonteCarloServices';
//mock simulation id
const mock_sim_id = "sim_123";
const mock_user_id = "user_123";
const FormSection = () => {
  // State to hold the input data for all six GraphForms
  const [formData, setFormData] = useState({
    willingness_to_pay_standard: {},
    willingness_to_pay_premium: {},
    num_standard_users_per_deal: {},
    num_premium_users_per_deal: {},
    num_deals_per_year: {},
    expected_discount_per_deal: {}
  });

  // State to handle error message
  const [errorMessage, setErrorMessage] = useState('');

  // Handler to update the state when a GraphForm's inputs change
  const handleFormChange = (key, data) => {
    setFormData((prevState) => ({
      ...prevState,
      [key]: data
    }));
  };

  // Function to validate if each form has all required inputs filled
  const isFormComplete = (form) => {
    if (form.distribution_type === 'normal') {
      return form.mean && form.stddev;
    } else if (form.distribution_type === 'uniform') {
      return form.min_val && form.max_val;
    }
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
    
      console.log(finalFormData)
      setErrorMessage('');
      MonteCarloServices.runSimulationWithInputData(finalFormData)
      console.log("Submitted data for all forms: ", formData);
      // You can send formData to the server here
    } else {
      Object.keys(formData).forEach((key) => console.log(formData[key]));
      setErrorMessage('Please fill in all required fields for each form.');
    }
  };

  return (
    <>
      <Grid container spacing={2}>
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
          factorName='num_deals_per_year'
            factorTitle="Number of Deals per Year"
            width={"40rem"}
            height={"30rem"}
            onFormChange={(data) => handleFormChange('num_deals_per_year', data)}
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
      </Grid>

      {/* Error Message */}
      {errorMessage && (
        <Box sx={{ textAlign: 'center', marginTop: '1rem' }}>
          <Typography variant="body1" color="error">
            {errorMessage}
          </Typography>
        </Box>
      )}

      {/* Submit Button */}
      <Box sx={{ textAlign: 'center', marginTop: '2rem' }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            backgroundColor: '#00bcd4',
            color: 'white',
            padding: '0.8rem 2rem',
            fontSize: '1rem',
            '&:hover': {
              backgroundColor: '#0097a7'
            }
          }}
        >
          Submit All Forms
        </Button>
      </Box>
    </>
  );
};

export default FormSection;
