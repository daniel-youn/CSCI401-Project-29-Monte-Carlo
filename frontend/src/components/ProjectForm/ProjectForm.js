import React, { useState } from 'react';
import {
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Button,
  Typography,
  Container,
} from '@mui/material';

const ProjectForm = () => {
  const [distribution, setDistribution] = useState('');
  const [formData, setFormData] = useState({
    mean: '',
    stdDev: '',
    min: '',
    max: '',
    lambda: '',
  });
  const [error, setError] = useState(false);

  const handleDistributionChange = (event) => {
    setDistribution(event.target.value);
    setFormData({
      mean: '',
      stdDev: '',
      min: '',
      max: '',
      lambda: '',
    });
    setError(false); // Reset error when selection changes
  };

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!distribution) {
      setError(true);
      return;
    }
    setError(false);
    console.log('Form Data:', formData);
    // Process form submission here
  };

  return (
    <Container maxWidth="sm">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 5 }}
      >
        <Typography variant="h5" gutterBottom>
          Select Distribution and Input Parameters
        </Typography>

        {/* Dropdown for selecting distribution */}
        <FormControl fullWidth required error={error}>
          <InputLabel>Select Distribution</InputLabel>
          <Select
            value={distribution}
            onChange={handleDistributionChange}
            label="Select Distribution"
          >
            <MenuItem value="">
              <em>Select Distribution</em>
            </MenuItem>
            <MenuItem value="Normal">Normal Distribution</MenuItem>
            <MenuItem value="Uniform">Uniform Distribution</MenuItem>
            <MenuItem value="Poisson">Poisson Distribution</MenuItem>
          </Select>
          {error && (
            <Typography color="error" variant="body2">
              Please select a distribution type.
            </Typography>
          )}
        </FormControl>

        {/* Render input fields dynamically based on distribution */}
        {distribution === 'Normal' && (
          <>
            <TextField
              fullWidth
              label="Mean"
              name="mean"
              value={formData.mean}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              label="Standard Deviation"
              name="stdDev"
              value={formData.stdDev}
              onChange={handleInputChange}
              required
            />
          </>
        )}

        {distribution === 'Uniform' && (
          <>
            <TextField
              fullWidth
              label="Minimum"
              name="min"
              value={formData.min}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              label="Maximum"
              name="max"
              value={formData.max}
              onChange={handleInputChange}
              required
            />
          </>
        )}

        {distribution === 'Poisson' && (
          <TextField
            fullWidth
            label="Lambda"
            name="lambda"
            value={formData.lambda}
            onChange={handleInputChange}
            required
          />
        )}

        <Button variant="contained" type="submit">
          Submit
        </Button>
      </Box>
    </Container>
  );
};

export default ProjectForm;
