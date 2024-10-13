import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ContentContainer = ({ title, children, padding = '0rem', backgroundColor = "white" }) => {
  return (
    <Paper elevation={3} sx={{ backgroundColor: backgroundColor, padding: "2rem" }}>
      {/* Header with changeable title */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            color: '#D5D5D5',
            fontFamily: 'HelveticaLight',
            fontSize: '2.5rem',
            mb: 6,
          }}
        >
          My Project One
        </Typography>
      </Box>

      {/* Children content passed as props */}
      <Box sx={{ paddingBottom: padding }}>
        {children}
      </Box>
    </Paper>
  );
};


export default ContentContainer;
