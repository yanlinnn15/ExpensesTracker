import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Box, Card, Stack, Typography, Button } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';
import { Google as GoogleIcon } from '@mui/icons-material';

const Login2 = () => {
  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth route
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleGuestLogin = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('accessToken', data.token);
        // Redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Guest login error:', error);
    }
  };
  
  return (
    <PageContainer title="Login" description="this is Login page">
      <Box
        sx={{
          position: 'relative',
          '&:before': {
            content: '""',
            background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            position: 'absolute',
            height: '100%',
            width: '100%',
            opacity: '0.3',
          },
        }}
      >
        <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
          <Grid item xs={12} sm={8} lg={4} xl={3}>
            <Box
              sx={{
                position: 'relative',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Card elevation={9} sx={{ p: 4, zIndex: 1, width: '100%' }}>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Logo />
                </Box>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h3" textAlign="center" mb={2}>
                      Welcome to Expense Tracker
                    </Typography>
                  </Box>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleLogin}
                    sx={{
                      backgroundColor: '#4285F4',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#357ABD',
                      },
                    }}
                  >
                    Continue with Google
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleGuestLogin}
                  >
                    Continue as Guest
                  </Button>

                  <Typography variant="caption" color="text.secondary" align="center">
                    Guest data will be deleted after 24 hours of inactivity
                  </Typography>
                </Stack>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Login2;
