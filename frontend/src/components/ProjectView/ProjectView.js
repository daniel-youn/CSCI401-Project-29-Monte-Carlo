import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme
} from '@mui/material';
import { Line } from 'react-chartjs-2';

// Import and register Chart.js components
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
import AggregateFactorGraph from '../AggregateFactorGraph/AggregateFactorGraph';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ProjectView = () => {
  const { projectId } = useParams();  // Get projectId from the URL
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [projectData, setProjectData] = useState(null);  // State to hold project details
  const [normalSimOutput, setNormalSimOutput] = useState(null);  // State to hold normal simulation data
  const [aggregateData, setAggregateData] = useState(null);
  // Fetch project details when the component loads or when projectId changes
  useEffect(() => {
    if (!projectId) {
      console.error('No project ID found in URL');
      return;
    }
    console.log(projectId)
    const fetchAggregateDistribution = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/simulation/get_aggregate_distribution/${projectId}`);

        // Check if the response is ok
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // Set the distribution data in state
        setAggregateData(data);
      } catch (error) {
        console.error('Error fetching aggregate data', error);
      }
    };
    const fetchProjectData = async () => {
      try {
        // Fetch project details
        const projectResponse = await fetch(`http://localhost:5001/api/project/projects/${projectId}`);
        const projectData = await projectResponse.json();
        setProjectData(projectData);

        // Determine which simulation ID to use (either hardcoded or from projectData)
        const simId = "6716c590796d87b86413bc38";  // Hardcoded simId
        // const simId = projectData["normal_sim_id"]; // Use this if normal_sim_id is available in projectData

        // Fetch normal simulation data using simId
        const simulationResponse = await fetch(`http://localhost:5001/api/output/outputs/simulation/${simId}`);
        const simulationData = await simulationResponse.json();

        // Assuming the API appends data, use the last chunk
        const lastSimulation = simulationData[simulationData.length - 1];
        setNormalSimOutput(lastSimulation);
      } catch (error) {
        console.error('Error fetching project or simulation data:', error);
      }
    };

    fetchProjectData();
    fetchAggregateDistribution();
    //TODO:REMOVE
    setAggregateData({
      "wtp_standard": {
        "x_values": [10.5, 10.6, 10.7],
        "y_values": [5, 15, 30]
      },
      "wtp_premium": {
        "x_values": [20.5, 20.6, 20.7],
        "y_values": [3, 12, 25]
      },
      "num_standard_users": {
        "x_values": [100, 101, 102],
        "y_values": [10, 18, 35]
      },
      "num_premium_users": {
        "x_values": [50, 51, 52],
        "y_values": [7, 15, 22]
      },
      "num_deals": {
        "x_values": [1, 2, 3],
        "y_values": [4, 9, 13]
      },
      "discount": {
        "x_values": [0.05, 0.06, 0.07],
        "y_values": [10, 20, 35]
      }
    });
    console.log(aggregateData)
  }, [projectId]);

  // Redirect to /project-page/:projectId/overview if visiting /project-page/:projectId
  useEffect(() => {
    if (location.pathname === `/project-page/${projectId}`) {
      navigate(`/project-page/${projectId}/overview`);
    }
  }, [location, navigate, projectId]);

  const chartData = {
    labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'], // Assuming 5 years
    datasets: [
      {
        label: 'Estimated Revenue', // This is now the only visible legend item
        data: normalSimOutput?.summary_statistics.map(stat => stat.mean),
        fill: '+1', // Fill the area between this dataset and the next (Std Down to Std Up)
        borderColor: '#07ABAE', // Main line for "Estimated Revenue"
        backgroundColor: 'rgba(7, 171, 174, 0.1)', // Translucent fill between std down and std up
        pointBackgroundColor: '#fff',
        pointBorderColor: '#07ABAE',
      },
      {
        label: 'Std Down', // Dotted line for Std Down (not shown in the legend)
        data: normalSimOutput?.summary_statistics.map(stat => stat.mean - stat.std_dev),
        fill: false, // No fill below this line
        borderColor: '#07ABAE', // Same color as Estimated Revenue, but dotted
        borderDash: [5, 5], // Dotted line style
        pointBackgroundColor: 'rgba(0, 0, 0, 0)', // No points visible
        pointBorderColor: 'rgba(0, 0, 0, 0)',
      },
      {
        label: 'Std Up', // Dotted line for Std Up (not shown in the legend)
        data: normalSimOutput?.summary_statistics.map(stat => stat.mean + stat.std_dev),
        fill: '-1', // Fill the area between this and the previous dataset (std up and std down)
        borderColor: '#07ABAE', // Same color as Estimated Revenue, but dotted
        backgroundColor: 'rgba(7, 171, 174, 0.1)', // Slightly different translucent color for std up
        borderDash: [5, 5], // Dotted line style
        pointBackgroundColor: 'rgba(0, 0, 0, 0)', // No points visible
        pointBorderColor: 'rgba(0, 0, 0, 0)',
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // This ensures that the chart adjusts to the parent container
    plugins: {
      legend: {
        display: true,
        labels: {
          filter: function (item) {
            return item.text === 'Estimated Revenue'; // Only show "Estimated Revenue" in the legend
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#D5D5D5',
          font: {
            size: 14, // Adjust the size if necessary
          },
        },
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Year',
          color: '#D5D5D5',
        },
      },
      y: {
        ticks: {
          color: '#D5D5D5',
        },
        grid: {
          display: true,
        },
        title: {
          display: true,
          text: 'Revenue',
          color: '#D5D5D5',
        },
      },
    },
  };

  const renderOverview = () => (
    <Box sx={{ padding: '2rem' }}>
      {/* Project Title */}
      <Typography variant="h4" sx={{ marginBottom: '2rem', color: '#fff' }}>
        {projectData?.project_name || 'Loading...'}
      </Typography>

      {/* Content Row */}
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
        {/* Aggregated Factors Column */}
        <Box sx={{ flex: 0.5 }}>
          <Box
            sx={{
              backgroundColor: '#1e1e1e',
              padding: '1rem',
              borderRadius: '4px',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              maxHeight: '900px',
              overflowY: 'auto',
            }}
          >
            <Typography variant="h6" sx={{ marginBottom: '1.5rem', color: '#fff' }}>
              Aggregated Factors
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {aggregateData && Object.entries(aggregateData).map(([key, value], index) => (
                <Box key={index} sx={{ height: '200px', width: '100%' }}>
                  <AggregateFactorGraph
                    factorTitle={key} // Use the key as the title
                    x_values={value.x_values}
                    y_values={value.y_values}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Simulation Summary Column */}
        <Box
          sx={{
            backgroundColor: '#1e1e1e',
            padding: '1rem',
            borderRadius: '4px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            width: '100%', // Make sure the box width fills the remaining space
            height: '600px', // Fix the height to avoid overflow
            overflow: 'hidden', // Ensure content doesn't overflow
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: '1.5rem', color: '#fff' }}>
            Simulation Summary
          </Typography>
          <Box
            sx={{
              height: '100%', // Ensure chart fits the parent container
              width: '100%',
            }}
          >
            {normalSimOutput ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <Typography sx={{ color: '#D5D5D5' }}>Loading chart data...</Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const renderSettings = () => (
    <Box sx={{ padding: '2rem' }}>
      <Box
        sx={{
          backgroundColor: '#1e1e1e',
          padding: '2rem',
          borderRadius: '4px',
          marginBottom: '3rem',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: '1rem', color: '#fff' }}>
          Members Summary for {projectData?.project_name || 'Loading...'}
        </Typography>
        <Box>
          <Typography variant="body1" sx={{ color: '#D5D5D5' }}>
            Admin: {projectData?.admin_user_id || 'Loading...'}
          </Typography>
          <Typography variant="body1" sx={{ color: '#D5D5D5', marginTop: '1rem' }}>
            Shared Users: {projectData?.shared_users?.join(', ') || 'None'}
          </Typography>
        </Box>
        {/* Table for Shared Users */}
        <TableContainer component={Paper} sx={{ marginTop: '2rem', backgroundColor: '#1e1e1e' }}>
          <Table aria-label="shared members table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#D5D5D5' }}>User</TableCell>
                <TableCell sx={{ color: '#D5D5D5' }}>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectData?.shared_users?.map((user, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ color: '#D5D5D5' }}>{user}</TableCell>
                  <TableCell sx={{ color: '#D5D5D5' }}>{user}</TableCell> {/* Assuming user is both name and email */}
                </TableRow>
              ))}
              {!projectData?.shared_users?.length && (
                <TableRow>
                  <TableCell colSpan={2} sx={{ color: '#D5D5D5', textAlign: 'center' }}>
                    No shared users
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Example buttons */}
        <Box mt={2}>
          <Button variant="contained" color="primary" sx={{ marginRight: '10px' }}>
            Share to More Members
          </Button>
          <Button variant="contained" color="secondary" sx={{ marginRight: '10px' }}>
            Publish Project
          </Button>
          <Button variant="outlined" color="error">
            Delete Project
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box>
      <Routes>
        <Route path="overview" element={renderOverview()} />
        <Route path="settings" element={renderSettings()} />
        {/* You can add other routes like settings here */}
      </Routes>
    </Box>
  );
};

export default ProjectView;
