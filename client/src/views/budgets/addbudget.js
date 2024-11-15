import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal, Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, TextField, IconButton } from '@mui/material';
import { useFormik, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { IconPlus, IconSquareRoundedX } from '@tabler/icons-react';
import * as TablerIcons from "@tabler/icons-react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { showsweetAlert } from '../../helpers/alert';

const renderIcon = (iconName) => {
    const IconComponent = TablerIcons[iconName]; 
    return IconComponent ? <IconComponent /> : <TablerIcons.IconHelp />;
};

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

const validationSchema = Yup.object({
    CategoryId: Yup.number().required("Category is required"),
    amount: Yup.number()
        .required("Amount is required")
        .positive("Enter a valid number")
        .typeError("Amount must be a valid number"),
});

function AddBudget({ open, onClose, onBudgetAdded }) {
    const navigate = useNavigate();
    const [cate, setCate] = useState([]);  
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/auth/login");
            return;
        }
      
        setIsLoading(true);
      
        axios.get("http://localhost:3001/cate/viewAll", {
            headers: { accessToken: token }
        })
        .then((response) => {
            setCate(response.data.catebudget || []);  
            setIsLoading(false);
        })
        .catch((error) => {
            handleError(error);
        });
    }, [navigate, open]);

    const handleError = (error) => {
        const message = error.response 
            ? error.response.data.message || error.message 
            : error.message;
            showsweetAlert('Error', message, 'error');
    };

    const formik = useFormik({
        initialValues: {
            CategoryId: '',
            amount: '',
            remark: ''
        },
        validationSchema: validationSchema,
        onSubmit: (data) => {
            axios.post('http://localhost:3001/budget/', data, {
                headers: { accessToken: localStorage.getItem("accessToken") }
            })
            .then((response) => {        
                if (response.data) {
                    const updatedBudget = {
                        ...response.data,
                        Icon: {
                            icon_name: response.data.Category?.Icon.icon_name || 'IconHelp',
                            icon_class: response.data.Category?.Icon.icon_class || 'IconHelp' 
                        },
                        Category: {
                            id: response.data.CategoryId,
                            name: response.data.Category?.name || 'Unknown',
                            is_income: response.data.Category?.is_income || false,
                            IconId: response.data.Category?.IconId || null,
                            Icon: {
                                icon_name: response.data.Category?.Icon.icon_name || 'IconHelp',
                                icon_class: response.data.Category?.Icon.icon_class || 'IconHelp'
                            }
                        },
                        totalSpent: response.data.totalSpent || 0
                    };

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
            <Box sx={style}>
                <Typography variant="h6" component="h2" gutterBottom>
                    Add Budget
                </Typography>
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16 }}>
                    <IconSquareRoundedX />
                </IconButton>
                {isLoading ? (
                    <Typography>Loading data, please wait...</Typography>
                ) : (
                    <form onSubmit={formik.handleSubmit} className="formContainer">
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="CategoryId">Category</InputLabel>
                            <Select
                                name="CategoryId"
                                labelId="CategoryId"  
                                label="Category"
                                displayEmpty
                                variant="outlined"
                                inputProps={{ 'aria-label': 'Category' }}
                                onChange={formik.handleChange}
                                value={formik.values.CategoryId}  
                                error={formik.touched.CategoryId && !!formik.errors.CategoryId}
                            >

                                {cate.length === 0 ? (
                                    <MenuItem disabled>No categories found or all categories assigned</MenuItem>
                                ) : (
                                    cate.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                            {renderIcon(cat.Icon.icon_class)} {cat.name}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                            {formik.touched.CategoryId && formik.errors.CategoryId && (
                                <div style={{ color: 'red', fontSize: '0.875rem' }}>
                                    {formik.errors.CategoryId}
                                </div>
                            )}
                        </FormControl>

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
                            Add
                        </Button>
                    </form>
                )}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                    <DialogTitle>Error</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{dialogMessage}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)} color="primary">OK</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Modal>
    );
}

export default AddBudget;
