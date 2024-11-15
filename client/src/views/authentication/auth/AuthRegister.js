import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import { Stack } from '@mui/system';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { showsweetAlert } from '../../../helpers/alert';

function AuthRegister({ title, subtitle, subtext }) {
    const initialValues = { fname: "", lname: "", email: "", password: "" };
    
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState("");
    const [link, setLink] = useState(""); // Added state for link
    const [loading, setLoading] = useState(false); // Track loading state

    const validationSchema = Yup.object().shape({
        fname: Yup.string().min(1, 'First name must be at least 1 character').max(255, 'First name can\'t be more than 255 characters').required('First name is required'),
        lname: Yup.string().min(1, 'Last name must be at least 1 character').max(255, 'Last name can\'t be more than 255 characters').required('Last name is required'),
        email: Yup.string().email('Please provide a valid email address').matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu)$/, 'Email must be from a valid domain (.com, .net, .org, .edu)').required('Email is required'),
        password: Yup.string().min(12, 'Password must be at least 12 characters long').matches(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter').matches(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter').matches(/(?=.*\d)/, 'Password must contain at least one number').matches(/(?=.*[@$!%*?&])/, 'Password must contain at least one special character (@, $, !, %, *, ?, &)').required('Password is required')
    });

    const onSubmit = (data, { setSubmitting }) => {
        setLoading(true); // Start loading indicator

        axios.post("http://localhost:3001/auth", data)
            .then((response) => {
                const { message, showDialog, showAlert, link: responseLink } = response.data;

                if (showDialog) {
                    showsweetAlert('Success!', message, 'success');

                } else if (showAlert) {
                    setAlertMessage(`${message} Click `);
                    setLink(responseLink); 
                }
                
            })
            .catch((error) => {
                console.error('Registration error:', error);
                setAlertMessage("Server Error. Please try again later.");
            })
            .finally(() => {
                setSubmitting(false);  // Ensure the button becomes clickable again
                setLoading(false); // Stop loading indicator
            });
    };

    return (
        <Box>
            {title && (
                <Typography fontWeight="700" variant="h2" mb={1}>
                    {title}
                </Typography>
            )}

            {subtext}

            {alertMessage && (
                <Alert severity="warning" onClose={() => setAlertMessage('')}>
                    <Typography>
                        {alertMessage} {link && <a href={link} style={{ marginLeft: '8px' }}>Here</a>}
                    </Typography>
                </Alert>
            )}

            <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
                {({ isSubmitting }) => (
                    <Form>
                        <Stack mb={3}>
                            <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="fname" mb="5px">
                                First Name
                            </Typography>
                            <Field name="fname" as={CustomTextField} variant="outlined" fullWidth id="fname" />
                            <ErrorMessage name="fname" component="div" style={{ color: 'red', marginTop: '5px' }} />

                            <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="lname" mb="5px" mt="25px">
                                Last Name
                            </Typography>
                            <Field name="lname" as={CustomTextField} variant="outlined" fullWidth id="lname" />
                            <ErrorMessage name="lname" component="div" style={{ color: 'red', marginTop: '5px' }} />

                            <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="email" mb="5px" mt="25px">
                                Email Address
                            </Typography>
                            <Field name="email" as={CustomTextField} variant="outlined" fullWidth id="email" />
                            <ErrorMessage name="email" component="div" style={{ color: 'red', marginTop: '5px' }} />

                            <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="password" mb="5px" mt="25px">
                                Password
                            </Typography>
                            <Field name="password" type="password" as={CustomTextField} variant="outlined" fullWidth id="password" />
                            <ErrorMessage name="password" component="div" style={{ color: 'red', marginTop: '5px' }} />
                        </Stack>

                        <Button type="submit" color="primary" variant="contained" size="large" fullWidth disabled={isSubmitting || loading}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
                        </Button>
                    </Form>
                )}
            </Formik>
            {subtitle}
        </Box>
    );
}

export default AuthRegister;
