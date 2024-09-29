import React from 'react';
import { Divider, Box, Typography, Container } from '@mui/material';
import LoginForm from '../../components/LoginForm/LoginForm';
import CodeInputForm from '../../components/CodeInputForm/CodeInputForm';
const LoginPage = () => {
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 4, padding: 4 }}>
        <Container
          minWidth="xs"
          minHeight="md"
          sx={{ backgroundColor: '#e0f7fa', padding: 4, minHeight: '700px' }}
        >
          <Typography variant="h5" gutterBottom>
            Some Title Here
          </Typography>
        </Container>
        <Container
          maxWidth="sm"
          sx={{ backgroundColor: '#f5f5f5', padding: 4 }}
        >
          <CodeInputForm />
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mt: 4 }}>
            <Divider sx={{ flexGrow: 1 }} />
            <Typography variant="body1" sx={{ mx: 2 }}>
              OR
            </Typography>
            <Divider sx={{ flexGrow: 1 }} />
          </Box>
          <LoginForm />
        </Container>
      </Box>
    </>
  );
};

export default LoginPage;
