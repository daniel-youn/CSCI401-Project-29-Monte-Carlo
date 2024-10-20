import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { GridViewRounded, PeopleAltRounded } from '@mui/icons-material';
import './_project-view.scss'; // Import SCSS
import MonteCarloServices from '../../apis/MonteCarloServices'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// const sim_data_string = MonteCarloServices.getSimulation('sim_123')
// const simData = JSON.parse(sim_data_string);
// const sim_summary_string = MonteCarloServices.getSimulationSummaryStats(simData.output_id)
// const sim_summary = JSON.parse(sim_summary_string);

// const x_values = sim_summary.x_values
// const y_values = sim_summary.y_values

const data = {
  labels: [],
  datasets: [
    {
      label: '', // Remove the label so the legend doesn't appear
      data: [],
      fill: true,
      backgroundColor: 'rgba(7, 171, 174, 0.5)', // Updated fill color to #07ABAE with transparency
      borderColor: '#07ABAE', // Updated border color to #07ABAE
      pointBackgroundColor: '#fff', // Points stay white
      pointBorderColor: '#07ABAE', // Point borders updated to #07ABAE
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false, // Disable the legend
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#D5D5D5', // Off-white color for the x-axis labels
      },
      grid: {
        display: false, // Remove the x-axis grid lines
      },
    },
    y: {
      ticks: {
        color: '#D5D5D5', // Off-white color for the y-axis labels
      },
      grid: {
        display: false, // Remove the y-axis grid lines
      },
    },
  },
};

const ProjectView = () => {
  const [view, setView] = useState('Overview');
  const [xValues, setXValues] = useState([]);
  const [yValues, setYValues] = useState([]);

  const fetchSimulationData = async () => {
    try {
      const simData = await MonteCarloServices.getSimulation('sim_123'); // Fetch simulation data
      console.log('simData')
      console.log(simData)
      if (simData) {
        const simSummary = await MonteCarloServices.getSimulationSummaryStats(simData.output_id); // Fetch summary stats
        if (simSummary) {
          setXValues(simSummary.x_values);
          setYValues(simSummary.y_values);
          console.log('simSummary');
          console.log(simSummary);
        }
      }
    } catch (error) {
      console.error('Error fetching simulation data or summary statistics:', error);
    }
  };

  useEffect(() => {
    fetchSimulationData(); // Fetch data on component mount
  }, []);


  const data = {
    labels: xValues,
    datasets: [
      {
        label: '', // Remove the label so the legend doesn't appear
        data: yValues,
        fill: true,
        backgroundColor: 'rgba(7, 171, 174, 0.5)', // Updated fill color to #07ABAE with transparency
        borderColor: '#07ABAE', // Updated border color to #07ABAE
        pointBackgroundColor: '#fff', // Points stay white
        pointBorderColor: '#07ABAE', // Point borders updated to #07ABAE
      },
    ],
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  return (
    <Box className="project-view">
      {/* Sidebar */}
      <Box className="sidebar">
        <Button onClick={() => handleViewChange('Overview')} className="switcher-btn">
          <GridViewRounded />
          Overview
        </Button>
        <Button onClick={() => handleViewChange('Members')} className="switcher-btn">
          <PeopleAltRounded />
          Members
        </Button>
      </Box>

      {/* Main Content */}
      <Box className="content">
        {/* Aggregated Factors Column */}
        <Box className="aggregated-factors">
          <Box className="header-box">
            <Typography variant="h7">Aggregated Factors</Typography>
          </Box>
          <Box className="factors-content">
            {/* Factor 1 Sub-heading */}
            <Box mb={2}>
              <Typography className="sub-heading">Factor 1</Typography>
              <Box className="chart-container">
                <Line data={data} options={options} />
              </Box>
            </Box>

            {/* Factor 2 Sub-heading */}
            <Box mb={2}>
              <Typography className="sub-heading">Factor 2</Typography>
              <Box className="chart-container">
                <Line data={data} options={options} />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Estimated Revenue Column */}
        <Box className="estimated-revenue">
          <Box className="header-box">
            <Typography variant="h7">Estimated Revenue</Typography>
          </Box>
          {/* Only one chart under Estimated Revenue */}
          <Box mt={2} className="chart-container">
            <Line data={data} options={options} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectView;
