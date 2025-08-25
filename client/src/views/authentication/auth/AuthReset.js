import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Button,
    Stack,
    Alert,
    Snackbar,
    Container
} from '@mui/material';
import * as Yup from 'yup';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import ErrorImg from 'src/assets/images/backgrounds/404-error-idea.gif';
import { showsweetAlert } from '../../../helpers/alert';
import API_URL from '../../../config/api';

function AuthReset({ title, subtitle }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [msg, setMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertSeverity, setAlertSeverity] = useState("info");
    const [open, setOpen] = useState(false);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const id = queryParams.get("id");

    useEffect(() => {
        if (token && id) {
            axios.post(`${API_URL}/auth/validate-reset-token?token=${encodeURIComponent(token)}&id=${encodeURIComponent(id)}`)
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
        } else {
            setErrorMsg("Invalid Link or Expired!");
        }
    }, [token, id]);

    const validationSchema = Yup.object().shape({
        password: Yup.string()
            .min(12, 'Password must be at least 12 characters long')
            .matches(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
            .matches(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
            .matches(/(?=.*\d)/, 'Password must contain at least one number')
            .matches(/(?=.*[@$!%*?&])/, 'Password must contain at least one special character (@, $, !, %, *, ?, &)')
            .required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm Password is required')
    });

    const handleCloseSnackbar = () => {
        setOpen(false);
        setAlertMessage(null); 
    };

    useEffect(() => {
        if (errorMsg) {
            navigate('/auth/404', { state: { errormsg: errorMsg } });
            setErrorMsg(null);
        }
      }, [errorMsg, navigate]);

    const handleResetPassword = async () => {
        try {
            await validationSchema.validate({ password, confirmPassword });
        } catch (error) {
            setAlertMessage(error.errors ? error.errors[0] : error.message);
            setAlertSeverity("error");
            setOpen(true);
            return;
        }

        const data = { password, confirmPassword };
        try{
            const response = await axios.post(`${API_URL}/auth/forgotpass?token=${encodeURIComponent(token)}&id=${encodeURIComponent(id)}`, data);
            const { message } = response.data;
            showsweetAlert('Success!', message, 'success');
            navigate('/auth/login');
            setErrorMsg(null); 
        } catch (error) {
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
        }
    };

    return (
        <>
            {title && (
                <Typography fontWeight="700" variant="h2" mb={1}>
                    {title}
                </Typography>
            )}
            <Stack spacing={2}>
                <Snackbar
                    open={open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={alertSeverity} sx={{ width: '100%' }}>
                        <span dangerouslySetInnerHTML={{ __html: alertMessage }} />
                    </Alert>
                </Snackbar>
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor='password' mb="5px">Password</Typography>
                    <CustomTextField id="password" type="password" variant="outlined" onChange={(event) => setPassword(event.target.value)} fullWidth />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor='confirmPassword' mb="5px">Confirm Password</Typography>
                    <CustomTextField id="confirmPassword" type="password" variant="outlined" onChange={(event) => setConfirmPassword(event.target.value)} fullWidth />
                </Box>
            </Stack>
            <Box mt="25px">
                <Button
                    color="primary"
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleResetPassword}
                >
                    Reset Password
                </Button>
            </Box>
            {subtitle}
        </>
    );
}

export default AuthReset;