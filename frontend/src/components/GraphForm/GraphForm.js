import React, { useState, useEffect } from 'react';
import { Box, Typography, MenuItem, TextField, Grid, Paper } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MonteCarloInputForm = ({ factorTitle = "Factor i", width = "40rem", height = "30rem", onFormChange }) => {
  const [distributionType, setDistributionType] = useState('');
  const [values, setValues] = useState({ mean: '', stdDev: '', min: '', max: '', lambda: '' });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Distribution',
        data: [],
        borderColor: '#00bcd4',
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        fill: true
      }
    ]
  });

  const distributionOptions = [
    { value: 'normal', label: 'Normal Distribution' },
    { value: 'uniform', label: 'Uniform Distribution' },
  ];

  const handleDistributionChange = (e) => {
    setDistributionType(e.target.value);
    setValues({ mean: '', stdDev: '', min: '', max: '' });
    setChartData(emptyChartData());
    onFormChange({ distributionType: e.target.value, mean: '', stdDev: '', min: '', max: '' });
  };

  const handleInputChange = (e) => {
    const updatedValues = { ...values, [e.target.name]: e.target.value };
    setValues(updatedValues);
    onFormChange(updatedValues);
  };

  const emptyChartData = () => ({
    labels: Array.from({ length: 100 }, (_, i) => i),
    datasets: [
      {
        label: 'Distribution',
        data: Array(100).fill(null),
        borderColor: '#00bcd4',
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        fill: true
      }
    ]
  });

  const generateDistributionShape = () => {
    let data = [];
    const numPoints = 100; // Number of points for the graph

    if (distributionType === 'normal' && values.mean && values.stdDev) {
      const mean = parseFloat(values.mean);
      const stdDev = parseFloat(values.stdDev);
      const startX = mean - 3 * stdDev; // Start at mean - 3 * stdDev
      const endX = mean + 3 * stdDev; // End at mean + 3 * stdDev
      const step = (endX - startX) / numPoints; // Step size between points

      const labels = Array.from({ length: numPoints }, (_, i) => (startX + i * step).toFixed(2)); // X-axis labels

      data = labels.map(x => {
        const z = (x - mean) / stdDev; // Standardize the value
        return Math.exp(-0.5 * z * z) / (stdDev * Math.sqrt(2 * Math.PI)); // PDF of Normal Distribution
      });

      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Normal Distribution',
            data: data,
            borderColor: '#00bcd4',
            backgroundColor: 'rgba(0, 188, 212, 0.2)',
            fill: true
          }
        ]
      });
    } else if (distributionType === 'uniform' && values.min && values.max) {
      const min = parseFloat(values.min);
      const max = parseFloat(values.max);
      const uniformHeight = 1 / (max - min); // Height of the uniform PDF
      const labels = Array.from({ length: numPoints }, (_, i) => (min + ((max - min) / numPoints) * i).toFixed(2));

      data = labels.map(x => (x >= min && x <= max ? uniformHeight : 0));

      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Uniform Distribution',
            data: data,
            backgroundColor: 'rgba(0, 188, 212, 0.5)',
            borderColor: '#00bcd4',
            borderWidth: 1
          }
        ]
      });
    }
  };


  useEffect(() => {
    generateDistributionShape();
  }, [values, distributionType]);

  const renderInputs = () => {
    switch (distributionType) {
      case 'normal':
        return (
          <>
            <TextField
              label="Mean"
              name="mean"
              value={values.mean}
              onChange={handleInputChange}
              sx={{ margin: 1 }}
            />
            <TextField
              label="Standard Deviation"
              name="stdDev"
              value={values.stdDev}
              onChange={handleInputChange}
              sx={{ margin: 1 }}
            />
          </>
        );
      case 'uniform':
        return (
          <>
            <TextField
              label="Minimum"
              name="min"
              value={values.min}
              onChange={handleInputChange}
              sx={{ margin: 1 }}
            />
            <TextField
              label="Maximum"
              name="max"
              value={values.max}
              onChange={handleInputChange}
              sx={{ margin: 1 }}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Paper
      sx={{
        padding: '2rem',
        backgroundColor: '#2b3245',
        color: '#D5D5D5',
        width: `${width}px`,
        height: `${height}px`,
        overflow: 'auto'
      }}
    >
      <Typography variant="h5" align="center" sx={{ marginBottom: '1rem' }}>
        {factorTitle}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <TextField
          select
          label="Distribution"
          value={distributionType}
          onChange={handleDistributionChange}
          sx={{ width: '50%' }}
        >
          {distributionOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {distributionType && (
        <Box
          sx={{
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: `${width * 0.8}px`,
            height: `${height * 0.4}px`
          }}
        >
          <Box sx={{ width: '100%', height: '100%' }}>
            <Line
              data={chartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true, // Ensure no negative y-values
                  },
                  x: {
                    type: 'linear',
                    min: Math.min(...chartData.labels), // Dynamically adjust the min x-axis value
                    max: Math.max(...chartData.labels), // Dynamically adjust the max x-axis value
                  }
                }
              }}
            />
          </Box>
        </Box>
      )}

      <Grid container spacing={2} justifyContent="center">
        {renderInputs()}
      </Grid>
    </Paper>
  );
};

export default MonteCarloInputForm;
