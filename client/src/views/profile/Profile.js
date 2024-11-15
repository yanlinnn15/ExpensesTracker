import React, { useEffect, useState, useContext } from 'react';
import { Typography, TextField, Button, DialogContentText, Alert, Box, Grid, Paper, Snackbar, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../helpers/AuthContext';
import * as Yup from 'yup';
import { showToast } from '../../helpers/showtoast';


const Profile = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const { id } = useParams();
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertSeverity, setAlertSeverity] = useState("info");
  const { authState, setAuthState, updateName } = useContext(AuthContext);
  const [openResetModal, setOpenResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [errormsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogMessage, setDialogMessage] = useState(null);

  useEffect(() => {
    if(!localStorage.getItem('accessToken')){
      navigate('auth/login')
      return;
    }

    axios.get(`http://localhost:3001/auth/profile/${id}`, 
      {headers: {accessToken: localStorage.getItem("accessToken")}})
      .then((response) => {
        setFirstName(response.data.fName);
        setLastName(response.data.lName);
        setEmail(response.data.email);
      })
      .catch((error) => {
        setErrorMsg(error.message);
      });

  }, [navigate])

  const handleSave = async () => {
    setIsLoading(true);
  
    if (!firstName || !lastName) {
      setErrorMsg("First name and last name are required.");
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await axios.patch(
        `http://localhost:3001/auth/edit/${id}`,
        { fname: firstName, lname: lastName },
        { headers: { accessToken: localStorage.getItem("accessToken") } }
      );
  
      if (response.status === 200) {
        const updatedAuthState = { ...authState, fname: firstName};
        setAuthState(updatedAuthState);
          setTimeout(() => {
          setIsLoading(false);
        }, 500); 
        showToast('Successful!');
      }
    } catch (error) {
      if (error.response) {
        setErrorMsg(error.response.data.error || "An error occurred.");
      } else if (error.request) {
        setErrorMsg("No response from server.");
      } else {
        setErrorMsg("Error: " + error.message);
      }
      setIsLoading(false);
    }
  };

  const validationSchema = Yup.object().shape({
    newPassword: Yup.string()
        .min(12, 'Password must be at least 12 characters long')
        .matches(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
        .matches(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
        .matches(/(?=.*\d)/, 'Password must contain at least one number')
        .matches(/(?=.*[@$!%*?&])/, 'Password must contain at least one special character (@, $, !, %, *, ?, &)')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Confirm Password is required')
  });

  const handleCloseSnackbar = () => {
    setOpen(false);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleResetPassword = () => {

    try {
      validationSchema.validateSync({ newPassword, confirmPassword });
    } catch (error) {
        setAlertMessage(error.errors ? error.errors[0] : error.message);
        setAlertSeverity("error");
        setOpen(true);
        return;
    }

    const data = { password: newPassword,confirmPassword: confirmPassword };
    axios.put(`http://localhost:3001/auth/pass/${id}`, data, 
      { headers: { accessToken: localStorage.getItem("accessToken") } }
    )
        .then((response) => {
            const { message } = response.data;
            setOpenResetModal(false);
            showToast('Password Change Successful!');
        })
        .catch((error) => {
            if (error.response) {
                setAlertMessage(error.response.data);
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

  const handleOpenResetModal = () => {
    setOpenResetModal(true);
  };

  const handleCloseResetModal = () => {
    setOpenResetModal(false);
  };

  return (
    <PageContainer title="User Profile" description="Manage your profile information">
      <DashboardCard title="User Profile">
        <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            Edit Profile
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                variant="outlined"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                variant="outlined"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                value={email}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="contained" color="primary" onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save"}
                </Button>
                <Button variant="outlined" color="primary" onClick={handleOpenResetModal}>
                  Reset Password
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </DashboardCard>

      {/* Reset Password Modal */}
      <Dialog open={openResetModal} onClose={handleCloseResetModal}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
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
        <Box mt={2}></Box>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              style: { borderRadius: 8 },
            }}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              style: { borderRadius: 8 },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleResetPassword} color="primary">
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>


    </PageContainer>
    
  );
};

export default Profile;
