import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get token from URL params
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Save token
      localStorage.setItem('accessToken', token);
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      // Handle error
      navigate('/auth/login');
    }
  }, [navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <CircularProgress />
      <Typography variant="h6" mt={2}>
        Completing login...
      </Typography>
    </Box>
  );
};

export default GoogleCallback;
