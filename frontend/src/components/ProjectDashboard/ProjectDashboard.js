import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Button, Divider, useTheme
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
  const [projectsWithCross, setProjectsWithCross] = useState(new Set())
  // Fetch user data and projects on component mount
  useEffect(() => {
    const fetchUserAndProjects = async () => {
      try {
        // Get user ID from cookies
        const userId = Cookies.get('userId');
        if (!userId) {
          console.error('No user ID found in session');
          return;
        }

        // Fetch user data
        const userResponse = await axios.get(`http://localhost:5001/api/user/users/${userId}`);
        const userData = userResponse.data;
        // Parse the user's projects

        const projectsWithCrossCheckAccess = Object.values(userData.projects)
          .filter((project) => project.access_data.cross_check_access)
          .map((project) => ({
            project_id: project.project_id,
            hasCrossCheckAccess: project.access_data.cross_check_access,
          }));
        setProjectsWithCross(new Set(projectsWithCrossCheckAccess))
        const projectPromises = Object.keys(userData.projects).map(async ([projectId, project]) => {

          const projectResponse = await axios.get(`http://localhost:5001/api/project/projects/${projectId}`);
          return {
            ...projectResponse.data,
            form_submitted: userData.projects[projectId].access_data.form_submitted,
          };
        });

        const projects = await Promise.all(projectPromises);

        // Separate projects into pending and completed based on form_submitted if not an Admin
        if (userData.is_admin) {
          setProjects(projects); // Admins don't fill out forms, so just display all projects
        } else {
          const pending = projects.filter((project) => !project.form_submitted);
          const completed = projects.filter((project) => project.form_submitted);
          setPendingProjects(pending);
          setCompletedProjects(completed);
        }

        // Set admin flag if the user is an admin
        setIsAdmin(userData.is_admin);
      } catch (error) {
        console.error('Error fetching user or projects:', error);
      }
    };

    fetchUserAndProjects();
  }, []);

  // Handle clicking on a project based on user role
  //TODO: PASS BOOLEAN INDICATING THAT WE HAVE PERMS FOR CROSS CHECK FACTORS
  const handleProjectClick = (projectId, isFormSubmitted) => {
    if (isAdmin || isFormSubmitted) {
      // If the user is an admin or the form has been submitted, go to the Project View Page
      navigate(`/project-page/${projectId}/overview`);
    } else {
      // Otherwise, go to the Form Page (for pending projects)
      if (projectsWithCross.has(projectId)) {
        navigate(`/form/${projectId}/${true}`);
      }
      else {

      }
      navigate(`/form/${projectId}/${false}`);
    }
  };

  const renderProjectRows = (projects) => {
    return projects.map((project) => (
      <StyledTableRow key={project.project_id} onClick={() => handleProjectClick(project.project_id)}>
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

        {/* Display projects for Admin */}
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
                {projects.length > 0 ? (
                  renderProjectRows(projects)
                ) : (
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
            {/* Pending Projects for Stakeholders */}
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

            {/* Completed Projects for Stakeholders */}
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
                    {completedProjects.length > 0 ? (
                      renderProjectRows(completedProjects)
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
          </>
        )}
      </Box>
    </Box>
  );
};

export default ProjectDashboard;
