import React from 'react';
import { Box, Grid, Typography, Card, CardContent, TextField, Button } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the required components for the Line chart
ChartJS.register(
  CategoryScale,  // Register the category scale
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Example chart data with fill color under the curve
const chartData = {
  labels: [0, 20, 40, 60, 80, 100],
  datasets: [
    {
      label: 'Value',
      data: [10, 30, 50, 70, 90, 200],
      borderColor: '#00bcd4',
      backgroundColor: 'rgba(0, 188, 212, 0.2)', // Fill color under the curve
      fill: true,  // Enable area fill
      pointBackgroundColor: '#00bcd4',
      pointBorderColor: '#fff',
    },
  ],
};

const chartOptions = {
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      position: 'left',
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      display: false,  // Disable the legend
    },
  },
};
{//implement header: add icon and design, 
  //edit formpage.js to be more modular (must have content component (title and container) )
  //create graph component for form page (extract from this file)
}
const FormSection = () => {
  return (
    <>
      <Grid container spacing={4}>
        {/* Creating 6 graphs across 3 rows */}
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid item xs={12} md={6} key={index}> {/* Each graph and title in the same grid item */}
            {/* Graph Title placed above the graph */}
            <Typography variant="h6" sx={{ color: '#D5D5D5', mb: 2, fontSize: '1.2rem' }}> {/* Increased font size */}
              Estimate the Annual Willingness-to-Pay per Standard User
            </Typography>

            {/* Card containing the graph */}
            <Card sx={{ backgroundColor: '#2b3245' }}>
              <CardContent>
                <Line data={chartData} options={chartOptions} />

                {/* Lower Bound and Upper Bound input boxes */}
                <Grid container spacing={2} sx={{ marginTop: '0.8rem', alignItems: 'flex-end' }}>
                  <Grid item xs={6}>
                    <TextField
                      label="Lower Bound"
                      variant="filled"
                      size="small"  // Make the box smaller
                      InputLabelProps={{
                        style: { color: '#D5D5D5', fontSize: '0.8rem' },  // Smaller label font
                      }}
                      sx={{
                        backgroundColor: '#2b3245',
                        input: { color: '#D5D5D5', fontSize: '0.8rem' },  // Smaller input font
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>  {/* Align to the right */}
                    <TextField
                      label="Upper Bound"
                      variant="filled"
                      size="small"  // Make the box smaller
                      InputLabelProps={{
                        style: { color: '#D5D5D5', fontSize: '0.8rem' },  // Smaller label font
                      }}
                      sx={{
                        backgroundColor: '#2b3245',
                        input: { color: '#D5D5D5', fontSize: '0.8rem' },  // Smaller input font
                        width: '50%',  // Ensure it takes full width within its container
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Submit Button */}
      <Box sx={{ textAlign: 'center', marginTop: '2rem' }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#00bcd4',
            color: 'white',
            padding: '0.8rem 2rem',
            fontSize: '1rem',
            '&:hover': {
              backgroundColor: '#0097a7',
            },
          }}
        >
          Submit
        </Button>
      </Box>
    </>
  );
};

export default FormSection;
