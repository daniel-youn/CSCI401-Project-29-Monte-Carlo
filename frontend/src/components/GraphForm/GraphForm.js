import React, { useState, useEffect } from 'react';
import { Box, Typography, MenuItem, TextField, Grid, Paper, useTheme } from '@mui/material';
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

const GraphForm = ({ factorName = "factor_name", factorTitle = "Factor i", width = "40rem", height = "30rem", onFormChange }) => {
  const theme = useTheme(); // To use consistent theme styles

  const [distributionType, setDistributionType] = useState('');
  const [values, setValues] = useState({ mean: '', stddev: '', min_val: '', max_val: '', mode: '' });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Distribution',
        data: [],
        borderColor: theme.palette.primary.main, // Use theme color
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        fill: true
      }
    ]
  });

  const distributionOptions = [
    { value: 'normal', label: 'Normal Distribution' },
    { value: 'uniform', label: 'Uniform Distribution' },
    { value: 'triangular', label: 'Triangular Distribution' },
  ];

  const handleDistributionChange = (e) => {
    setDistributionType(e.target.value);
    const defaultValues = { mean: '', stddev: '', min_val: '', max_val: '', mode: '' };

    if (e.target.value === "uniform") {
      setValues({
        ...defaultValues,
        min_val: values.min_val,
        max_val: values.max_val,
        distribution_type: e.target.value
      });
    } else if (e.target.value === "normal") {
      setValues({
        ...defaultValues,
        mean: values.mean,
        stddev: values.stddev,
        distribution_type: e.target.value
      });
    } else if (e.target.value === "triangular") {
      setValues({
        ...defaultValues,
        min_val: values.min_val,
        max_val: values.max_val,
        mode: values.mode,
        distribution_type: e.target.value
      });
    }

    setChartData(emptyChartData());
    onFormChange({ ...values, distribution_type: e.target.value });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = parseFloat(value);
    const updatedValues = { ...values, [name]: isNaN(parsedValue) ? '' : parsedValue };
    setValues(updatedValues);
    onFormChange(updatedValues);
  };

  const emptyChartData = () => ({
    labels: Array.from({ length: 100 }, (_, i) => i),
    datasets: [
      {
        label: 'Distribution',
        data: Array(100).fill(null),
        borderColor: theme.palette.primary.main,
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        fill: true
      }
    ]
  });

  const generateDistributionShape = () => {
    let data = [];
    const numPoints = 100;

    if (distributionType === 'normal' && values.mean && values.stddev) {
      const mean = parseFloat(values.mean);
      const stddev = parseFloat(values.stddev);
      const startX = mean - 3 * stddev;
      const endX = mean + 3 * stddev;
      const step = (endX - startX) / numPoints;

      const labels = Array.from({ length: numPoints }, (_, i) => (startX + i * step).toFixed(2));

      data = labels.map(x => {
        const z = (x - mean) / stddev;
        return Math.exp(-0.5 * z * z) / (stddev * Math.sqrt(2 * Math.PI));
      });

      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Normal Distribution',
            data: data,
            borderColor: theme.palette.primary.main,
            backgroundColor: 'rgba(0, 188, 212, 0.2)',
            fill: true
          }
        ]
      });
    } else if (distributionType === 'uniform' && values.min_val && values.max_val) {
      const min_val = parseFloat(values.min_val);
      const max_val = parseFloat(values.max_val);
      const uniformHeight = 1 / (max_val - min_val);
      const labels = Array.from({ length: numPoints }, (_, i) => (min_val + ((max_val - min_val) / numPoints) * i).toFixed(2));

      data = labels.map(x => (x >= min_val && x <= max_val ? uniformHeight : 0));

      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Uniform Distribution',
            data: data,
            backgroundColor: 'rgba(0, 188, 212, 0.5)',
            borderColor: theme.palette.primary.main,
            borderWidth: 1,
            fill: true
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
            borderColor: theme.palette.primary.main,
            borderWidth: 1,
            fill: true
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
              sx={{ margin: 1, width: '26%' }}
              inputProps={{ type: 'number', step: 'any' }} // Accept floats
            />
            <TextField
              label="Standard Deviation"
              name="stddev"
              value={values.stddev}
              onChange={handleInputChange}
              sx={{ margin: 1, width: '26%' }}
              inputProps={{ type: 'number', step: 'any' }} // Accept floats
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
              sx={{ margin: 1, width: '26%' }}
              inputProps={{ type: 'number', step: 'any' }} // Accept floats
            />
            <TextField
              label="Maximum Value"
              name="max_val"
              value={values.max_val}
              onChange={handleInputChange}
              sx={{ margin: 1, width: '26%' }}
              inputProps={{ type: 'number', step: 'any' }} // Accept floats
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
              sx={{ margin: 1, width: '26%' }}
              inputProps={{ type: 'number', step: 'any' }} // Accept floats
            />
            <TextField
              label="Maximum Value"
              name="max_val"
              value={values.max_val}
              onChange={handleInputChange}
              sx={{ margin: 1, width: '26%' }}
              inputProps={{ type: 'number', step: 'any' }} // Accept floats
            />
            <TextField
              label="Mode"
              name="mode"
              value={values.mode}
              onChange={handleInputChange}
              sx={{ margin: 1, width: '26%' }}
              inputProps={{ type: 'number', step: 'any' }} // Accept floats
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
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        width: `${width}px`,
        height: `${height}px`,
        overflow: 'auto'
      }}
    >
      <Typography variant="h5" align="center" sx={{ marginBottom: '1rem', color: theme.palette.text.primary }}>
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
                    display: false, // Hide the y-axis
                  },
                  x: {
                    type: 'linear',
                    min: Math.min(...chartData.labels),
                    max: Math.max(...chartData.labels),
                  }
                },
                plugins: {
                  legend: {
                    display: false, // Disable the legend
                  },
                },
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
