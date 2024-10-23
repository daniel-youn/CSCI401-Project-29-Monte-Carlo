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

const AggregateFactorGraph = ({ factorTitle = "Factor i", width = "100%", height = "300px", x_values, y_values }) => {
  const theme = useTheme();

  const [chartData, setChartData] = useState({
    labels: [], // x-values
    datasets: [
      {
        label: 'Data Points',
        data: [], // y-values
        borderColor: theme.palette.primary.main,
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        fill: true,
      }
    ]
  });

  // Update chart data whenever x_values and y_values are passed as props
  useEffect(() => {
    if (x_values && y_values) {
      setChartData({
        labels: x_values,  // Assign the x-values to the labels
        datasets: [
          {
            label: 'Data Points',
            data: y_values,  // Assign the y-values to the dataset
            borderColor: theme.palette.primary.main,
            backgroundColor: 'rgba(0, 188, 212, 0.2)',
            fill: true,
          }
        ]
      });
    }
  }, [x_values, y_values]);

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
      <Typography
        variant="subtitle1"  // Reduce the font size by changing the variant
        align="left"         // Align the title to the left
        sx={{ marginBottom: '0.5rem', color: theme.palette.text.primary }}
      >
        {factorTitle}
      </Typography>

      {x_values && y_values && (
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
                animation: false,
                scales: {
                  y: {
                    display: false,  // Hide the y-axis
                    min: 0,
                  },
                  x: {
                    type: 'linear',
                    display: true,
                    title: {
                      display: true,
                      text: factorTitle,  // Use factorTitle as x-axis label
                    },
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
