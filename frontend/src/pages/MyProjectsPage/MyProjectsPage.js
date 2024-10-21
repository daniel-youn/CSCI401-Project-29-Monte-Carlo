import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Button, Divider, useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import DoneIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/system';

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

// Styled table row for hover effect
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer',
  }
}));

const MyProjectsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedIsAdmin = sessionStorage.getItem('isAdmin');
    if (storedIsAdmin === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const pendingProjects = sampleProjects.filter(project => project.pending);
  const nonPendingProjects = sampleProjects.filter(project => !project.pending);

  const handleAdminButtonClick = () => {
    navigate('/admin-dashboard');
  };

  const renderProjectRows = (projects, isPending) => {
    return projects.map((project) => (
      <StyledTableRow key={project.id}>
        <TableCell>{project.name}</TableCell>
        <TableCell>{project.creator}</TableCell>
        <TableCell>{project.contributors}</TableCell>
        <TableCell>{project.creationTime}</TableCell>
        <TableCell>${project.revenuePrediction.mean.toLocaleString()}</TableCell>
        <TableCell>${project.revenuePrediction.stddev.toLocaleString()}</TableCell>
        <TableCell>
          {isPending ? <PendingIcon color="warning" /> : <DoneIcon color="success" />}
        </TableCell>
      </StyledTableRow>
    ));
  };

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh', padding: '3rem' }}>
      
      <Box sx={{ marginBottom: '2.5rem' }}>
        <Typography variant="h4" gutterBottom sx={{ color: theme.palette.text.primary, marginBottom: '1.5rem' }}>
          My Projects
        </Typography>

        {isAdmin && (
          <Box sx={{ position: 'absolute', top: '2rem', right: '2rem' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAdminButtonClick}
              sx={{
                backgroundColor: theme.palette.secondary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.secondary.dark
                }
              }}
            >
              Admin Dashboard
            </Button>
          </Box>
        )}

        <Divider sx={{ marginBottom: '2rem' }} />

        <Box sx={{ marginBottom: '3rem' }}>
          <Typography variant="h5" gutterBottom sx={{ marginBottom: '1rem' }}>
            Pending Projects
          </Typography>
          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table aria-label="pending projects table">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Project Name</strong></TableCell>
                  <TableCell><strong>Creator</strong></TableCell>
                  <TableCell><strong>Contributors</strong></TableCell>
                  <TableCell><strong>Creation Time</strong></TableCell>
                  <TableCell><strong>Revenue Mean</strong></TableCell>
                  <TableCell><strong>Revenue Std Dev</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingProjects.length > 0 ? (
                  renderProjectRows(pendingProjects, true)
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No pending projects found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ marginBottom: '2rem' }} />

        <Box>
          <Typography variant="h5" gutterBottom sx={{ marginBottom: '1rem' }}>
            Completed Projects
          </Typography>
          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table aria-label="non-pending projects table">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Project Name</strong></TableCell>
                  <TableCell><strong>Creator</strong></TableCell>
                  <TableCell><strong>Contributors</strong></TableCell>
                  <TableCell><strong>Creation Time</strong></TableCell>
                  <TableCell><strong>Revenue Mean</strong></TableCell>
                  <TableCell><strong>Revenue Std Dev</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nonPendingProjects.length > 0 ? (
                  renderProjectRows(nonPendingProjects, false)
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
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
