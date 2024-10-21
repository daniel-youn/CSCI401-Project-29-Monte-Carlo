import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // React Router for navigation
import Header from '../../components/Header/Header';
// Sample project data structure
const sampleProjects = [
  {
    id: 'proj_1',
    name: 'Project Alpha',
    contributors: 5,
    creationTime: '2024-10-01',
    revenuePrediction: { mean: 50000, stddev: 10000 },
    pending: true,
    creator: 'Alice Johnson'
  },
  {
    id: 'proj_2',
    name: 'Project Beta',
    contributors: 3,
    creationTime: '2024-08-15',
    revenuePrediction: { mean: 30000, stddev: 8000 },
    pending: false,
    creator: 'Bob Smith'
  },
  {
    id: 'proj_3',
    name: 'Project Gamma',
    contributors: 7,
    creationTime: '2024-07-20',
    revenuePrediction: { mean: 75000, stddev: 15000 },
    pending: true,
    creator: 'Charlie Davis'
  },
  {
    id: 'proj_4',
    name: 'Project Delta',
    contributors: 4,
    creationTime: '2024-09-10',
    revenuePrediction: { mean: 45000, stddev: 9000 },
    pending: false,
    creator: 'Dana Lee'
  }
];

const MyProjectsPage = () => {
  const navigate = useNavigate(); // Initialize React Router's navigate function

  // Local state to store the admin status
  const [isAdmin, setIsAdmin] = useState(false);

  // Retrieve isAdmin from session storage when the component mounts
  useEffect(() => {
    const storedIsAdmin = sessionStorage.getItem('isAdmin'); // Retrieves 'isAdmin' from session storage
    if (storedIsAdmin === 'true') { // Check if 'isAdmin' is set to 'true' (it comes as a string)
      setIsAdmin(true);
    }
    setIsAdmin(true);
    //TODO:ADD FETCH REQUEST TO GET ALL PROJECTS BASED ON CURRENT USER ID
  }, []);

  // Filter projects by pending and non-pending
  const pendingProjects = sampleProjects.filter(project => project.pending);
  const nonPendingProjects = sampleProjects.filter(project => !project.pending);

  // Admin button click handler to redirect to a new page
  const handleAdminButtonClick = () => {
    navigate('/admin-dashboard');
  };

  // Helper function to render the project rows in the table
  const renderProjectRows = (projects) => {
    return projects.map((project) => (
      <TableRow key={project.id}>
        <TableCell>{project.name}</TableCell>
        <TableCell>{project.creator}</TableCell>
        <TableCell>{project.contributors}</TableCell>
        <TableCell>{project.creationTime}</TableCell>
        <TableCell>${project.revenuePrediction.mean}</TableCell>
        <TableCell>${project.revenuePrediction.stddev}</TableCell>
      </TableRow>
    ));
  };

  return (
    <Box>
      <Header></Header>
      <Box sx={{ padding: '2rem', position: 'relative' }}>

        <Typography variant="h4" gutterBottom>
          My Projects
        </Typography>

        {/* Admin Button (only rendered if isAdmin is true) */}
        {isAdmin && (
          <Box sx={{ position: 'absolute', top: '2rem', right: '2rem' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAdminButtonClick}
              sx={{
                backgroundColor: '#00bcd4',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#0097a7'
                }
              }}
            >
              Admin Dashboard
            </Button>
          </Box>
        )}

        {/* Section for Pending Projects */}
        <Box sx={{ marginBottom: '3rem' }}>
          <Typography variant="h5" gutterBottom>
            Pending Projects
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="pending projects table">
              <TableHead>
                <TableRow>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Creator</TableCell>
                  <TableCell>Contributors</TableCell>
                  <TableCell>Creation Time</TableCell>
                  <TableCell>Revenue Mean</TableCell>
                  <TableCell>Revenue Std Dev</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingProjects.length > 0 ? (
                  renderProjectRows(pendingProjects)
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No pending projects found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Section for Non-Pending Projects */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Completed Projects
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="non-pending projects table">
              <TableHead>
                <TableRow>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Creator</TableCell>
                  <TableCell>Contributors</TableCell>
                  <TableCell>Creation Time</TableCell>
                  <TableCell>Revenue Mean</TableCell>
                  <TableCell>Revenue Std Dev</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nonPendingProjects.length > 0 ? (
                  renderProjectRows(nonPendingProjects)
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No completed projects found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>

  );
};

export default MyProjectsPage;
