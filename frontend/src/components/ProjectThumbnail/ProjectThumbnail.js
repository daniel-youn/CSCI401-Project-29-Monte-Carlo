import React from 'react';
import { Box, Typography, Button, Card, CardContent, CardActions, Grid } from '@mui/material';

const ProjectThumbnail = ({ projectName, description, contributors, onMoreDetails }) => {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', width: '100%', mb: 4 }}>
      {/* Placeholder for Graph */}
      <Box
        sx={{
          backgroundColor: '#e0e0e0', // Light grey background as placeholder
          height: 150, // Set height for the graph placeholder
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" color="textSecondary">
          Graph Placeholder
        </Typography>
      </Box>

      {/* Project Info */}
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {projectName}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>

        {/* Contributors Box */}
        <Box
          sx={{
            mt: 2,
            backgroundColor: '#f5f5f5',
            padding: 1,
            borderRadius: 1,
            display: 'inline-block',
          }}
        >
          <Typography variant="body2" color="primary">
            {contributors} Contributor{contributors > 1 ? 's' : ''}
          </Typography>
        </Box>
      </CardContent>

      {/* Button and Actions */}
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" onClick={onMoreDetails}>
          More Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProjectThumbnail;
