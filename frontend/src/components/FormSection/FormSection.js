import React, { useState, useEffect } from 'react';
import { Box, Grid, Button, Typography, useTheme, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import GraphForm from '../GraphForm/GraphForm';
import MonteCarloServices from '../../apis/MonteCarloServices';
import Cookies from 'js-cookie';

const FormSection = ({ renderCrossCheck = false, projectID = "N/A" }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { projectId } = useParams();
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
    initial_market_size: {},
    year_over_year_growth_rate: {}
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [openAdminDialog, setOpenAdminDialog] = useState(false);
  const [countdown, setCountdown] = useState(3); // Countdown for redirect

  const getUserID = () => {
    const storedUserId = Cookies.get('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      checkAdminStatus(storedUserId);
    } else {
      setErrorMessage('User not logged in. Please log in.');
    }
  };

  const checkAdminStatus = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/user/users/${userId}`);
      const userData = await response.json();
      if (userData.is_admin) {
        setIsAdmin(true);
        setOpenAdminDialog(true); // Show admin restriction dialog
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
          navigate('/'); // Redirect to homepage or other page after countdown
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    getUserID();
  }, []);

  const handleFormChange = (key, data) => {
    setFormData((prevState) => ({
      ...prevState,
      [key]: data
    }));
  };

  const isFormComplete = (form) => {
    if (Object.keys(form).length === 0) {
      return true;
    }
    if (form.mean && form.stddev) return true;
    if (form.min_val && form.max_val) return true;
    if (form.min_val && form.max_val && form.mode) return true;
    return false;
  };

  const handleSubmit = () => {
    const allFormsComplete = Object.keys(formData).every((key) => isFormComplete(formData[key]));

    if (allFormsComplete) {
      const finalFormData = {
        user_id: userId,
        project_id: projectId,
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
          initial_market_size: formData.initial_market_size,
          yoy_growth_rate: formData.year_over_year_growth_rate
        }
      };

      setErrorMessage('');
      MonteCarloServices.runSimulationWithInputData(finalFormData)
        .then(() => {
          console.log("Submitted data for all forms: ", finalFormData);
          setSuccessModalOpen(true);
          setTimeout(() => {
            navigate('/my-projects-page');
          }, 2000);
        })
        .catch((error) => {
          setErrorMessage('Submission failed. Please try again.');
          console.error(error);
        });
    } else {
      setErrorMessage('Please fill in all required fields for each form.');
    }
  };

  if (isAdmin) {
    return null; // Prevents rendering the component if the user is an admin
  }

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, padding: '3rem', minHeight: '100vh' }}>
      <Grid container spacing={4}>
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
            percentageInput={true} // Added this line
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
        {renderCrossCheck && (
          <>
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
          </>
        )}
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
            backgroundColor: 'white',
            color: '#0b1225',
            fontWeight: 'bold',
            borderRadius: '5px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
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

      {/* Admin Restriction Dialog */}
      <Dialog open={openAdminDialog} onClose={() => navigate('/')}>
        <DialogContent>
          <Typography sx={{ fontSize: '1rem', color: theme.palette.text.primary, textAlign: 'center' }}>
            Admins are not allowed to access this page. Redirecting in {countdown} seconds...
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

export default FormSection;
