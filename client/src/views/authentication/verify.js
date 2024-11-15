import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ErrorImg from 'src/assets/images/backgrounds/404-error-idea.gif';
import { IconCheck } from '@tabler/icons-react';

function Verify() {
    const [msg, setMsg] = useState("");
    const [errormsg, setErrorMsg] = useState("");
    const navigate = useNavigate();
    const [redirecting, setRedirecting] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const id = queryParams.get("id");

    useEffect(() => {
        axios.post(`http://localhost:3001/auth/verify-email?token=${encodeURIComponent(token)}&id=${encodeURIComponent(id)}`)
            .then(response => {
                setMsg(response.data.message); 
            })
            .catch(error => {
                if (error.response) {
                    setErrorMsg(error.response.data.message);
                } else {
                    setErrorMsg("An unknown error occurred");
                }
            });
    }, [token, id]);

    useEffect(() => {
        if (msg) {
            setRedirecting(true);
            const timer = setTimeout(() => {
                navigate('/auth/login');
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [msg, navigate]);

    useEffect(() => {
        if (errormsg) {
            navigate('/auth/404', { state: { errormsg: errormsg } });
            setErrorMsg(null);
        }
      }, [errormsg, navigate]);

    return (
        <Box
            display="flex"
            flexDirection="column"
            height="100vh"
            textAlign="center"
            justifyContent="center"
        >
            <Container maxWidth="md">
                    <>
                        <IconCheck size={48} color="green" style={{ marginBottom: '20px' }} />
                        <Typography align="center" variant="h1" mb={4}>
                            Verification Successful!
                        </Typography>
                        <Typography align="center" variant="h4" mb={4}>
                            You will be redirected to the login page shortly.
                        </Typography>
                        <Typography align="center" variant="body1" mb={4}>
                            If you are not redirected, click the button below:
                        </Typography>
                        <Button
                            color="primary"
                            variant="contained"
                            component={Link}
                            to="/auth/login"
                            disableElevation
                        >
                            Go to Login Page
                        </Button>
                    </>
            
            </Container>
        </Box>
    );
}

export default Verify;
