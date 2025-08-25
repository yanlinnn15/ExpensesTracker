import React, { useState } from 'react';
import { Grid, Box, Card, Stack, Typography, Button, CircularProgress, Container } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { Google as GoogleIcon, PersonOutline as GuestIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../helpers/showtoast';
import API_URL from '../../config/api';
import axios from 'axios';

const Login = () => {
  const [loading, setLoading] = useState({ google: false, guest: false });
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    setLoading(prev => ({ ...prev, google: true }));
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleGuestLogin = async () => {
    setLoading(prev => ({ ...prev, guest: true }));
    try {
      console.log('Attempting guest login to:', `${API_URL}/auth/guest`);
      
      // Add timeout to the request
      const response = await axios.post(`${API_URL}/auth/guest`, {}, {
        withCredentials: true,
        timeout: 5000, // 5 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Guest login response:', response.data);

      if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('userId', response.data.id);
        localStorage.setItem('fname', response.data.fname);
        showToast('Successfully logged in as guest', 'success');
        navigate('/dashboard');
      } else {
        throw new Error(response.data.message || 'Failed to login as guest');
      }
    } catch (error) {
      console.error('Guest login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });

      let errorMessage = 'Failed to login as guest: ';
      if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out. Server might be down.';
      } else if (!error.response) {
        errorMessage += 'Cannot connect to server. Please check if the server is running.';
      } else {
        errorMessage += error.response.data?.message || error.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(prev => ({ ...prev, guest: false }));
    }
  };

  return (
    <PageContainer title="Login - Personal Expense Tracker">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: (theme) => theme.palette.grey[100],
        }}
      >
        <Container maxWidth="sm">
          <Card
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 4,
              backgroundColor: 'white',
            }}
          >
            <Stack spacing={4} alignItems="center">
              <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                Personal Expense Tracker
              </Typography>

              <Stack spacing={2} width="100%">
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  startIcon={loading.google ? <CircularProgress size={20} /> : <GoogleIcon />}
                  onClick={handleGoogleLogin}
                  disabled={loading.google || loading.guest}
                  sx={{
                    py: 1.5,
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
                  size="large"
                  variant="outlined"
                  startIcon={loading.guest ? <CircularProgress size={20} /> : <GuestIcon />}
                  onClick={handleGuestLogin}
                  disabled={loading.google || loading.guest}
                  sx={{ py: 1.5 }}
                >
                  {loading.guest ? 'Creating account...' : 'Continue as Guest'}
                </Button>
              </Stack>

              <Typography variant="caption" color="textSecondary" textAlign="center">
                Guest accounts and their data will be automatically deleted after 24 hours of inactivity
              </Typography>
            </Stack>
          </Card>
        </Container>
      </Box>
    </PageContainer>
  );
};

export default Login;
