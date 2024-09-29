import React from 'react';
import { Box, Typography, Button, Card, CardContent, CardActions } from '@mui/material';

const ProjectThumbnail = ({ projectName, description, contributors, onMoreDetails }) => {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'row', width: '100%', mb: 4, padding: 2 }}>
      {/* Project Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        {/* Project Title and Description in a Row */}
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexGrow: 1 }}>
          {/* Project Title */}
          <Typography
            variant="h6"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '150px', // Ensure the title fits the column space under the header
              flexGrow: 1,
            }}
          >
            {projectName}
          </Typography>

          {/* Project Description */}
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '200px', // Ensure the description fits the column space under the header
              ml: 2,
              flexGrow: 2,
            }}
          >
            {description}
          </Typography>

          {/* Contributors */}
          <Box
            sx={{
              backgroundColor: '#f5f5f5',
              padding: 1,
              borderRadius: 1,
              display: 'inline-block',
              ml: 15, // Add margin between description and contributors
              mr: 4, // Add space between contributors and the button
              maxWidth: '140px', // Ensure this fits under the contributors header
            }}
          >
            <Typography variant="body2" color="primary">
              {contributors} Contributor{contributors > 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <CardActions>
          <Button variant="contained" color="primary" onClick={onMoreDetails}>
            More Details
          </Button>
        </CardActions>
      </Box>
    </Card>
  );
};

export default ProjectThumbnail;
