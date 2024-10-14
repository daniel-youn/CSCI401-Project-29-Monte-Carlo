import React, { useState } from 'react';
import { Box, Grid, Button, Typography } from '@mui/material';
import GraphForm from '../GraphForm/GraphForm';

const FormSection = () => {
  // State to hold the input data for all six GraphForms
  const [formData, setFormData] = useState({
    form1: {},
    form2: {},
    form3: {},
    form4: {},
    form5: {},
    form6: {}
  });

  // State to handle error message
  const [errorMessage, setErrorMessage] = useState('');

  // Handler to update the state when a GraphForm's inputs change
  const handleFormChange = (index, data) => {
    setFormData((prevState) => ({
      ...prevState,
      [`form${index}`]: data
    }));
  };

  // Function to validate if each form has all required inputs filled
  const isFormComplete = (form) => {
    if (form.distributionType === 'normal') {
      return form.mean && form.stdDev;
    } else if (form.distributionType === 'uniform') {
      return form.min && form.max;
    }
    return false;
  };

  // Handler to submit all form data together
  const handleSubmit = () => {
    const allFormsComplete = Object.keys(formData).every((key) => isFormComplete(formData[key]));

    if (allFormsComplete) {
      console.log("Submitted data for all forms: ", formData);
      setErrorMessage('');
      // You can send formData to the server here
    } else {
      Object.keys(formData).forEach((key) => console.log(formData[key]));

      setErrorMessage('Please fill in all required fields for each form.');
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        {/* Render 6 GraphForms */}
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid item xs={12} md={6} key={index}>
            <GraphForm
              factorTitle={`Factor ${index + 1}`}
              width={"40rem"}
              height={"30rem"}
              onFormChange={(data) => handleFormChange(index + 1, data)} // Pass form data to the handler
            />
          </Grid>
        ))}
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
