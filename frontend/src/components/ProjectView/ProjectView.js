import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import SharingFunctionality from '../SharingFunctionality/SharingFunctionality';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import Cookies from 'js-cookie';

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
import OverlayFormSection from '../OverlayFormSection/OverlayFormSection';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ProjectView = () => {
  const { projectId } = useParams();  // Get projectId from the URL
  const navigate = useNavigate();
  const location = useLocation();
  const [showOverlay, setShowOverlay] = useState(false);
  const [projectData, setProjectData] = useState(null);  // State to hold project details
  const [normalSimOutput, setNormalSimOutput] = useState(null);  // State to hold normal simulation data
  const [adminSimOutput, setAdminSimOutput] = useState(null);  // State to hold admin simulation data
  const [aggregateData, setAggregateData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // State to track if user is admin

  const [sharedUsersData, setSharedUsersData] = useState([]); // State to hold shared users' data

  // Fetch user data to determine admin status
  useEffect(() => {
    const userId = Cookies.get('userId');
    if (userId) {
      const fetchUserData = async () => {
        try {
          const userResponse = await axios.get(`http://localhost:5001/api/user/users/${userId}`);
          const userData = userResponse.data;
          setIsAdmin(userData.is_admin); // Set admin flag based on user data
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }
  }, []);

  const [showShare, setShowShare] = useState(false);
  const [showCrossCheck, setShowCrossCheck] = useState(false);
  const [sharedMembers, setSharedMembers] = useState([]);
  const [crossCheckData, setCrossCheckData] = useState(null);

  // State for delete confirmation dialog and snackbar notifications
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // For confirmation dialog
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); // For notifications

  // Define handler functions for opening and closing the delete dialog
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  // Fetch project details when the component loads or when projectId changes
  const factorTitleMapping = {
    discount: 'Expected Discount per Deal',
    num_deals_year_1: 'Number of Deals for Year 1',
    num_deals_year_2: 'Number of Deals for Year 2',
    num_deals_year_3: 'Number of Deals for Year 3',
    num_deals_year_4: 'Number of Deals for Year 4',
    num_deals_year_5: 'Number of Deals for Year 5',
    num_premium_users: 'Number of Premium Users per Deal',
    num_standard_users: 'Number of Standard Users per Deal',
    wtp_premium: 'Annual Willingness-to-Pay per Premium User',
    wtp_standard: 'Annual Willingness-to-Pay per Standard User',
    initial_market_size: 'Initial Market Size',
    yoy_growth_rate: 'Year Over Year Growth Rate',
  };

  // Move fetchProjectData outside of useEffect
  const fetchProjectData = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/project/projects/${projectId}`);
      if (!response.ok) throw new Error(`Error fetching project data: ${response.statusText}`);
      const projectDataCopy = await response.json();

      setProjectData(projectDataCopy);

      // Fetch normal, admin, and cross-check simulation data
      console.log(projectDataCopy);
      fetchSimulationData(projectDataCopy.normal_sim_id);
      fetchCrossCheckDistribution(projectDataCopy.cross_check_sim_id);
      getAdminOutput(projectDataCopy.admin_sim_id);
      fetchAggregateDistribution();

      // Now, fetch user data for shared_users
      if (projectDataCopy.shared_users && projectDataCopy.shared_users.length > 0) {
        const sharedUsersList = projectDataCopy.shared_users;
        const userPromises = sharedUsersList.map(async (user) => {
          const res = await fetch(`http://localhost:5001/api/user/users/${user.user_id}`);
          const userData = await res.json();
          return {
            ...user,
            email: userData.email,
          };
        });
        const sharedUsers = await Promise.all(userPromises);
        setSharedUsersData(sharedUsers);
      } else {
        setSharedUsersData([]);
      }

    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  };

  // Other functions that need to be defined outside of useEffect
  const fetchAggregateDistribution = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/simulation/get_aggregate_distribution/${projectId}`);
      if (!response.ok) throw new Error(`Error fetching aggregate data: ${response.statusText}`);
      const data = await response.json();
      setAggregateData(data);
    } catch (error) {
      console.error('Error fetching aggregate data:', error);
    }
  };

  const fetchCrossCheckDistribution = async (crossCheckID) => {
    if (!crossCheckID) return;
    try {
      const response = await fetch(`http://localhost:5001/api/output/outputs/simulation/${crossCheckID}`);
      if (!response.ok) throw new Error(`Error fetching cross check data: ${response.statusText}`);
      const data = await response.json();
      setCrossCheckData(data[0]);
    } catch (error) {
      console.error('Error fetching cross check data:', error);
    }
  };

  const getAdminOutput = async (adminSimId) => {
    if (!adminSimId) {
      console.error('No admin_sim_id found in project data');
      return;
    }
    try {
      const adminSimulationResponse = await fetch(`http://localhost:5001/api/output/outputs/simulation/${adminSimId}`);
      if (!adminSimulationResponse.ok) throw new Error(`Error fetching admin simulation data: ${adminSimulationResponse.statusText}`);
      const adminSimulationData = await adminSimulationResponse.json();
      const lastAdminSimulation = adminSimulationData[adminSimulationData.length - 1];
      setAdminSimOutput(lastAdminSimulation);
    } catch (error) {
      console.error('Error fetching admin simulation data:', error);
    }
  };

  const fetchSimulationData = async (simId) => {
    if (!simId) return;
    try {
      const response = await fetch(`http://localhost:5001/api/output/outputs/simulation/${simId}`);
      if (!response.ok) throw new Error(`Error fetching simulation data: ${response.statusText}`);
      const data = await response.json();
      setNormalSimOutput(data[data.length - 1]);
    } catch (error) {
      console.error('Error fetching simulation data:', error);
    }
  };

  useEffect(() => {
    if (!projectId) {
      console.error('No project ID found in URL');
      return;
    }

    fetchProjectData();
  }, [projectId]);

  // Redirect to /project-page/:projectId/overview if visiting /project-page/:projectId
  useEffect(() => {
    if (location.pathname === `/project-page/${projectId}`) {
      navigate(`/project-page/${projectId}/overview`);
    }
  }, [location, navigate, projectId]);

  const handleToggleOverlay = () => {
    setShowOverlay(prev => !prev);
  };

  const handleShowCrossCheck = () => {
    setShowCrossCheck(!showCrossCheck);
  };

  const toggleShare = () => {
    console.log(projectData);
    setShowShare(!showShare);
  };

  const updateSharedList = () => {
    const updateCrossCheckAccess = async (accessList, projectId) => {
      try {
        const structuredData = {
          project_id: projectId,
          users: accessList,
        };

        const response = await fetch('http://localhost:5001/api/project/projects/addUsers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(structuredData),
        });

        if (!response.ok) {
          throw new Error(`Error updating access: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Access updated successfully:', data);

        return data; // or handle the response data as needed
      } catch (error) {
        console.error('Error in updateCrossCheckAccess:', error);
      }
    };

    updateCrossCheckAccess(sharedMembers, projectId)
      .then(() => {
        // Show success notification
        setSnackbar({ open: true, message: 'Users added successfully!', severity: 'success' });
        // Refresh project data to update the shared users list
        fetchProjectData();
        // Reset sharedMembers
        setSharedMembers([]);
        // Hide the sharing functionality component
        setShowShare(false);
      })
      .catch((error) => {
        // Show error notification
        setSnackbar({ open: true, message: 'Failed to add users.', severity: 'error' });
      });
  };

  const handleDeleteProject = async () => {
    try {
      // Assuming your backend is hosted at the same domain. Adjust the URL if different.
      const response = await axios.delete(`http://localhost:5001/api/project/projects/${projectId}`);

      if (response.status === 200) {
        setSnackbar({ open: true, message: 'Project deleted successfully!', severity: 'success' });
        // Navigate to the projects list or homepage after deletion
        navigate('/'); // Adjust the path as needed
      } else {
        setSnackbar({ open: true, message: 'Failed to delete the project.', severity: 'error' });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setSnackbar({ open: true, message: 'An error occurred while deleting the project.', severity: 'error' });
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      const response = await axios.post('http://localhost:5001/api/project/projects/removeUser', {
        project_id: projectId,
        user_id: userId,
      });
      if (response.status === 200) {
        setSnackbar({ open: true, message: 'User removed successfully!', severity: 'success' });
        // Refresh the project data after removing the user
        fetchProjectData();
      } else {
        setSnackbar({ open: true, message: 'Failed to remove the user.', severity: 'error' });
      }
    } catch (error) {
      console.error('Error removing user:', error);
      setSnackbar({ open: true, message: 'An error occurred while removing the user.', severity: 'error' });
    }
  };

  const chartData = {
    labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'], // Assuming 5 years
    datasets: [
      {
        label: 'Estimated Revenue',
        data: normalSimOutput?.summary_statistics.map(stat => stat.mean),
        fill: '+1',
        borderColor: '#07ABAE',
        backgroundColor: 'rgba(7, 171, 174, 0.1)',
        pointBackgroundColor: '#fff',
        pointBorderColor: '#07ABAE',
      },
      {
        label: 'Std Down',
        data: normalSimOutput?.summary_statistics.map(stat => stat.mean - stat.std_dev),
        fill: false,
        borderColor: '#07ABAE',
        borderDash: [5, 5],
        pointBackgroundColor: 'rgba(0, 0, 0, 0)',
        pointBorderColor: 'rgba(0, 0, 0, 0)',
      },
      {
        label: 'Std Up',
        data: normalSimOutput?.summary_statistics.map(stat => stat.mean + stat.std_dev),
        fill: '-1',
        borderColor: '#07ABAE',
        backgroundColor: 'rgba(7, 171, 174, 0.1)',
        borderDash: [5, 5],
        pointBackgroundColor: 'rgba(0, 0, 0, 0)',
        pointBorderColor: 'rgba(0, 0, 0, 0)',
      },

      // Admin overlay datasets
      ...(showOverlay ? [
        {
          label: 'Estimated Revenue Overlay',
          data: adminSimOutput?.summary_statistics.map(stat => stat.mean),
          fill: '+1',
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          pointBackgroundColor: '#fff',
          pointBorderColor: '#4CAF50',
        },
        {
          label: 'Std Down',
          data: adminSimOutput?.summary_statistics.map(stat => stat.mean - stat.std_dev),
          fill: false,
          borderColor: '#4CAF50',
          borderDash: [5, 5],
          pointBackgroundColor: 'rgba(0, 0, 0, 0)',
          pointBorderColor: 'rgba(0, 0, 0, 0)',
        },
        {
          label: 'Std Up',
          data: adminSimOutput?.summary_statistics.map(stat => stat.mean + stat.std_dev),
          fill: '-1',
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderDash: [5, 5],
          pointBackgroundColor: 'rgba(0, 0, 0, 0)',
          pointBorderColor: 'rgba(0, 0, 0, 0)',
        }
      ] : []),

      // Cross Check overlay datasets
      ...(showCrossCheck ? [
        {
          label: 'Cross Check Overlay',
          data: crossCheckData?.summary_statistics.map(stat => stat.mean),
          fill: '+1',
          borderColor: '#FF9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          pointBackgroundColor: '#fff',
          pointBorderColor: '#FF9800',
        },
        {
          label: 'Cross Check Std Down',
          data: crossCheckData?.summary_statistics.map(stat => stat.mean - stat.std_dev),
          fill: false,
          borderColor: '#FF9800',
          borderDash: [5, 5],
          pointBackgroundColor: 'rgba(0, 0, 0, 0)',
          pointBorderColor: 'rgba(0, 0, 0, 0)',
        },
        {
          label: 'Cross Check Std Up',
          data: crossCheckData?.summary_statistics.map(stat => stat.mean + stat.std_dev),
          fill: '-1',
          borderColor: '#FF9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          borderDash: [5, 5],
          pointBackgroundColor: 'rgba(0, 0, 0, 0)',
          pointBorderColor: 'rgba(0, 0, 0, 0)',
        }
      ] : []),
    ],
  };


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // This ensures that the chart adjusts to the parent container
    layout: {
      padding: {
        bottom: 20, // Add some padding at the bottom to ensure x-axis labels are visible
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          filter: function (item) {
            return item.text === 'Estimated Revenue' || item.text === 'Estimated Revenue Overlay' || item.text === 'Cross Check Overlay'; // Adjust this to your overlay label
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#D5D5D5',
          font: {
            size: 14, // Adjust the size if necessary
          },
        },
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Year',
          color: '#D5D5D5',
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
        },
      },
    },
  };

  useEffect(() => {
    console.log("crossCheckData:", crossCheckData);
    console.log("summary_statistics:", crossCheckData?.summary_statistics);
  }, [crossCheckData]);

  const renderOverview = () => (
    <Box sx={{ padding: '2rem' }}>
      {/* Project Title */}
      <Typography variant="h4" sx={{ marginBottom: '2rem', color: '#fff' }}>
        {projectData?.project_name || 'Loading...'}
      </Typography>

      {/* Content Row */}
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
        {/* Aggregated Factors Column */}
        <Box sx={{ flex: 1, minWidth: '200px', maxWidth: '40%', flexGrow: 1 }}>
          <Box
            sx={{
              backgroundColor: '#1e1e1e',
              padding: '1rem',
              borderRadius: '4px',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              maxHeight: '750px',
              overflowY: 'auto',
            }}
          >
            <Typography variant="h6" sx={{ marginBottom: '1.5rem', color: '#fff' }}>
              Aggregated Factors
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {aggregateData ? (
                Object.entries(aggregateData).map(([key, value], index) => (
                  <Box key={index} sx={{ height: '220px', width: '100%' }}>
                    <AggregateFactorGraph
                      factorTitle={factorTitleMapping[key] || `Unknown factor: ${key}`} // More explicit fallback message
                      x_values={value.x_values}
                      y_values={value.y_values}
                    />
                  </Box>
                ))
              ) : (
                <Typography sx={{ color: '#D5D5D5' }}>Loading aggregate data...</Typography> // Loading message if data is not yet available
              )}
            </Box>
          </Box>
        </Box>

        {/* Simulation Summary Column */}
        <Box
          sx={{
            backgroundColor: '#1e1e1e',
            padding: '1rem',
            borderRadius: '4px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '60%', // Adjust this to be responsive
            height: '750px',
            overflow: 'hidden',
            overflowX: 'hidden',
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: '1.5rem', color: '#fff' }}>
            Estimated Revenue
          </Typography>
          <Box
            sx={{
              height: '85%',
              width: '100%',
              paddingBottom: '10px',
              maxWidth: '100%',
              overflowX: 'hidden',
            }}
          >
            {/* may need to change to load just normal sim if only normal sim exists */}
            {normalSimOutput || adminSimOutput ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <Typography sx={{ color: '#D5D5D5' }}>Loading chart data...</Typography>
            )}
          </Box>
          {/* Conditionally render the overlay toggle if user is admin */}
          {isAdmin && (
            <FormControlLabel
              sx={{
                paddingLeft: '1rem',
              }}
              control={
                <Switch
                  checked={showOverlay}
                  onChange={handleToggleOverlay}
                  color="primary"
                />
              }
              label="Overlay"
            />
          )}
          <FormControlLabel
            sx={{
              paddingLeft: '1rem',
            }}
            control={
              <Switch
                checked={showCrossCheck}
                onChange={handleShowCrossCheck}
                color="primary"
              />
            }
            label="Cross Check"
          />
        </Box>
      </Box>
    </Box >
  );

  const renderSettings = () => (
    <Box sx={{ padding: '2rem' }}>
      <Typography variant="h4" sx={{ marginBottom: '2rem', color: '#fff' }}>
        {projectData?.project_name || 'Loading...'}
      </Typography>
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
            Shared Users: {sharedUsersData.length > 0 ? sharedUsersData.length : 'None'}
          </Typography>
        </Box>
        {/* Table for Shared Users */}
        <TableContainer component={Paper} sx={{ marginTop: '2rem', backgroundColor: '#1e1e1e' }}>
          <Table aria-label="shared members table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#D5D5D5' }}>User ID</TableCell>
                <TableCell sx={{ color: '#D5D5D5' }}>Email</TableCell>
                <TableCell sx={{ color: '#D5D5D5' }}>Cross Check Access</TableCell>
                <TableCell sx={{ color: '#D5D5D5' }}>Actions</TableCell> {/* New column for actions */}
              </TableRow>
            </TableHead>
            <TableBody>
              {sharedUsersData.map((user, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ color: '#D5D5D5' }}>{user.user_id}</TableCell>
                  <TableCell sx={{ color: '#D5D5D5' }}>{user.email}</TableCell>
                  <TableCell sx={{ color: '#D5D5D5' }}>
                    {user.cross_check_access ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell sx={{ color: '#D5D5D5' }}>
                    <Button
                      color="error"
                      onClick={() => handleRemoveUser(user.user_id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!sharedUsersData.length && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ color: '#D5D5D5', textAlign: 'center' }}>
                    No shared users
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Example buttons */}
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            sx={{ marginRight: '10px' }}
            onClick={() => toggleShare()}
          >
            Share to More Members
          </Button>
          {isAdmin && ( // Only show the delete button if the user is an admin
            <Button
              variant="outlined"
              color="error"
              onClick={handleOpenDeleteDialog}
            >
              Delete Project
            </Button>
          )}
        </Box>
      </Box>
      {
        showShare && (
          <Box>
            <SharingFunctionality
              sharedMembers={sharedMembers}
              setSharedMembers={setSharedMembers}
            />
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => updateSharedList()}
            >
              Update
            </Button>
          </Box>
        )
      }

      {/* Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-project-dialog-title"
        aria-describedby="delete-project-dialog-description"
      >
        <DialogTitle id="delete-project-dialog-title">Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-project-dialog-description">
            Are you sure you want to delete the project "{projectData?.project_name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={() => { handleDeleteProject(); handleCloseDeleteDialog(); }} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );


  const renderOverlay = () => (
    <Box sx={{ padding: '2rem' }}>
      <Typography variant="h4" sx={{ marginBottom: '2rem', color: '#fff' }}>
        {projectData?.project_name || 'Loading...'}
      </Typography>
      <OverlayFormSection projectId={projectId} aggregateData={aggregateData} />
    </Box>
  );

  return (
    <Box>
      <Routes>
        <Route path="overview" element={renderOverview()} />
        <Route path="settings" element={renderSettings()} />
        <Route path="overlay" element={renderOverlay()} />
        {/* You can add other routes like settings here */}
      </Routes>
    </Box>
  );
};

export default ProjectView;
