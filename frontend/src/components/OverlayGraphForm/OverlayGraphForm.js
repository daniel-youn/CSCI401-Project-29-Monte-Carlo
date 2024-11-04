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
  aggregateData = null,
}) => {
  const theme = useTheme();

  const [xRange, setXRange] = useState({ min: null, max: null });
  const [distributionType, setDistributionType] = useState('');
  const [values, setValues] = useState({ mean: '', stddev: '', min_val: '', max_val: '', mode: '' });
  const [chartData, setChartData] = useState({
    datasets: [],
  });

  const distributionOptions = [
    { value: 'normal', label: 'Normal Distribution' },
    { value: 'uniform', label: 'Uniform Distribution' },
    { value: 'triangular', label: 'Triangular Distribution' },
  ];

  const handleDistributionChange = (e) => {
    const newDistributionType = e.target.value;
    setDistributionType(newDistributionType);
  
    // Reset input values to undefined
    const resetValues = {
      mean: undefined,
      stddev: undefined,
      min_val: undefined,
      max_val: undefined,
      mode: undefined,
      distribution_type: newDistributionType,
    };
    setValues(resetValues);
  
    // Notify parent component with the updated values
    onFormChange(resetValues);
  };
    
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = value === '' ? undefined : parseFloat(value);
    const updatedValues = { ...values, [name]: parsedValue };
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
  
      // Calculate bin widths
      const binWidths = aggXValues.map((x, index) => {
        if (index === aggXValues.length - 1) {
          return aggXValues[index] - aggXValues[index - 1]; // Last bin width
        } else {
          return aggXValues[index + 1] - x;
        }
      });
  
      // Calculate the area under the histogram
      let totalArea = 0;
      for (let i = 0; i < aggYValues.length; i++) {
        totalArea += aggYValues[i] * binWidths[i];
      }
  
      // Normalize y-values to convert counts to PDF
      const normalizedYValues = aggYValues.map((y, index) => y / totalArea);
  
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
    let userDataAvailable = false;
  
    if (distributionType === 'normal' && values.mean !== '' && values.stddev !== '') {
      userDataAvailable = true;
      const mean = parseFloat(values.mean);
      const stddev = parseFloat(values.stddev);
  
      const startX = mean - 3 * stddev;
      const endX = mean + 3 * stddev;
      const step = (endX - startX) / numPoints;
  
      const userDataPoints = Array.from({ length: numPoints }, (_, i) => {
        const x = startX + i * step;
        const z = (x - mean) / stddev;
        const y = Math.exp(-0.5 * z * z) / (stddev * Math.sqrt(2 * Math.PI));
        return { x, y };
      });
  
      xMin = xMin !== null ? Math.min(xMin, startX) : startX;
      xMax = xMax !== null ? Math.max(xMax, endX) : endX;
  
      datasets.push({
        label: 'User Distribution',
        data: userDataPoints,
        borderColor: theme.palette.primary.main,
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        fill: true,
      });
    } else if (distributionType === 'uniform' && values.min_val !== '' && values.max_val !== '') {
      userDataAvailable = true;
      const min_val = parseFloat(values.min_val);
      const max_val = parseFloat(values.max_val);
      const uniformHeight = 1 / (max_val - min_val);
  
      const userDataPoints = Array.from({ length: numPoints }, (_, i) => {
        const x = min_val + ((max_val - min_val) / numPoints) * i;
        const y = x >= min_val && x <= max_val ? uniformHeight : 0;
        return { x, y };
      });
  
      xMin = xMin !== null ? Math.min(xMin, min_val) : min_val;
      xMax = xMax !== null ? Math.max(xMax, max_val) : max_val;
  
      datasets.push({
        label: 'User Distribution',
        data: userDataPoints,
        borderColor: theme.palette.primary.main,
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        fill: true,
      });
    } else if (
      distributionType === 'triangular' &&
      values.min_val !== '' &&
      values.max_val !== '' &&
      values.mode !== ''
    ) {
      userDataAvailable = true;
      const min_val = parseFloat(values.min_val);
      const max_val = parseFloat(values.max_val);
      const mode = parseFloat(values.mode);
  
      const userDataPoints = Array.from({ length: numPoints }, (_, i) => {
        const x = min_val + ((max_val - min_val) / numPoints) * i;
        let y = 0;
        if (x < min_val || x > max_val) {
          y = 0;
        } else if (x < mode) {
          y = (2 * (x - min_val)) / ((max_val - min_val) * (mode - min_val));
        } else {
          y = (2 * (max_val - x)) / ((max_val - min_val) * (max_val - mode));
        }
        return { x, y };
      });
  
      xMin = xMin !== null ? Math.min(xMin, min_val) : min_val;
      xMax = xMax !== null ? Math.max(xMax, max_val) : max_val;
  
      datasets.push({
        label: 'User Distribution',
        data: userDataPoints,
        borderColor: theme.palette.primary.main,
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        fill: true,
      });
    }
  
    // Update xRange only if xMin and xMax are valid numbers
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
              inputProps={{ type: 'number', step: 'any' }}
            />
            <TextField
              label="Standard Deviation"
              name="stddev"
              value={values.stddev}
              onChange={handleInputChange}
              sx={{ margin: 1, width: '26%' }}
              inputProps={{ type: 'number', step: 'any' }}
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
              inputProps={{ type: 'number', step: 'any' }}
            />
            <TextField
              label="Maximum Value"
              name="max_val"
              value={values.max_val}
              onChange={handleInputChange}
              sx={{ margin: 1, width: '26%' }}
              inputProps={{ type: 'number', step: 'any' }}
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
              inputProps={{ type: 'number', step: 'any' }}
            />
            <TextField
              label="Maximum Value"
              name="max_val"
              value={values.max_val}
              onChange={handleInputChange}
              sx={{ margin: 1, width: '26%' }}
              inputProps={{ type: 'number', step: 'any' }}
            />
            <TextField
              label="Mode"
              name="mode"
              value={values.mode}
              onChange={handleInputChange}
              sx={{ margin: 1, width: '26%' }}
              inputProps={{ type: 'number', step: 'any' }}
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
        width: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
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

      {chartData.datasets.length > 0 && (
        <Box
          sx={{
            marginBottom: '2rem',
            flexGrow: 1,
            minHeight: '200px',
          }}
        >
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
      )}

      <Grid container spacing={2} justifyContent="center">
        {renderInputs()}
      </Grid>
    </Paper>
  );
};

export default OverlayGraphForm;
