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
import axios from 'axios';

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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ProjectView = () => {
  const { projectId } = useParams();  // Get projectId from the URL
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [projectData, setProjectData] = useState(null);  // State to hold project details

  // Fetch project details when the component loads or when projectId changes
  useEffect(() => {
    if (!projectId) {
      console.error('No project ID found in URL');
      return;
    }

    const fetchProjectData = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/project/projects/${projectId}`);
        setProjectData(response.data);
      } catch (error) {
        console.error('Error fetching project data:', error);
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

  // Placeholder data for charts and simulation data
  const chartData = {
    labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
    datasets: [
      {
        label: 'Estimated Revenue',
        data: [10000, 15000, 20000, 25000, 30000], // Placeholder data
        fill: true,
        backgroundColor: 'rgba(7, 171, 174, 0.5)',
        borderColor: '#07ABAE',
        pointBackgroundColor: '#fff',
        pointBorderColor: '#07ABAE',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
          display: false,
        },
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
            Aggregated Factors for {projectData?.project_name || 'Loading...'}
          </Typography>
          {/* Example Factor Content */}
          {/* Placeholder for factors */}
          <Box className="factors-content" sx={{ marginBottom: '2rem' }}>
            <Typography variant="subtitle1" sx={{ color: '#D5D5D5' }}>
              Factor 1 (Placeholder)
            </Typography>
            <Box className="chart-container" sx={{ marginTop: '1rem' }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 2 }}>
        {/* Hero Graph for Estimated Revenue */}
        <Box
          sx={{
            backgroundColor: '#1e1e1e',
            padding: '2rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: '1.5rem', color: '#fff' }}>
            Estimated Revenue for {projectData?.project_name || 'Loading...'}
          </Typography>
          <Box className="chart-container" sx={{ height: '350px', width: '100%' }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  // Content for Settings section
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
      </Routes>
    </Box>
  );
};

export default ProjectView;
