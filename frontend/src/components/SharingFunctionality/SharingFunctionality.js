import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Autocomplete, Button, Switch, FormControlLabel } from '@mui/material';

const SharingFunctionality = ({ sharedMembers, setSharedMembers }) => {
  const [allUsers, setAllUsers] = useState([]);

  // Fetch user data from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/user/users');
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

  // Handle adding members with only user_id (as string)
  const handleAddMember = (user) => {
    if (!sharedMembers.some((member) => member.id === user.id)) {
      setSharedMembers([...sharedMembers, { id: user.id, crossCheck: false }]);
    }
  };

  const toggleCrossCheck = (id) => {
    setSharedMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === id
          ? { ...member, crossCheck: !member.crossCheck }
          : member
      )
    );
  };

  const handleRemoveMember = (id) => {
    setSharedMembers((prevMembers) => prevMembers.filter((member) => member.id !== id));
  };

  return (
    <Box>
      <Typography variant="h6" align="left" gutterBottom>
        Share Project
      </Typography>

      <Autocomplete
        options={allUsers}
        getOptionLabel={(option) => `${option.name} (${option.email})`}  // Display name and email
        onChange={(event, newValue) => {
          if (newValue) {
            handleAddMember(newValue);  // Pass only user_id as string
          }
        }}
        renderInput={(params) => (
          <TextField {...params} label="Search for Users" variant="outlined" fullWidth />
        )}
        sx={{ mt: 2 }}
      />

      <Typography variant="h6" mt={4} align="left">
        Shared Members
      </Typography>
      {sharedMembers.length > 0 ? (
        <Box mt={2}>
          {sharedMembers.map((member) => (
            <Box
              key={member.id}
              sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}
            >
              <Typography sx={{ width: '300px' }}>
                {allUsers.find((user) => user.id === member.id)?.name || 'Unknown User'} ({allUsers.find((user) => user.id === member.id)?.email || ''})
              </Typography>

              <Box sx={{ width: '200px' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={member.crossCheck}
                      onChange={() => toggleCrossCheck(member.id)}
                    />
                  }
                  label="Cross-Check Factors"
                />
              </Box>

              <Button
                onClick={() => handleRemoveMember(member.id)}
                variant="outlined"
                color="error"
                sx={{ width: '100px' }}
              >
                Remove
              </Button>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body1" color="textSecondary">
          No members added yet. Use the search above to add members.
        </Typography>
      )}
    </Box>
  );
};

export default SharingFunctionality;
