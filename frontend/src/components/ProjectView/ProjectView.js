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
import AggregateFactorGraph from '../AggregateFactorGraph/AggregateFactorGraph';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ProjectView = () => {
  const { projectId } = useParams();  // Get projectId from the URL
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [showOverlay, setShowOverlay] = useState(false);
  const [projectData, setProjectData] = useState(null);  // State to hold project details
  const [normalSimOutput, setNormalSimOutput] = useState(null);  // State to hold normal simulation data
  const [adminSimOutput, setAdminSimOutput] = useState(null);  // State to hold normal simulation data
  const [aggregateData, setAggregateData] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [sharedMembers, setSharedMembers] = useState([]);
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
  };

  useEffect(() => {
    if (!projectId) {
      console.error('No project ID found in URL');
      return;
    }
    console.log(projectId)
    const fetchAggregateDistribution = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/simulation/get_aggregate_distribution/${projectId}`);

        // Check if the response is ok
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }

        // Parse the JSON response
        const data = await response.json();
        // console.log(data);
        // Set the distribution data in state
        setAggregateData(data);
      } catch (error) {
        console.error('Error fetching aggregate data', error);
      }
    };
    const fetchProjectData = async () => {
      try {
        // Fetch project details
        const projectResponse = await fetch(`http://localhost:5001/api/project/projects/${projectId}`);
        const projectData = await projectResponse.json();
        setProjectData(projectData);
        setSharedMembers(projectData.shared_users)
        // Get simId from the projectResponse
        const simId = projectData.normal_sim_id;  // Use the normal_sim_id from the project data
        if (!simId) {
          console.error('No normal_sim_id found in project data');
          return;
        }
        const simulationResponse = await fetch(`http://localhost:5001/api/output/outputs/simulation/${simId}`);
        const simulationData = await simulationResponse.json();
        const lastSimulation = simulationData[simulationData.length - 1];
        setNormalSimOutput(lastSimulation);


        // Get simId from the projectResponse
        const adminSimId = projectData.admin_sim_id;  // Use the admin_sim_id from the project data
        if (!adminSimId) {
          console.error('No admin_sim_id found in project data');
          return;
        }
        const adminSimulationResponse = await fetch(`http://localhost:5001/api/output/outputs/simulation/${adminSimId}`);
        const adminSimulationData = await adminSimulationResponse.json();
        const lastAdminSimulation = adminSimulationData[adminSimulationData.length - 1];
        setAdminSimOutput(lastAdminSimulation);



      } catch (error) {
        console.error('Error fetching project or simulation data:', error);
      }
    };

    fetchProjectData();
    fetchAggregateDistribution();
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
  const toggleShare = () => {
    console.log(projectData);
    setShowShare(!showShare);
  }
  const updateSharedList = () => {
    console.log("Before updating:", projectData);

    // Format creation_time and exclude project_id
    const { project_id, creation_time, ...restData } = projectData;
    const updatedData = {
      ...restData,
      shared_users: sharedMembers,
      creation_time: new Date(creation_time).toISOString()
    };

    // Update the project data state
    setProjectData((prevData) => ({
      ...prevData,
      shared_users: sharedMembers,
      creation_time: updatedData.creation_time
    }));

    // Use updatedData directly for updateProject to ensure correct data is used
    updateProject(project_id, updatedData);

    console.log("After setting state with updatedData:", updatedData);
  };

  async function updateProject(projectId, updatedData) {
    try {
      const response = await fetch(`http://localhost:5001/api/project/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
      } else if (response.status === 404) {
        console.error('Project not found');
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.error);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }

  const chartData = {
    labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'], // Assuming 5 years
    datasets: [
      // normal sin datasets
      {
        label: 'Estimated Revenue', // This is now the only visible legend item
        data: normalSimOutput?.summary_statistics.map(stat => stat.mean),
        fill: '+1', // Fill the area between this dataset and the next (Std Down to Std Up)
        borderColor: '#07ABAE', // Main line for "Estimated Revenue"
        backgroundColor: 'rgba(7, 171, 174, 0.1)', // Translucent fill between std down and std up
        pointBackgroundColor: '#fff',
        pointBorderColor: '#07ABAE',
      },
      {
        label: 'Std Down', // Dotted line for Std Down (not shown in the legend)
        data: normalSimOutput?.summary_statistics.map(stat => stat.mean - stat.std_dev),
        fill: false, // No fill below this line
        borderColor: '#07ABAE', // Same color as Estimated Revenue, but dotted
        borderDash: [5, 5], // Dotted line style
        pointBackgroundColor: 'rgba(0, 0, 0, 0)', // No points visible
        pointBorderColor: 'rgba(0, 0, 0, 0)',
      },
      {
        label: 'Std Up', // Dotted line for Std Up (not shown in the legend)
        data: normalSimOutput?.summary_statistics.map(stat => stat.mean + stat.std_dev),
        fill: '-1', // Fill the area between this and the previous dataset (std up and std down)
        borderColor: '#07ABAE', // Same color as Estimated Revenue, but dotted
        backgroundColor: 'rgba(7, 171, 174, 0.1)', // Slightly different translucent color for std up
        borderDash: [5, 5], // Dotted line style
        pointBackgroundColor: 'rgba(0, 0, 0, 0)', // No points visible
        pointBorderColor: 'rgba(0, 0, 0, 0)',
      },

      // overlay or admin sim datasets
      ...(showOverlay ? [
        {
          label: 'Estimated Revenue Overlay', // This is now the only visible legend item
          data: adminSimOutput?.summary_statistics.map(stat => stat.mean),
          fill: '+1', // Fill the area between this dataset and the next (Std Down to Std Up)
          borderColor: '#4CAF50', // Main line for "Estimated Revenue"
          backgroundColor: 'rgba(76, 175, 80, 0.1)', // Translucent fill between std down and std up
          pointBackgroundColor: '#fff',
          pointBorderColor: '#4CAF50',
        },
        {
          label: 'Std Down', // Dotted line for Std Down (not shown in the legend)
          data: adminSimOutput?.summary_statistics.map(stat => stat.mean - stat.std_dev),
          fill: false, // No fill below this line
          borderColor: '#4CAF50', // Same color as Estimated Revenue, but dotted
          borderDash: [5, 5], // Dotted line style
          pointBackgroundColor: 'rgba(0, 0, 0, 0)', // No points visible
          pointBorderColor: 'rgba(0, 0, 0, 0)',
        },
        {
          label: 'Std Up', // Dotted line for Std Up (not shown in the legend)
          data: adminSimOutput?.summary_statistics.map(stat => stat.mean + stat.std_dev),
          fill: '-1', // Fill the area between this and the previous dataset (std up and std down)
          borderColor: '#4CAF50', // Same color as Estimated Revenue, but dotted
          backgroundColor: 'rgba(76, 175, 80, 0.1)', // Slightly different translucent color for std up
          borderDash: [5, 5], // Dotted line style
          pointBackgroundColor: 'rgba(0, 0, 0, 0)', // No points visible
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
            return item.text === 'Estimated Revenue' || item.text === 'Estimated Revenue Overlay'; // Adjust this to your overlay label
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
        </Box>
      </Box>
    </Box>
  );

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
          <Button variant="contained" color="primary" sx={{ marginRight: '10px' }} onClick={() => toggleShare()}>
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
      {
        showShare && (
          <Box>
            <SharingFunctionality
              sharedMembers={sharedMembers}
              setSharedMembers={setSharedMembers}
            />
            <Button onClick={() => updateSharedList()}>Update</Button>
          </Box>

        )
      }
    </Box>


  );

  return (
    <Box>
      <Routes>
        <Route path="overview" element={renderOverview()} />
        <Route path="settings" element={renderSettings()} />
        {/* You can add other routes like settings here */}
      </Routes>
    </Box>
  );
};

export default ProjectView;
