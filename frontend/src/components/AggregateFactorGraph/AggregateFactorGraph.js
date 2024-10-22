import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
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

const AggregateFactorGraph = ({ factorTitle = "Factor i", width = "40rem", height = "30rem", distributionType, values }) => {
  const theme = useTheme();

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Distribution',
        data: [],
        borderColor: theme.palette.primary.main,
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        fill: true,
      }
    ]
  });

  useEffect(() => {
    if (distributionType && values) {
      generateDistributionShape();
    }
  }, [distributionType, values]);
  const generateDistributionShape = () => {
    let data = [];
    const numPoints = 100;

    if (distributionType === 'normal' && values.hasOwnProperty('mean') && values.hasOwnProperty('stddev')) {
      const mean = parseFloat(values.mean);
      const stddev = parseFloat(values.stddev);
      if (isNaN(mean) || isNaN(stddev)) {
        console.log("Invalid mean or stddev");
        return;
      }
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
            fill: true,
          }
        ]
      });
    } else if (distributionType === 'uniform' && values.hasOwnProperty('min_val') && values.hasOwnProperty('max_val')) {
      const min_val = parseFloat(values.min_val);
      const max_val = parseFloat(values.max_val);
      if (isNaN(min_val) || isNaN(max_val)) {
        console.log("Invalid min or max values");
        return;
      }
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
    } else if (distributionType === 'triangular' && values.hasOwnProperty('min_val') && values.hasOwnProperty('max_val') && values.hasOwnProperty('mode')) {
      const min_val = parseFloat(values.min_val);
      const max_val = parseFloat(values.max_val);
      const mode = parseFloat(values.mode);
      if (isNaN(min_val) || isNaN(max_val) || isNaN(mode)) {
        console.log("Invalid min, max, or mode values");
        return;
      }
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
    } else {
      console.log("Invalid distribution type or missing values", distributionType, values);
    }
  };

  return (
    <Paper
      sx={{
        padding: '2rem',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        width: `${width}`,
        height: `${height}`,
        overflow: 'auto'
      }}
    >
      <Typography variant="h5" align="center" sx={{ marginBottom: '1rem', color: theme.palette.text.primary }}>
        {factorTitle}
      </Typography>

      {distributionType && (
        <Box
          sx={{
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: `${width * 0.8}`,
            height: `${height * 0.4}`
          }}
        >
          <Box sx={{ width: '100%', height: '100%' }}>
            <Line
              data={chartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    display: false,
                  },
                  x: {
                    type: 'linear',
                    min: Math.min(...chartData.labels),
                    max: Math.max(...chartData.labels),
                  }
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default AggregateFactorGraph;
