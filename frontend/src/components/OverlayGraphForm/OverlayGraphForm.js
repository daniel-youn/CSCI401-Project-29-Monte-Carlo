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

const OverlayGraphForm = ({
  factorName = "factor_name",
  factorTitle = "Factor i",
  onFormChange,
  percentageInput = false,
  aggregateData = null,
  width="40rem",
  height="30rem",
}) => {
  const theme = useTheme();

  const [xRange, setXRange] = useState({ min: null, max: null });
  const [distributionType, setDistributionType] = useState('');
  const [values, setValues] = useState({ mean: '', stddev: '', min_val: '', max_val: '', mode: '' });
  const [chartData, setChartData] = useState({
    datasets: [],
  });

  const [errorMessage, setErrorMessage] = useState('');

  const distributionOptions = [
    { value: 'normal', label: 'Normal Distribution' },
    { value: 'uniform', label: 'Uniform Distribution' },
    { value: 'triangular', label: 'Triangular Distribution' },
  ];

  const handleDistributionChange = (e) => {
    const newDistributionType = e.target.value;
    setDistributionType(newDistributionType);
  
    // Reset input values
    const resetValues = {
      mean: '',
      stddev: '',
      min_val: '',
      max_val: '',
      mode: '',
      distribution_type: newDistributionType,
    };
    setValues(resetValues);
  
    // Notify parent component
    onFormChange(resetValues);
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
    onFormChange(updatedValues);
  };
    
  const generateDistributionShape = () => {
    const numPoints = 100;
    let datasets = [];
    let xMin = null;
    let xMax = null;
  
    // Aggregate data handling
    const aggDataAvailable = aggregateData && aggregateData.x_values && aggregateData.y_values;
  
    if (aggDataAvailable) {
      const aggXValues = aggregateData.x_values.map(parseFloat);
      const aggYValues = aggregateData.y_values.map(parseFloat);
  
      // Normalize y-values
      const totalArea = aggYValues.reduce((sum, y) => sum + y, 0);
      const normalizedYValues = aggYValues.map(y => y / totalArea);
  
      const aggDataPoints = aggXValues.map((x, index) => ({
        x: x,
        y: normalizedYValues[index],
      }));
  
      xMin = Math.min(...aggXValues);
      xMax = Math.max(...aggXValues);
  
      datasets.push({
        label: 'Aggregate Distribution',
        data: aggDataPoints,
        borderColor: theme.palette.secondary.main,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      });
    }
  
    // User input data handling
    if (distributionType && values) {
      let userDataPoints = [];
      if (distributionType === 'normal' && values.mean !== '' && values.stddev !== '') {
        const mean = parseFloat(values.mean);
        const stddev = parseFloat(values.stddev);
        const startX = Math.max(0, mean - 3 * stddev);
        const endX = mean + 3 * stddev;
        const step = (endX - startX) / numPoints;
    
        userDataPoints = Array.from({ length: numPoints }, (_, i) => {
          const x = startX + i * step;
          const z = (x - mean) / stddev;
          const y = Math.exp(-0.5 * z * z) / (stddev * Math.sqrt(2 * Math.PI));
          return { x, y };
        });
  
        xMin = xMin !== null ? Math.min(xMin, startX) : startX;
        xMax = xMax !== null ? Math.max(xMax, endX) : endX;
      } else if (distributionType === 'uniform' && values.min_val !== '' && values.max_val !== '') {
        const min_val = parseFloat(values.min_val);
        const max_val = parseFloat(values.max_val);
        if (min_val > max_val) {
          setErrorMessage('Minimum value cannot be greater than Maximum value.');
          return;
        } else {
          setErrorMessage('');
        }
        const uniformHeight = 1 / (max_val - min_val);
    
        userDataPoints = Array.from({ length: numPoints }, (_, i) => {
          const x = min_val + ((max_val - min_val) / numPoints) * i;
          const y = uniformHeight;
          return { x, y };
        });
  
        xMin = xMin !== null ? Math.min(xMin, min_val) : min_val;
        xMax = xMax !== null ? Math.max(xMax, max_val) : max_val;
      } else if (
        distributionType === 'triangular' &&
        values.min_val !== '' &&
        values.max_val !== '' &&
        values.mode !== ''
      ) {
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
    
        userDataPoints = Array.from({ length: numPoints }, (_, i) => {
          const x = min_val + ((max_val - min_val) / numPoints) * i;
          let y = 0;
          if (x < mode) {
            y = (2 * (x - min_val)) / ((max_val - min_val) * (mode - min_val));
          } else {
            y = (2 * (max_val - x)) / ((max_val - min_val) * (max_val - mode));
          }
          return { x, y };
        });
  
        xMin = xMin !== null ? Math.min(xMin, min_val) : min_val;
        xMax = xMax !== null ? Math.max(xMax, max_val) : max_val;
      }
  
      datasets.push({
        label: 'User Distribution',
        data: userDataPoints,
        borderColor: theme.palette.primary.main,
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        fill: true,
      });
    }
  
    // Update xRange
    if (xMin !== null && xMax !== null && isFinite(xMin) && isFinite(xMax)) {
      setXRange({ min: xMin, max: xMax });
    } else {
      setXRange({ min: null, max: null });
    }
  
    // Set chartData
    setChartData({
      datasets: datasets,
    });
  };
  
  useEffect(() => {
    generateDistributionShape();
  }, [values, distributionType, aggregateData]);

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
              label="Mean"
              name="mean"
              value={values.mean}
              onChange={handleInputChange}
              sx={{ margin: 1, width: '26%' }}
              inputProps={commonInputProps}
            />
            <TextField
              label="Standard Deviation"
              name="stddev"
              value={values.stddev}
              onChange={handleInputChange}
              sx={{ margin: 1, width: '26%' }}
              inputProps={commonInputProps}
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
        overflow: 'auto',
      }}
    >
      <Typography variant="h5" align="center" sx={{ marginBottom: '1rem' }}>
        {factorTitle}
      </Typography>

      {percentageInput && (
        <Typography variant="body2" align="center" color="textSecondary" sx={{ marginBottom: '1rem' }}>
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
              height: `${height * 0.4}px`,
            }}
          >
            <Box sx={{ width: '100%', height: '100%' }}>
              <Line
                data={chartData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      type: 'linear',
                      position: 'bottom',
                      ...(xRange.min !== null && xRange.max !== null
                        ? { suggestedMin: xRange.min, suggestedMax: xRange.max }
                        : {}),
                      ticks: {
                        maxTicksLimit: 10,
                        callback: function (value) {
                          return parseFloat(value).toFixed(1);
                        },
                      },
                    },              
                    y: {
                      beginAtZero: true,
                      display: false,
                    },
                  },
                  plugins: {
                    legend: {
                      display: true,
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

export default OverlayGraphForm;
