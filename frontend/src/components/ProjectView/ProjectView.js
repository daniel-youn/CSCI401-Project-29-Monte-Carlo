import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Switch,
  FormControlLabel,
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Sample data for the charts and table
const chartData = {
  labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
  datasets: [
    {
      label: 'Estimated Revenue',
      data: [10000, 15000, 20000, 25000, 30000],
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

// Dummy data for the members table
const membersData = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', status: 'Completed' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', status: 'Not Completed' },
  { id: 3, firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com', status: 'Completed' },
  { id: 4, firstName: 'Bob', lastName: 'Brown', email: 'bob.brown@example.com', status: 'Not Completed' },
];

// Yearly data for the statistics table
const yearData = [
  { year: 'Year 1', mean: 10000, std: 1200 },
  { year: 'Year 2', mean: 10500, std: 1300 },
  { year: 'Year 3', mean: 11000, std: 1400 },
  { year: 'Year 4', mean: 11500, std: 1500 },
  { year: 'Year 5', mean: 12000, std: 1600 },
];

const ProjectView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Redirect to /overview if visiting /project-page
  useEffect(() => {
    if (location.pathname === '/project-page') {
      navigate('/project-page/overview');
    }
  }, [location, navigate]);

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
            Aggregated Factors
          </Typography>
          <Box className="factors-content" sx={{ marginBottom: '2rem' }}>
            <Typography variant="subtitle1" sx={{ color: '#D5D5D5' }}>
              Factor 1
            </Typography>
            <Box className="chart-container" sx={{ marginTop: '1rem' }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Box>
          <Box className="factors-content">
            <Typography variant="subtitle1" sx={{ color: '#D5D5D5' }}>
              Factor 2
            </Typography>
            <Box className="chart-container" sx={{ marginTop: '1rem' }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Box>
          <Box className="factors-content">
            <Typography variant="subtitle1" sx={{ color: '#D5D5D5' }}>
              Factor 2
            </Typography>
            <Box className="chart-container" sx={{ marginTop: '1rem' }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Box>
          <Box className="factors-content">
            <Typography variant="subtitle1" sx={{ color: '#D5D5D5' }}>
              Factor 2
            </Typography>
            <Box className="chart-container" sx={{ marginTop: '1rem' }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Box>
          <Box className="factors-content">
            <Typography variant="subtitle1" sx={{ color: '#D5D5D5' }}>
              Factor 2
            </Typography>
            <Box className="chart-container" sx={{ marginTop: '1rem' }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Box>
          <Box className="factors-content">
            <Typography variant="subtitle1" sx={{ color: '#D5D5D5' }}>
              Factor 2
            </Typography>
            <Box className="chart-container" sx={{ marginTop: '1rem' }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Box>
          <Box className="factors-content">
            <Typography variant="subtitle1" sx={{ color: '#D5D5D5' }}>
              Factor 2
            </Typography>
            <Box className="chart-container" sx={{ marginTop: '1rem' }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Box>
          <Box className="factors-content">
            <Typography variant="subtitle1" sx={{ color: '#D5D5D5' }}>
              Factor 2
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
            Estimated Revenue
          </Typography>
          <Box className="chart-container" sx={{ height: '350px', width: '100%' }}>
            <Line data={chartData} options={chartOptions} />
          </Box>

          {/* Cross-Check Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
            <Typography variant="subtitle1" sx={{ color: '#D5D5D5', marginRight: '1rem' }}>
              Cross-Check Factors
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={false} // Update this if needed for toggle functionality
                  onChange={() => {}}
                  color="primary"
                />
              }
              label=""
            />
          </Box>
      </Box>

        {/* Summary Statistics */}
        <Box
          sx={{
            backgroundColor: '#1e1e1e',
            padding: '2rem',
            borderRadius: '4px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: '1.5rem', color: '#fff' }}>
            Summary Statistics
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: '#1e1e1e', borderRadius: '4px' }}>
            <Table aria-label="statistics table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#D5D5D5' }}>Year</TableCell>
                  <TableCell sx={{ color: '#D5D5D5' }} align="right">
                    Mean
                  </TableCell>
                  <TableCell sx={{ color: '#D5D5D5' }} align="right">
                    Std
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {yearData.map((row) => (
                  <TableRow key={row.year}>
                    <TableCell sx={{ color: '#D5D5D5' }} component="th" scope="row">
                      {row.year}
                    </TableCell>
                    <TableCell sx={{ color: '#D5D5D5' }} align="right">
                      {row.mean}
                    </TableCell>
                    <TableCell sx={{ color: '#D5D5D5' }} align="right">
                      {row.std}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
          Members Summary
        </Typography>
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

      {/* Member List Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: '#1e1e1e', borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <Table aria-label="members table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#D5D5D5', fontWeight: 'bold' }}>First Name</TableCell>
              <TableCell sx={{ color: '#D5D5D5', fontWeight: 'bold' }}>Last Name</TableCell>
              <TableCell sx={{ color: '#D5D5D5', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: '#D5D5D5', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: '#D5D5D5', fontWeight: 'bold' }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {membersData.map((member) => (
              <TableRow key={member.id} sx={{ '&:hover': { backgroundColor: '#2e2e2e' } }}>
                <TableCell sx={{ color: '#D5D5D5' }}>{member.firstName}</TableCell>
                <TableCell sx={{ color: '#D5D5D5' }}>{member.lastName}</TableCell>
                <TableCell sx={{ color: '#D5D5D5' }}>{member.email}</TableCell>
                <TableCell sx={{ color: '#D5D5D5' }}>{member.status}</TableCell>
                <TableCell sx={{ color: '#D5D5D5' }} align="center">
                  <Button variant="outlined" color="primary" sx={{ marginRight: '10px' }}>
                    View Factors
                  </Button>
                  <Button variant="outlined" color="error">
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
