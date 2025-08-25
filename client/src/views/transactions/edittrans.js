import React, { useState, useEffect } from 'react';  
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal, Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, TextField, IconButton } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { IconPlus, IconSquareRoundedX } from '@tabler/icons-react';
import * as TablerIcons from "@tabler/icons-react";
import axios from 'axios';  
import { useNavigate } from 'react-router-dom'; 
import API_URL from '../../config/api';

// Function to render icons dynamically
const renderIcon = (iconName) => {
    const IconComponent = TablerIcons[iconName]; 
    return IconComponent ? <IconComponent /> : <TablerIcons.IconHelp />;
};

// Style for the modal
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

const today = (() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
})();

const validationSchema = Yup.object({
    amount: Yup.number().required('Required').min(0.1, 'Must be at least 0.1'),
    remark: Yup.string().optional(),
    CategoryId: Yup.string().required('Required'),
    date: Yup.date().required('Required'),
});

function EditTrans({ open, onClose, onExpenseAdded, transactionId, transaction }) {
    const navigate = useNavigate();  
    const [cate, setCate] = useState([]);
    const [trans, setTrans] = useState(null);
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
      
        Promise.all([
            axios.get(`${API_URL}/cate/viewAll`, {
                headers: { accessToken: token }
            }),
            axios.get(`${API_URL}/trans/view/${transactionId}`, {
                headers: { accessToken: token }
            })
        ])
        .then(([categoryResponse, transactionResponse]) => {
            setCate(categoryResponse.data.cate);
            setTrans(transactionResponse.data);
        })
        .catch((error) => {
            handleError(error);
        })
        .finally(() => {
            setIsLoading(false);
        });
      
    }, [navigate, transactionId]);

    const handleError = (error) => {
        const message = error.response 
            ? error.response.data.message || error.message 
            : error.message;
        setDialogMessage(message);
        setDialogOpen(true);
    };

    const formik = useFormik({
        initialValues: {
            amount: trans ? trans.amount : '',
            remark: trans ? trans.remark : '',
            CategoryId: trans ? trans.CategoryId : '',
            date: trans ? trans.date : today,
        },
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: (data) => {    
            axios.patch(`${API_URL}/trans/edit/${transactionId}`, data, {
                headers: { accessToken: localStorage.getItem("accessToken") }
            })
            .then((response) => {        
                const category = cate.find(c => c.id === data.CategoryId);
                
                const transaction = {
                    ...response.data.transaction,
                    Category: {
                        name: category?.name || 'Unknown',
                        Icon: category?.Icon || { icon_class: 'IconHelp' }
                    }
                };
                onExpenseAdded(transaction);
                onClose();
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
                    Edit Transaction
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
                                helperText={formik.touched.amount && formik.errors.amount}
                            />
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="CategoryId">Category</InputLabel>
                            <Select
                                name="CategoryId"
                                labelId="CategoryId"
                                variant="outlined"
                                label="Category"
                                displayEmpty
                                onChange={formik.handleChange}
                                value={formik.values.CategoryId}
                                error={formik.touched.CategoryId && !!formik.errors.CategoryId}
                            >
                                {cate.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {renderIcon(cat.Icon.icon_class)} {cat.name ? cat.name : cat.Icon.icon_name}
                                    </MenuItem>
                                ))}
                            </Select>
                            <div style={{ color: 'red' }}>{formik.touched.CategoryId && formik.errors.CategoryId}</div>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <TextField
                                name="date"
                                type="date"
                                label="Date"
                                variant="outlined"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={formik.handleChange}
                                value={formik.values.date}
                                error={formik.touched.date && !!formik.errors.date}
                                helperText={formik.touched.date && formik.errors.date}
                            />
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <TextField
                                name="remark"
                                label="Remark (optional)"
                                variant="outlined"
                                onChange={formik.handleChange}
                                value={formik.values.remark}
                            />
                        </FormControl>

                        <Button type="submit" variant="contained" color="primary" fullWidth startIcon={<IconPlus />}>
                            Edit
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

export default EditTrans;
