import React, { useState } from 'react';
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
  Paper
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { GridViewRounded, Settings } from '@mui/icons-material';
import './_project-view.scss'; // Import SCSS

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
      data: [10000, 15000, 20000, 25000, 30000], // Replace with your actual data
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
  const [view, setView] = useState('Overview');
  const [members, setMembers] = useState(membersData);
  const [crossCheckEnabled, setCrossCheckEnabled] = useState(false);

  // Handlers for removing members and viewing factors
  const handleRemoveMember = (id) => {
    const updatedMembers = members.filter((member) => member.id !== id);
    setMembers(updatedMembers);
  };

  const handleViewFactors = (id) => {
    console.log(`Viewing factors for member with ID: ${id}`);
    // Implement logic to view member factors here
  };

  // Calculate number of members completed and total members
  const numCompleted = members.filter((member) => member.status === 'Completed').length;
  const totalMembers = members.length;

  return (
    <Box className="project-view">
      {/* Sidebar */}
      <Box className="sidebar">
        <Button onClick={() => setView('Overview')} className="switcher-btn">
          <GridViewRounded />
          Overview
        </Button>
        <Button onClick={() => setView('Settings')} className="switcher-btn">
          <Settings />
          Settings
        </Button>
      </Box>

      {/* Main Content */}
      <Box className="content">
        {view === 'Overview' && (
          <>
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
                    <Line data={chartData} options={chartOptions} />
                  </Box>
                </Box>

                {/* Other Factors */}
                {/* You can add other factors here similarly */}
              </Box>
            </Box>

            {/* Estimated Revenue Column */}
            <Box className="estimated-revenue">
              <Box className="header-box">
                <Typography variant="h7">Estimated Revenue</Typography>
              </Box>
              {/* Only one chart under Estimated Revenue */}
              <Box mt={2} className="chart-container">
                <Line data={chartData} options={chartOptions} />
              </Box>

              {/* Cross-Check Toggle */}
              <Box mt={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={crossCheckEnabled}
                      onChange={() => setCrossCheckEnabled(!crossCheckEnabled)}
                      color="primary"
                    />
                  }
                  label="Cross-Check Factors"
                />
              </Box>

              {/* Table with statistics */}
              <Box mt={2}>
                <TableContainer component={Paper}>
                  <Table aria-label="statistics table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Year</TableCell>
                        <TableCell align="right">Mean</TableCell>
                        <TableCell align="right">Std</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {yearData.map((row) => (
                        <TableRow key={row.year}>
                          <TableCell component="th" scope="row">
                            {row.year}
                          </TableCell>
                          <TableCell align="right">{row.mean}</TableCell>
                          <TableCell align="right">{row.std}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </>
        )}

        {view === 'Settings' && (
          <Box className="settings-view">
            {/* Summary Section */}
            <Box className="summary-section" mb={3}>
              <Typography variant="h6">Members Summary</Typography>
              <Typography>{`${numCompleted} Members Completed / ${totalMembers} Members Shared`}</Typography>
              <Box mt={2}>
                <Button variant="contained" color="primary" style={{ marginRight: '10px' }}>
                  Share to More Members
                </Button>
                <Button variant="contained" color="secondary" style={{ marginRight: '10px' }}>
                  Publish Project
                </Button>
                <Button variant="outlined" color="error">
                  Delete Project
                </Button>
              </Box>
            </Box>

            {/* Member List Table */}
            <TableContainer component={Paper}>
              <Table aria-label="members table">
                <TableHead>
                  <TableRow>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.firstName}</TableCell>
                      <TableCell>{member.lastName}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.status}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          color="primary"
                          style={{ marginRight: '10px' }}
                          onClick={() => handleViewFactors(member.id)}
                        >
                          View Factors
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProjectView;
