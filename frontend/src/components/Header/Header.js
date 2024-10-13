import React from 'react';
import { Box, Typography } from '@mui/material';

const Header = () => {
  return (
    <Box sx={{ backgroundColor: '#0b1225', padding: '1.5rem' }}>
      <Typography variant="h4" sx={{ color: 'white' }}>
        CaseFlow
      </Typography>
    </Box>
  );
};

export default Header;
