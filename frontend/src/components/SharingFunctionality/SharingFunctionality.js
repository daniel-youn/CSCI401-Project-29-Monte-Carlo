import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Autocomplete, Button, Switch, FormControlLabel } from '@mui/material';
import PropTypes from 'prop-types';

const SharingFunctionality = ({ sharedMembers, setSharedMembers }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [crossCheckMembers, setCrossCheckMembers] = useState({});

  // Fetch user data from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/user/users');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Only fetch the necessary user_id for passing, but display full data
        const users = data.map((user) => ({
          id: user.user_id, // user_id will be passed to sharedMembers
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          email: user.email,
        }));

        setAllUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Handle adding members with only user_id as string
  const handleAddMember = (user) => {
    if (!sharedMembers.includes(user.id)) {
      setSharedMembers([...sharedMembers, user.id]);

      // Initialize crossCheck status for the new member
      setCrossCheckMembers((prev) => ({
        ...prev,
        [user.id]: false,
      }));
    }
  };

  // Toggle crossCheck for a member
  const toggleCrossCheck = (id) => {
    setCrossCheckMembers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle removing a member
  const handleRemoveMember = (id) => {
    setSharedMembers((prevMembers) => prevMembers.filter((memberId) => memberId !== id));

    // Remove crossCheck status for the removed member
    setCrossCheckMembers((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  // Retrieve user details by ID for rendering
  const getUserById = (id) => allUsers.find((user) => user.id === id);

  return (
    <Box>
      <Typography variant="h6" align="left" gutterBottom>
        Share Project
      </Typography>

      <Autocomplete
        options={allUsers}
        getOptionLabel={(option) => `${option.name} (${option.email})`} // Display name and email
        onChange={(event, newValue) => {
          if (newValue) {
            handleAddMember(newValue); // Pass only user_id as string
          }
        }}
        renderInput={(params) => (
          <TextField {...params} label="Search for Users" variant="outlined" fullWidth />
        )}
        sx={{ mt: 2 }}
        // To prevent adding the same user multiple times, you can disable already selected users
        filterOptions={(options, state) =>
          options.filter((option) => !sharedMembers.includes(option.id))
        }
      />

      <Typography variant="h6" mt={4} align="left">
        Shared Members
      </Typography>
      {sharedMembers.length > 0 ? (
        <Box mt={2}>
          {sharedMembers.map((id) => {
            const user = getUserById(id);
            return (
              <Box
                key={id}
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}
              >
                <Typography sx={{ width: '300px' }}>
                  {user ? `${user.name} (${user.email})` : 'Unknown User'}
                </Typography>

                <Box sx={{ width: '200px' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={crossCheckMembers[id] || false}
                        onChange={() => toggleCrossCheck(id)}
                        color="primary"
                      />
                    }
                    label="Cross-Check Factors"
                  />
                </Box>

                <Button
                  onClick={() => handleRemoveMember(id)}
                  variant="outlined"
                  color="error"
                  sx={{ width: '100px' }}
                >
                  Remove
                </Button>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Typography variant="body1" color="textSecondary">
          No members added yet. Use the search above to add members.
        </Typography>
      )}
    </Box>
  );
};

// Define PropTypes for better type checking
SharingFunctionality.propTypes = {
  sharedMembers: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSharedMembers: PropTypes.func.isRequired,
};

export default SharingFunctionality;
