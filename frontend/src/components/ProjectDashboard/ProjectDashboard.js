import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Button, Divider, CircularProgress, useTheme, Avatar, Chip, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import Cookies from 'js-cookie';
import axios from 'axios';
import moment from 'moment';
import { Folder, Group, TrendingUp, TrendingDown, CalendarToday } from '@mui/icons-material';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer',
  },
  // Subtle alternating row color
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover + '14',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: theme.palette.common.white,
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
      // Otherwise, go to the Form Page (for pending projects)
      if (projectsWithCross.has(projectId)) {
        navigate(`/form/${projectId}/${true}`);
      }
      else {
        navigate(`/form/${projectId}/${false}`);
      }
    }
  };

  // Utility function to format numbers
  const formatNumber = (number) => {
    if (number >= 1000000) {
      return '$' + (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return '$' + (number / 1000).toFixed(1) + 'K';
    } else {
      return '$' + number.toFixed(2);
    }
  };

  const renderProjectRows = (projects) => {
    return projects.map((project) => {
      const isFormSubmitted = project.form_submitted;
      const statusLabel = isFormSubmitted ? 'Completed' : 'Pending';
      const statusColor = isFormSubmitted ? 'success' : 'warning';

      // Conditional styling for revenue
      const revenueMeanColor = project.revenue_mean_5th_year > 1000000 ? 'success.main' : 'text.primary';
      const revenueStdDevColor = project.revenue_std_5th_year > 500000 ? 'error.main' : 'text.primary';

      const creationDateFormatted = moment(project.creation_time).format('MMM DD, YYYY');
      const creationDateFull = moment(project.creation_time).format('MMMM Do YYYY, h:mm:ss a');

      return (
        <StyledTableRow 
          key={project.project_id} 
          onClick={() => handleProjectClick(project.project_id, project.form_submitted)}
        >
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1">{project.project_name}</Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 32, height: 32, marginRight: '0.5rem' }}>
                {project.admin_user_id.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2">{project.admin_user_id}</Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Tooltip title={`Created on ${creationDateFull}`}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ marginRight: '0.5rem', color: theme.palette.primary.main }} />
                <Typography variant="body2">{creationDateFormatted}</Typography>
              </Box>
            </Tooltip>
          </TableCell>
          {/* Status Chip moved before Contributors */}
          <TableCell>
            <Chip
              label={statusLabel}
              color={statusColor}
              variant="outlined"
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </TableCell>
          {/* Contributors with icon */}
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Group sx={{ marginRight: '0.5rem', color: theme.palette.primary.main }} />
              <Typography variant="body2">{project.shared_users.length}</Typography>
            </Box>
          </TableCell>
          {/* Revenue values formatted and made visually interesting */}
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {project.revenue_mean_5th_year >= 0 ? (
                <TrendingUp sx={{ color: 'green', marginRight: '0.5rem' }} />
              ) : (
                <TrendingDown sx={{ color: 'red', marginRight: '0.5rem' }} />
              )}
              <Typography variant="h6" sx={{ color: revenueMeanColor }}>
                {formatNumber(project.revenue_mean_5th_year)}
              </Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Typography variant="h6" sx={{ color: revenueStdDevColor }}>
              {formatNumber(project.revenue_std_5th_year)}
            </Typography>
          </TableCell>
        </StyledTableRow>
      );
    });
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
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
              <Table aria-label="all projects table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell><strong>Project Name</strong></StyledTableCell>
                    <StyledTableCell><strong>Creator</strong></StyledTableCell>
                    <StyledTableCell><strong>Status</strong></StyledTableCell>
                    <StyledTableCell><strong>Contributors</strong></StyledTableCell>
                    <StyledTableCell><strong>Creation Date</strong></StyledTableCell>
                    <StyledTableCell><strong>Estimated Revenue</strong></StyledTableCell>
                    <StyledTableCell><strong>Revenue Variability</strong></StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.length > 0 ? renderProjectRows(projects) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
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
                <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
                  <Table aria-label="pending projects table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell><strong>Project Name</strong></StyledTableCell>
                        <StyledTableCell><strong>Creator</strong></StyledTableCell>
                        <StyledTableCell><strong>Status</strong></StyledTableCell>
                        <StyledTableCell><strong>Contributors</strong></StyledTableCell>
                        <StyledTableCell><strong>Creation Date</strong></StyledTableCell>
                        <StyledTableCell><strong>Estimated Revenue</strong></StyledTableCell>
                        <StyledTableCell><strong>Revenue Variability</strong></StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingProjects.length > 0 ? renderProjectRows(pendingProjects) : (
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

              <Box>
                <Typography variant="h5" gutterBottom sx={{ marginBottom: '1rem' }}>
                  Completed Projects
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
                  <Table aria-label="completed projects table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell><strong>Project Name</strong></StyledTableCell>
                        <StyledTableCell><strong>Creator</strong></StyledTableCell>
                        <StyledTableCell><strong>Status</strong></StyledTableCell>
                        <StyledTableCell><strong>Contributors</strong></StyledTableCell>
                        <StyledTableCell><strong>Creation Date</strong></StyledTableCell>
                        <StyledTableCell><strong>Estimated Revenue</strong></StyledTableCell>
                        <StyledTableCell><strong>Revenue Variability</strong></StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {completedProjects.length > 0 ? renderProjectRows(completedProjects) : (
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
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProjectDashboard;
