import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ContentContainer = ({ title, children, padding = '0rem', contentBackgroundColor = "white", contentPadding = "1rem", marginTop = ".5rem" }) => {
  return (
    <>
      <Box sx={{ padding: padding, marginTop: marginTop }}>
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
            {title}
          </Typography>
        </Box>
        <Paper 
          elevation={3} 
          sx={{ 
            backgroundColor: contentBackgroundColor, 
            padding: contentPadding, 
            maxWidth: '100%',  // Prevent Paper from exceeding parent width
            overflowX: 'auto',  // Enable scrolling if necessary
          }}
        >
          {/* Header with changeable title */}

          {/* Children content passed as props */}
          <Box>
            {children}
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default ContentContainer;
