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

  // Fetch project details when the component loads or when projectId changes
  useEffect(() => {
    if (!projectId) {
      console.error('No project ID found in URL');
      return;
    }

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
  }, [projectId]);

  // Redirect to /project-page/:projectId/overview if visiting /project-page/:projectId
  useEffect(() => {
    if (location.pathname === `/project-page/${projectId}`) {
      navigate(`/project-page/${projectId}/overview`);
    }
  }, [location, navigate, projectId]);

  // Prepare the chart data based on simulation statistics
  const chartData = {
    labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'], // Assuming 5 years
    datasets: [
      {
        label: 'Mean Revenue',
        data: normalSimOutput?.summary_statistics.map(stat => stat.mean),
        fill: false,
        borderColor: '#07ABAE',
        backgroundColor: '#07ABAE',
        pointBackgroundColor: '#fff',
        pointBorderColor: '#07ABAE',
      },
      {
        label: 'Std Down (Mean - Std Dev)',
        data: normalSimOutput?.summary_statistics.map(stat => stat.mean - stat.std_dev),
        fill: false,
        borderColor: '#FF5733',
        backgroundColor: '#FF5733',
        pointBackgroundColor: '#fff',
        pointBorderColor: '#FF5733',
        borderDash: [5, 5], // Dashed line to represent "Std Down"
      },
      {
        label: 'Std Up (Mean + Std Dev)',
        data: normalSimOutput?.summary_statistics.map(stat => stat.mean + stat.std_dev),
        fill: false,
        borderColor: '#C70039',
        backgroundColor: '#C70039',
        pointBackgroundColor: '#fff',
        pointBorderColor: '#C70039',
        borderDash: [5, 5], // Dashed line to represent "Std Up"
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#D5D5D5',
        },
        grid: {
          display: false,
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
        }
      },
    },
  };

  // Content for Overview section
  const renderOverview = () => (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1rem', padding: '2rem' }}>
      {/* Aggregated Factors Column */}
      <Box sx={{ flex: 1 }}>
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
            Simulation Summary for {projectData?.project_name || 'Loading...'}
          </Typography>
          <Box className="chart-container" sx={{ marginTop: '1rem', height: '600px', width: '100%' }}>
            {normalSimOutput ? (
              <Line data={chartData} options={chartOptions} height={600} />
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
  const renderGraphsSection = () => {
    const graphData = [
      {
        factorTitle: 'Graph 1',
        distributionType: 'normal',
        values: { mean: 0, stddev: 1 }
      },
      {
        factorTitle: 'Graph 2',
        distributionType: 'uniform',
        values: { min_val: 0, max_val: 1 }
      },
      {
        factorTitle: 'Graph 3',
        distributionType: 'triangular',
        values: { min_val: 0, max_val: 1, mode: 0.5 }
      },
      // Add more data here for 10 graphs, adjusting distributionType and values as needed
    ];

    // Render 10 graphs by duplicating and altering the graphData array
    return (
      <Box sx={{ padding: '2rem' }}>
        <Box
          sx={{
            backgroundColor: '#1e1e1e',
            padding: '2rem',
            borderRadius: '4px',
            marginBottom: '3rem',
            maxHeight: '600px', // Limit the height
            overflowY: 'auto',   // Make scrollable
          }}
        >
          <Typography variant="h6" sx={{ color: '#fff', marginBottom: '1rem' }}>
            Multiple Simulations
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {graphData.map((graph, index) => (
              <Box key={index} sx={{ height: '400px', width: '100%' }}>
                <AggregateFactorGraph
                  factorTitle={graph.factorTitle}
                  distributionType={graph.distributionType}
                  values={graph.values}
                  height={"60rem"}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Routes>
        <Route path="overview" element={renderOverview()} />
        <Route path="settings" element={renderSettings()} />
        <Route path="graphs" element={renderGraphsSection()} /> {/* New Route for the Graph Section */}
        {/* You can add other routes like settings here */}
      </Routes>
    </Box>
  );
};

export default ProjectView;
