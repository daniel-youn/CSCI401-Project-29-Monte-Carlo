import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Button, Divider, CircularProgress, useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import Cookies from 'js-cookie';
import axios from 'axios';
import moment from 'moment';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer',
  }
}));

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [projects, setProjects] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projectsWithCross, setProjectsWithCross] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      try {
        const userId = Cookies.get('userId');
        if (!userId) {
          console.error('No user ID found in session');
          return;
        }

        const userResponse = await axios.get(`http://localhost:5001/api/user/users/${userId}`);
        const userData = userResponse.data;

        // Log userData to verify
        console.log('User Data:', userData);

        // Ensure is_admin is a boolean
        const userIsAdmin = !!userData.is_admin;

        setIsAdmin(userIsAdmin);

        // Handle projects with cross-check access
        const projectsWithCrossCheckAccess = Object.entries(userData.projects || {})
          .filter(([projectId, project]) => project.access_data.cross_check_access)
          .map(([projectId]) => projectId);

        setProjectsWithCross(new Set(projectsWithCrossCheckAccess));

        const projectPromises = Object.entries(userData.projects || {}).map(async ([projectId, project]) => {
          try {
            const projectResponse = await axios.get(`http://localhost:5001/api/project/projects/${projectId}`);
            return {
              ...projectResponse.data,
              form_submitted: project.access_data.form_submitted,
            };
          } catch (error) {
            if (error.response && error.response.status === 404) {
              console.warn(`Project with ID ${projectId} not found, skipping.`);
              return null; // Skip this project
            } else {
              throw error; // Re-throw other errors
            }
          }
        });

        const projects = (await Promise.all(projectPromises)).filter(Boolean);

        if (userIsAdmin) {
          setProjects(projects);
        } else {
          const pending = projects.filter((project) => !project.form_submitted);
          const completed = projects.filter((project) => project.form_submitted);
          setPendingProjects(pending);
          setCompletedProjects(completed);
        }
      } catch (error) {
        console.error('Error fetching user or projects:', error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };

    fetchUserAndProjects();
  }, []);

  const handleProjectClick = (projectId, isFormSubmitted) => {
    if (isAdmin || isFormSubmitted) {
      navigate(`/project-page/${projectId}/overview`);
    } else {
      navigate(`/form/${projectId}/${projectsWithCross.has(projectId)}`);
    }
  };

  const renderProjectRows = (projects) => {
    return projects.map((project) => (
      <StyledTableRow 
        key={project.project_id} 
        onClick={() => handleProjectClick(project.project_id, project.form_submitted)}
      >
        <TableCell>{project.project_name}</TableCell>
        <TableCell>{project.admin_user_id}</TableCell>
        <TableCell>{project.shared_users.length}</TableCell>
        <TableCell>{moment(project.creation_time).format('YYYY-MM-DD')}</TableCell>
        <TableCell>${project.revenue_mean_5th_year.toLocaleString()}</TableCell>
        <TableCell>${project.revenue_std_5th_year.toLocaleString()}</TableCell>
      </StyledTableRow>
    ));
  };
  
  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh', padding: '3rem' }}>
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: theme.palette.background.default,
            zIndex: 9999,
            flexDirection: 'column',
          }}
        >
          <CircularProgress size={60} thickness={4.5} />
          <Typography sx={{ marginTop: '1rem', fontSize: '1.25rem', color: theme.palette.text.primary }}>
            Loading...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ marginBottom: '2.5rem' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
              My Projects
            </Typography>
            {isAdmin && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/create-project')}
                sx={{
                  backgroundColor: 'white',
                  color: '#0b1225',
                  fontWeight: 'bold',
                  borderRadius: '5px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
              >
                NEW PROJECT
              </Button>
            )}
          </Box>

          <Divider sx={{ marginBottom: '2rem' }} />

          {isAdmin ? (
            <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
              <Table aria-label="all projects table">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Project Name</strong></TableCell>
                    <TableCell><strong>Creator</strong></TableCell>
                    <TableCell><strong>Contributors</strong></TableCell>
                    <TableCell><strong>Creation Time</strong></TableCell>
                    <TableCell><strong>Revenue Mean</strong></TableCell>
                    <TableCell><strong>Revenue Std Dev</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.length > 0 ? renderProjectRows(projects) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No projects found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <>
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingProjects.length > 0 ? renderProjectRows(pendingProjects) : (
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {completedProjects.length > 0 ? renderProjectRows(completedProjects) : (
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
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProjectDashboard;
