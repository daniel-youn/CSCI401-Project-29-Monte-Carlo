import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container } from '@mui/material';

const CodeInputForm = () => {
  const [code, setCode] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log("Submitted Code:", code);
  };

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'left',
        }}
      >
        <Typography component="h1" variant="h5">
          Submit Code
        </Typography>
        <TextField
          margin="normal"
          required
          fullWidth
          id="code"
          label="Code"
          name="code"
          multiline
          rows={1}
          placeholder="Enter your code here"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Submit
        </Button>
      </Box>
    </Container>
  );
};

export default CodeInputForm;
