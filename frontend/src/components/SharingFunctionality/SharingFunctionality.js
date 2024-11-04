import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Autocomplete, Button, Switch, FormControlLabel } from '@mui/material';
import PropTypes from 'prop-types';

const SharingFunctionality = ({ sharedMembers, setSharedMembers }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [crossCheckMembers, setCrossCheckMembers] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/user/users');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const users = data.map((user) => ({
          id: user.user_id,
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

  const handleAddMember = (user) => {
    if (!sharedMembers.some(member => member.user_id === user.id)) {
      setSharedMembers([...sharedMembers, { user_id: user.id, cross_check_access: false }]);
    }
  };

  const toggleCrossCheck = (id) => {
    setSharedMembers(prevMembers =>
      prevMembers.map(member =>
        member.user_id === id
          ? { ...member, cross_check_access: !member.cross_check_access }
          : member
      )
    );
  };

  const handleRemoveMember = (id) => {
    setSharedMembers(prevMembers => prevMembers.filter(member => member.user_id !== id));
  };

  const getUserById = (id) => allUsers.find((user) => user.id === id);

  return (
    <Box>
      <Typography variant="h6" align="left" gutterBottom>
        Share Project
      </Typography>

      <Autocomplete
        options={allUsers}
        getOptionLabel={(option) => `${option.name} (${option.email})`}
        onChange={(event, newValue) => {
          if (newValue) {
            handleAddMember(newValue);
          }
        }}
        renderInput={(params) => (
          <TextField {...params} label="Search for Users" variant="outlined" fullWidth />
        )}
        sx={{ mt: 2 }}
        filterOptions={(options, state) =>
          options.filter((option) => !sharedMembers.some(member => member.user_id === option.id))
        }
      />

      <Typography variant="h6" mt={4} align="left">
        Shared Members
      </Typography>
      {sharedMembers.length > 0 ? (
        <Box mt={2}>
          {sharedMembers.map(({ user_id, cross_check_access }) => {
            const user = getUserById(user_id);
            return (
              <Box
                key={user_id}
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}
              >
                <Typography sx={{ width: '300px' }}>
                  {user ? `${user.name} (${user.email})` : 'Unknown User'}
                </Typography>

                <Box sx={{ width: '200px' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={cross_check_access}
                        onChange={() => toggleCrossCheck(user_id)}
                        color="primary"
                      />
                    }
                    label="Cross-Check Factors"
                  />
                </Box>

                <Button
                  onClick={() => handleRemoveMember(user_id)}
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

SharingFunctionality.propTypes = {
  sharedMembers: PropTypes.arrayOf(
    PropTypes.shape({
      user_id: PropTypes.string.isRequired,
      cross_check_access: PropTypes.bool.isRequired,
    })
  ).isRequired,
  setSharedMembers: PropTypes.func.isRequired,
};

export default SharingFunctionality;
