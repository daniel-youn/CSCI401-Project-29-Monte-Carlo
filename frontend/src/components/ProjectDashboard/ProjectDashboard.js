import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Button, Divider, useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import DoneIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/system';
import Cookies from 'js-cookie';
import axios from 'axios';
import moment from 'moment';

// Styled table row for hover effect
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer',
  }
}));

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [pendingProjects, setPendingProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user data and projects on component mount
  useEffect(() => {
    const fetchUserAndProjects = async () => {
      try {
        // Get user ID from cookies
        const userId = Cookies.get('userId');

        console.log('userId:', userId);

        if (!userId) {
          console.error('No user ID found in session');
          return;
        }

        // Fetch user data
        const userResponse = await axios.get(`http://localhost:5001/api/user/users/${userId}`);
        const userData = userResponse.data;

        console.log('userData:', userData);

        // Parse the user's projects
        const projectPromises = Object.keys(userData.projects).map(async (projectId) => {
          const projectResponse = await axios.get(`http://localhost:5001/api/project/projects/${projectId}`);
          return {
            ...projectResponse.data,
            form_submitted: userData.projects[projectId].access_data.form_submitted,
          };
        });

        const projects = await Promise.all(projectPromises);

        // Separate projects into pending and completed based on form_submitted
        const pending = projects.filter((project) => !project.form_submitted);
        const completed = projects.filter((project) => project.form_submitted);

        setPendingProjects(pending);
        setCompletedProjects(completed);

        // Set admin flag if the user is an admin
        setIsAdmin(userData.isAdmin);
      } catch (error) {
        console.error('Error fetching user or projects:', error);
      }
    };

    fetchUserAndProjects();
  }, []);

  const handleAdminButtonClick = () => {
    navigate('/create-project');
  };

  const renderProjectRows = (projects, isPending) => {
    return projects.map((project) => (
      <StyledTableRow key={project.project_id}>
        <TableCell>{project.project_name}</TableCell>
        <TableCell>{project.admin_user_id}</TableCell>
        <TableCell>{project.shared_users.length}</TableCell>
        <TableCell>{moment(project.creation_time).format('YYYY-MM-DD')}</TableCell>
        <TableCell>${project.revenue_mean_5th_year.toLocaleString()}</TableCell>
        <TableCell>${project.revenue_std_5th_year.toLocaleString()}</TableCell>
        <TableCell>
          {isPending ? <PendingIcon color="warning" /> : <DoneIcon color="success" />}
        </TableCell>
      </StyledTableRow>
    ));
  };

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh', padding: '3rem' }}>
      <Box sx={{ marginBottom: '2.5rem' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
            My Projects
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleAdminButtonClick}
              sx={{
                backgroundColor: 'white',
                color: '#0b1225',  // White button with dark text
                fontWeight: 'bold',
                borderRadius: '5px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',  // Slightly translucent white on hover
                }
              }}
            >
              NEW PROJECT
            </Button>
          )}
        </Box>

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
            <Table aria-label="completed projects table">
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
                {completedProjects.length > 0 ? (
                  renderProjectRows(completedProjects, false)
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

export default ProjectDashboard;
