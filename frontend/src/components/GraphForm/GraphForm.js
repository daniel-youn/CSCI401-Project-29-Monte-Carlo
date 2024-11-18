// GraphForm.js
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

const GraphForm = ({
  factorName = "factor_name",
  factorTitle = "Factor i",
  width = 400, // Changed to number
  height = 300, // Changed to number
  percentageInput = false,
  onFormChange
}) => {
  const theme = useTheme(); // To use consistent theme styles

  const [distributionType, setDistributionType] = useState('');
  const [values, setValues] = useState({ min_val: '', max_val: '', mode: '', mean: 0, stddev: 0 }); // Reintroduced mean and stddev
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

  const [errorMessage, setErrorMessage] = useState('');

  const distributionOptions = [
    { value: 'normal', label: 'Normal Distribution' },
    { value: 'uniform', label: 'Uniform Distribution' },
    { value: 'triangular', label: 'Triangular Distribution' },
  ];

  const handleDistributionChange = (e) => {
    const selectedType = e.target.value;
    setDistributionType(selectedType);
    const defaultValues = { min_val: '', max_val: '', mode: '', mean: 0, stddev: 0 };

    if (selectedType === "uniform") {
      setValues({
        ...defaultValues,
        min_val: values.min_val,
        max_val: values.max_val,
        distribution_type: selectedType
      });
    } else if (selectedType === "normal") {
      setValues({
        ...defaultValues,
        min_val: values.min_val,
        max_val: values.max_val,
        mean: 0, // Initialize mean as 0
        stddev: 0, // Initialize stddev as 0
        distribution_type: selectedType
      });
    } else if (selectedType === "triangular") {
      setValues({
        ...defaultValues,
        min_val: values.min_val,
        max_val: values.max_val,
        mode: values.mode,
        distribution_type: selectedType
      });
    }

    setChartData(emptyChartData());
    // Removed onFormChange call here to prevent sending stale state
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = parseFloat(value);

    if (value === '' || isNaN(parsedValue) || parsedValue < 0) {
      setErrorMessage('Value cannot be negative.');
      parsedValue = '';
    } else if (percentageInput && parsedValue > 1) {
      setErrorMessage('Please enter a value between 0.00 and 1.00.');
      parsedValue = '';
    } else {
      setErrorMessage('');
    }

    const updatedValues = { ...values, [name]: parsedValue === '' ? '' : parsedValue };
    setValues(updatedValues);
    // Removed onFormChange call here to prevent sending stale state
  };

  const emptyChartData = () => ({
    labels: [],
    datasets: [
      {
        label: 'Distribution',
        data: [],
        borderColor: theme.palette.primary.main,
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        fill: true
      }
    ]
  });

  const generateDistributionShape = () => {
    let data = [];
    const numPoints = 100;

    if (distributionType === 'normal' && values.min_val !== '' && values.max_val !== '') {
      const min_val = parseFloat(values.min_val);
      const max_val = parseFloat(values.max_val);

      if (min_val >= max_val) {
        setErrorMessage('Minimum value must be less than Maximum value.');
        return;
      } else {
        setErrorMessage('');
      }

      // Calculate mean and stddev based on min_val and max_val
      const mean = (min_val + max_val) / 2;
      const stddev = (max_val - min_val) / 6; // Assuming min_val = mean - 3*stddev, max_val = mean + 3*stddev

      const startX = min_val;
      const endX = max_val;
      const step = (endX - startX) / numPoints;

      const labels = Array.from({ length: numPoints }, (_, i) => (startX + i * step).toFixed(2));

      data = labels.map(x => {
        const z = (x - mean) / stddev;
        return Math.exp(-0.5 * z * z) / (stddev * Math.sqrt(2 * Math.PI));
      });

      setValues(prevValues => ({
        ...prevValues,
        mean: mean, // Update mean
        stddev: stddev // Update stddev
      }));

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
    } else if (distributionType === 'uniform' && values.min_val !== '' && values.max_val !== '') {
      const min_val = parseFloat(values.min_val);
      const max_val = parseFloat(values.max_val);
      if (min_val > max_val) {
        setErrorMessage('Minimum value cannot be greater than Maximum value.');
        return;
      } else {
        setErrorMessage('');
      }
      const uniformHeight = max_val - min_val !== 0 ? 1 / (max_val - min_val) : 0;
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
    } else if (distributionType === 'triangular' && values.min_val !== '' && values.max_val !== '' && values.mode !== '') {
      const min_val = parseFloat(values.min_val);
      const max_val = parseFloat(values.max_val);
      const mode = parseFloat(values.mode);
      if (min_val > max_val) {
        setErrorMessage('Minimum value cannot be greater than Maximum value.');
        return;
      } else if (mode < min_val || mode > max_val) {
        setErrorMessage('Mode must be between Minimum and Maximum values.');
        return;
      } else {
        setErrorMessage('');
      }
      const labels = Array.from({ length: numPoints }, (_, i) => (min_val + ((max_val - min_val) / numPoints) * i).toFixed(2));

      data = labels.map(x => {
        const val = parseFloat(x);
        if (val < min_val || val > max_val) return 0;
        if (val === mode) return 2 / (max_val - min_val);
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
    } else {
      setChartData(emptyChartData());
    }
  };

  // Use useEffect to call onFormChange whenever 'values' change
  useEffect(() => {
    onFormChange(values);
  }, [values, onFormChange]);

  useEffect(() => {
    generateDistributionShape();
  }, [values, distributionType]);

  const renderInputs = () => {
    const commonInputProps = { type: 'number', step: 'any', min: 0 };
    if (percentageInput) {
      commonInputProps.max = 1;
    }
    switch (distributionType) {
      case 'normal':
        return (
          <>
            <TextField
              label="Minimum Value"
              name="min_val"
              value={values.min_val}
              onChange={handleInputChange}
              sx={{ margin: 1, width: '26%' }}
              inputProps={commonInputProps}
            />
            <TextField
              label="Maximum Value"
              name="max_val"
              value={values.max_val}
              onChange={handleInputChange}
              sx={{ margin: 1, width: '26%' }}
              inputProps={commonInputProps}
            />
            {/* Display mean and stddev as read-only */}
            <TextField
              label="Mean"
              name="mean"
              value={values.mean}
              disabled
              sx={{ margin: 1, width: '26%' }}
              inputProps={{ ...commonInputProps, readOnly: true }}
            />
            <TextField
              label="Standard Deviation"
              name="stddev"
              value={values.stddev}
              disabled
              sx={{ margin: 1, width: '26%' }}
              inputProps={{ ...commonInputProps, readOnly: true }}
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
              inputProps={commonInputProps}
            />
            <TextField
              label="Maximum Value"
              name="max_val"
              value={values.max_val}
              onChange={handleInputChange}
              sx={{ margin: 1, width: '26%' }}
              inputProps={commonInputProps}
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
              inputProps={commonInputProps}
            />
            <TextField
              label="Maximum Value"
              name="max_val"
              value={values.max_val}
              onChange={handleInputChange}
              sx={{ margin: 1, width: '26%' }}
              inputProps={commonInputProps}
            />
            <TextField
              label="Mode"
              name="mode"
              value={values.mode}
              onChange={handleInputChange}
              sx={{ margin: 1, width: '26%' }}
              inputProps={commonInputProps}
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

      {percentageInput && (
        <Typography variant="body2" align="center" color="textSecondary" sx={{ marginBottom: '1rem', color: theme.palette.text.primary }}>
          Please enter a value between 0.00 and 1.00.
        </Typography>
      )}

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
        <>
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
                      min: Math.max(0, Math.min(...chartData.labels)),
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
      
          <Grid container spacing={2} justifyContent="center">
            {renderInputs()}
          </Grid>
      
          {/* Error Message */}
          {errorMessage && (
            <Typography variant="body2" color="error" align="center" sx={{ marginTop: '1rem' }}>
              {errorMessage}
            </Typography>
          )}
        </>
      )}
    </Paper>
  );
};

export default GraphForm;
