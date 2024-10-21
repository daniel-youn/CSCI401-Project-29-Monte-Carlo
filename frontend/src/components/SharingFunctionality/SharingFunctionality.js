import React, { useState } from 'react';
import { Box, TextField, Button, Switch, FormControlLabel, Typography } from '@mui/material';

const SharingFunctionality = ({ sharedMembers, setSharedMembers }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Assuming you will replace with API call later

  // Simulated member list (would be fetched via API)
  const allUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Alice Johnson', email: 'alice@example.com' },
  ];

  const handleSearch = () => {
    // Simulate search by filtering `allUsers` by the search query
    const results = allUsers.filter(
      (user) => user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  };

  const handleAddMember = (user) => {
    if (!sharedMembers.find((member) => member.id === user.id)) {
      setSharedMembers([...sharedMembers, { ...user, crossCheck: false }]);
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
    setSharedMembers((prevMembers) =>
      prevMembers.filter((member) => member.id !== id)
    );
  };

  return (
    <Box>
      <Typography variant="h6">Share Project</Typography>

      {/* Search Input */}
      <TextField
        label="Search for Users"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
      />
      <Button onClick={handleSearch} variant="contained" sx={{ mt: 2 }}>
        Search
      </Button>

      {/* Display Search Results */}
      <Box mt={2}>
        {searchResults.map((user) => (
          <Box key={user.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography>{user.name} ({user.email})</Typography>
            <Button onClick={() => handleAddMember(user)} variant="outlined">
              Add
            </Button>
          </Box>
        ))}
      </Box>

      {/* Added Members List */}
      <Typography variant="h6" mt={4}>Shared Members</Typography>
      <Box mt={2}>
        {sharedMembers.map((member) => (
          <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography>{member.name} ({member.email})</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={member.crossCheck}
                  onChange={() => toggleCrossCheck(member.id)}
                />
              }
              label="Ask for Cross-Check Factors"
            />
            <Button
              onClick={() => handleRemoveMember(member.id)}
              variant="outlined"
              color="error"
            >
              Remove
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SharingFunctionality;
