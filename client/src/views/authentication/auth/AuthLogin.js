import { React, useState, useContext } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Button,
    Stack,
    Alert,
    Snackbar
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../helpers/AuthContext';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';

function AuthLogin({ title, subtitle, subtext }) {
    const [email, setemail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { setAuthState } = useContext(AuthContext);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("info");
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const Login = () => {
        if (!email || !password) {
            setAlertMessage("Email and Password are required.");
            setAlertSeverity("error");
            setOpen(true);
            return;
        }

        const data = { email: email, password: password };
        axios.post("http://localhost:3001/auth/login", data)
            .then((response) => {
                if (response.data.token) {
                    localStorage.setItem("accessToken", response.data.token);
                    setAuthState({
                        fname: response.data.fname,
                        id: response.data.id,
                        status: true
                    });
                    navigate('/');
                } else {                    
                    const verificationMessage = `Please verify your email. Click here to verify: <a href='http://localhost:5173/auth/verify'>Verify Email</a>`;
                    setAlertMessage(verificationMessage);
                    setAlertSeverity("error");
                    setOpen(true);
                }
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
            });
    };

    return (
        <>
            {title && (
                <Typography fontWeight="700" variant="h2" mb={1}>
                    {title}
                </Typography>
            )}
            {subtext}
            <Stack>
                <Snackbar
                    open={open}
                    autoHideDuration={6000}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleClose} severity={alertSeverity} sx={{ width: '100%' }}>
                        <span dangerouslySetInnerHTML={{ __html: alertMessage }} />
                    </Alert>
                </Snackbar>
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor='email' mb="5px">Email</Typography>
                    <CustomTextField id="email" variant="outlined" onChange={(event) => setemail(event.target.value)} fullWidth />
                </Box>
                <Box mt="25px">
                    <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor='password' mb="5px">Password</Typography>
                    <CustomTextField id="password" type="password" variant="outlined" onChange={(event) => setPassword(event.target.value)} fullWidth />
                </Box>
                <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
                    <Typography
                        component={Link}
                        to="/auth/forgotpasslink"
                        fontWeight="500"
                        sx={{
                            textDecoration: 'none',
                            color: 'primary.main',
                        }}
                    >
                        Forgot Password?
                    </Typography>
                </Stack>
            </Stack>
            <Box>
                <Button
                    color="primary"
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={Login}
                >
                    Sign In
                </Button>
            </Box>
            {subtitle}
        </>
    );
}

export default AuthLogin;
