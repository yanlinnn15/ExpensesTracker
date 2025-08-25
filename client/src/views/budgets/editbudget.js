import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal, Box, Typography, Button, FormControl, TextField, IconButton } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { IconPlus, IconSquareRoundedX } from '@tabler/icons-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../config/api';

const validationSchema = Yup.object({
    amount: Yup.number()
        .required("Amount is required")
        .positive("Enter a valid number")
        .typeError("Amount must be a valid number"),
    remark: Yup.string(),
});

function EditBudget({ open, onClose, onBudgetAdded, Bid, budgets }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/auth/login");
            return;
        }

        setIsLoading(true);

        axios.get(`${API_URL}/cate/viewAll`, {
            headers: { accessToken: token }
        })
        .then((response) => {
            setIsLoading(false);
        })
        .catch((error) => {
            handleError(error);
        });
    }, [navigate]);

    const handleError = (error) => {
        const message = error.response ? error.response.data.message || error.message : error.message;
        console.error("Error:", message);  
    };

    const formik = useFormik({
        initialValues: {
            amount: budgets?.amount || '',
            remark: budgets?.remark || ''
        },
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: (data) => {
            axios.patch(`${API_URL}/budget/edit/${Bid}`, data, {
                headers: { accessToken: localStorage.getItem("accessToken") }
            })
            .then((response) => {        
                if (response.data) {
                    const updatedBudget = response.data;
                    onBudgetAdded(updatedBudget);
                    formik.resetForm(); 
                    onClose();
                } else {
                    handleError({ message: "No Budget returned in response." });
                }
            })
            .catch((error) => {
                handleError(error);
            });
        },
    });

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, borderRadius: 2 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                    Edit Budget
                </Typography>
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16 }}>
                    <IconSquareRoundedX />
                </IconButton>
                {isLoading ? (
                    <Typography>Loading data, please wait...</Typography>
                ) : (
                    <form onSubmit={formik.handleSubmit} className="formContainer">
                        <FormControl fullWidth margin="normal">
                            <TextField
                                name="amount"
                                type="number"
                                label="Amount"
                                variant="outlined"
                                onChange={formik.handleChange}
                                value={formik.values.amount}
                                error={formik.touched.amount && !!formik.errors.amount}
                                helpertext={formik.touched.amount && formik.errors.amount}
                                inputProps={{ 'aria-label': 'Amount' }} 
                            />
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <TextField
                                name="remark"
                                label="Remark (optional)"
                                variant="outlined"
                                onChange={formik.handleChange}
                                value={formik.values.remark}
                                inputProps={{ 'aria-label': 'Remark' }} 
                            />
                        </FormControl>

                        <Button type="submit" variant="contained" color="primary" fullWidth startIcon={<IconPlus />}>
                            Edit
                        </Button>
                    </form>
                )}
            </Box>
        </Modal>
    );
}

export default EditBudget;
