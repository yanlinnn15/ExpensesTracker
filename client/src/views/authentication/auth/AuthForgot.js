import React, { useState } from 'react';
import { Box, Typography, Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import { Stack } from '@mui/system';
import * as Yup from 'yup';
import { showsweetAlert } from '../../../helpers/alert';

function AuthForgot({ title, subtitle, subtext }) {
    const [email, setEmail] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("info");
    const [open, setOpen] = useState(false); 
    const [loading, setLoading] = useState(false); 
    const [disabledTime, setDisabledTime] = useState(0); 

    const handleClose = () => {
        setOpen(false);
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email('Please provide a valid email address')
            .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu)$/, 'Email must be from a valid domain (.com, .net, .org, .edu)')
            .required('Email is required'),
    });

    const forgotlink = () => {
        validationSchema.validate({ email })
            .then(() => {
                const data = { email };
                setLoading(true); 
                setDisabledTime(60); 
                return axios.post("http://localhost:3001/auth/forgotlink", data);
            })
            .then((response) => {
                const { message } = response.data;
                showsweetAlert('Success!', message, 'success');
            })
            .catch((error) => {
                if (error.response) {
                    setAlertMessage(error.response.data.message);
                    setAlertSeverity("error");
                } else if (error.request) {
                    setAlertMessage("No response received from the server.");
                    setAlertSeverity("warning");
                } else {
                    setAlertMessage("Error: " + error.message);
                    setAlertSeverity("error");
                }
                setOpen(true);
            })
            .finally(() => {
                setLoading(false); 
            });
    };

   
    React.useEffect(() => {
        let timer;
        if (disabledTime > 0) {
            timer = setInterval(() => {
                setDisabledTime((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer); 
    }, [disabledTime]);

    return (
        <>
            {title && (
                <Typography fontWeight="700" variant="h2" mb={1}>
                    {title}
                </Typography>
            )}
            {subtext}
            <Stack spacing={2} mb={2}>
                <Snackbar
                    open={open}
                    autoHideDuration={6000}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleClose} severity={alertSeverity} sx={{ width: '100%' }}>
                        {alertMessage}
                    </Alert>
                </Snackbar>
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor='email' mb="5px">Email</Typography>
                    <CustomTextField
                        id="email"
                        variant="outlined"
                        onChange={(event) => setEmail(event.target.value)}
                        fullWidth
                    />
                </Box>
            </Stack>
            <Box>
                <Button
                    color="primary"
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={forgotlink} 
                    disabled={loading || disabledTime > 0} 
                >
                    {loading ? (
                        <CircularProgress size={24} color="inherit" /> 
                    ) : disabledTime > 0 ? (
                        `Resend in ${disabledTime}s` 
                    ) : (
                        "Send Forgot Password Link"
                    )}
                </Button>
                {subtitle}
            </Box>
        </>
    );
}

export default AuthForgot;
