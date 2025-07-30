import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Box, Card, Stack, Typography, Button, CircularProgress } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../helpers/showtoast';

const Login2 = () => {
  const [loading, setLoading] = useState({ google: false, guest: false });
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    setLoading(prev => ({ ...prev, google: true }));
    // Redirect to backend Google OAuth route
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleGuestLogin = async () => {
    setLoading(prev => ({ ...prev, guest: true }));
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
      });

      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('accessToken', data.token);
        showToast('Welcome! You are logged in as a guest', 'success');
        navigate('/dashboard');
      } else {
        throw new Error(data.message || 'Failed to login as guest');
      }
    } catch (error) {
      console.error('Guest login error:', error);
      showToast(error.message || 'Failed to login as guest. Please try again.', 'error');
    } finally {
      setLoading(prev => ({ ...prev, guest: false }));
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
                    <Typography variant="body2" color="textSecondary" textAlign="center" mb={3}>
                      Track your expenses, manage your budget, and reach your financial goals
                    </Typography>
                  </Box>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={loading.google ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
                    onClick={handleGoogleLogin}
                    disabled={loading.google || loading.guest}
                    sx={{
                      backgroundColor: '#4285F4',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#357ABD',
                      },
                    }}
                  >
                    {loading.google ? 'Connecting...' : 'Continue with Google'}
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleGuestLogin}
                    disabled={loading.google || loading.guest}
                    startIcon={loading.guest && <CircularProgress size={20} />}
                  >
                    {loading.guest ? 'Creating guest account...' : 'Continue as Guest'}
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
