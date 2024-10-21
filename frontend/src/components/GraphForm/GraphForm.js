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

const GraphForm = ({ factorName = "factor_name ", factorTitle = "Factor i", width = "40rem", height = "30rem", onFormChange }) => {
  const [distributionType, setDistributionType] = useState('');
  const [values, setValues] = useState({ mean: '', stddev: '', min_val: '', max_val: '', mode: '' });
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
    { value: 'triangular', label: 'Triangular Distribution' }, // New Triangular option
  ];

  const handleDistributionChange = (e) => {
    setDistributionType(e.target.value);

    if (e.target.value === "uniform") {
      setValues({ factor_name: factorName, distribution_type: e.target.value, min_val: '', max_val: '' });
      onFormChange({ factor_name: factorName, distribution_type: e.target.value, min_val: '', max_val: '' });
    } else if (e.target.value === "normal") {
      setValues({ factor_name: factorName, distribution_type: e.target.value, mean: '', stddev: '' });
      onFormChange({ factor_name: factorName, distribution_type: e.target.value, mean: '', stddev: '' });
    } else if (e.target.value === "triangular") {
      setValues({ factor_name: factorName, distribution_type: e.target.value, min_val: '', max_val: '', mode: '' });
      onFormChange({ factor_name: factorName, distribution_type: e.target.value, min_val: '', max_val: '', mode: '' });
    } else {
      setValues({ factor_name: factorName, distribution_type: e.target.value });
      onFormChange({ factor_name: factorName, distribution_type: e.target.value });
    }

    setChartData(emptyChartData());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = parseFloat(value);

    const updatedValues = {
      ...values,
      [name]: isNaN(parsedValue) ? '' : parsedValue // Check if the input is a valid number
    };

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

    if (distributionType === 'normal' && values.mean && values.stddev) {
      const mean = parseFloat(values.mean);
      const stddev = parseFloat(values.stddev);
      const startX = mean - 3 * stddev; // Start at mean - 3 * stddev
      const endX = mean + 3 * stddev; // End at mean + 3 * stddev
      const step = (endX - startX) / numPoints; // Step size between points

      const labels = Array.from({ length: numPoints }, (_, i) => (startX + i * step).toFixed(2)); // X-axis labels

      data = labels.map(x => {
        const z = (x - mean) / stddev; // Standardize the value
        return Math.exp(-0.5 * z * z) / (stddev * Math.sqrt(2 * Math.PI)); // PDF of Normal Distribution
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
    } else if (distributionType === 'uniform' && values.min_val && values.max_val) {
      const min_val = parseFloat(values.min_val);
      const max_val = parseFloat(values.max_val);
      const uniformHeight = 1 / (max_val - min_val); // Height of the uniform PDF
      const labels = Array.from({ length: numPoints }, (_, i) => (min_val + ((max_val - min_val) / numPoints) * i).toFixed(2));

      data = labels.map(x => (x >= min_val && x <= max_val ? uniformHeight : 0));

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
    } else if (distributionType === 'triangular' && values.min_val && values.max_val && values.mode) {
      const min_val = parseFloat(values.min_val);
      const max_val = parseFloat(values.max_val);
      const mode = parseFloat(values.mode);
      const labels = Array.from({ length: numPoints }, (_, i) => (min_val + ((max_val - min_val) / numPoints) * i).toFixed(2));

      data = labels.map(x => {
        const val = parseFloat(x);
        if (val < min_val || val > max_val) return 0;
        if (val < mode) return (2 * (val - min_val)) / ((max_val - min_val) * (mode - min_val));
        return (2 * (max_val - val)) / ((max_val - min_val) * (max_val - mode));
      });

      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Triangular Distribution',
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
              name="stddev"
              value={values.stddev}
              onChange={handleInputChange}
              sx={{ margin: 1 }}
            />
          </>
        );
      case 'uniform':
        return (
          <>
            <TextField
              label="Minimum Value"
              name="min_val"
              value={values.min_val}
              onChange={handleInputChange}
              sx={{ margin: 1 }}
            />
            <TextField
              label="Maximum Value"
              name="max_val"
              value={values.max_val}
              onChange={handleInputChange}
              sx={{ margin: 1 }}
            />
          </>
        );
      case 'triangular':
        return (
          <>
            <TextField
              label="Minimum Value"
              name="min_val"
              value={values.min_val}
              onChange={handleInputChange}
              sx={{ margin: 1 }}
            />
            <TextField
              label="Maximum Value"
              name="max_val"
              value={values.max_val}
              onChange={handleInputChange}
              sx={{ margin: 1 }}
            />
            <TextField
              label="Mode"
              name="mode"
              value={values.mode}
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

export default GraphForm;
