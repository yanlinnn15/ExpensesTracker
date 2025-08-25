import React, { useState, useEffect } from 'react';  
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal, Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, TextField, IconButton, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { IconPlus, IconSquareRoundedX } from '@tabler/icons-react';
import * as TablerIcons from "@tabler/icons-react";
import axios from 'axios';  
import { useNavigate } from 'react-router-dom';
import API_URL from '../../config/api';

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
    IconId: Yup.number().required("Icon is required"),
    name: Yup.string().required("Name is required"),
    is_income: Yup.boolean().required("Type is required"),
});

function AddCate({ open, onClose, onCateAdded}) {
    const navigate = useNavigate();
    const [icon, setIcon] = useState([]);  
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
      
        axios.get(`${API_URL}/icon/view`, {
            headers: { accessToken: token }
        })
        .then((response) => {
            setIcon(response.data || []);  
            setIsLoading(false);
        })
        .catch((error) => {
            handleError(error);
        });
      
    }, [navigate]);

    const handleError = (error) => {
        const message = error.response 
            ? error.response.data.message || error.message 
            : error.message;
        console.error("Error:", message);  
        setDialogMessage(message);
        setDialogOpen(true);
    };

    const formik = useFormik({
        initialValues: {
            name: '',
            IconId: '',
            is_income: null,
        },
        validationSchema: validationSchema,
        onSubmit: (data) => {  
            axios.post(`${API_URL}/cate/`, data, {
                headers: { accessToken: localStorage.getItem("accessToken") }
            })
            .then((response) => {        
                if (response.data) {
                    const updatedCategory = {
                        ...response.data,
                        Icon: {
                            icon_name: data.name,
                            icon_class: icon.find(c => c.id === data.IconId)?.icon_class || 'IconHelp'
                        }
                    };
                    onCateAdded(updatedCategory);
                    formik.resetForm(); 
                    onClose();
                } else {
                    handleError({ message: "No category returned in response." });
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
                    Add Category
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
                                name="name"
                                label="Name"
                                variant="outlined"
                                onChange={formik.handleChange}
                                value={formik.values.name}
                                error={formik.touched.name && !!formik.errors.name}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="Icon">Icon</InputLabel>
                            <Select
                                name="IconId"
                                labelId="Icon"
                                variant="outlined"
                                label="Icon"
                                displayEmpty
                                onChange={formik.handleChange}
                                value={formik.values.IconId}
                                error={formik.touched.IconId && !!formik.errors.IconId}
                            >
                                {icon.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {renderIcon(cat.icon_class)} {cat.icon_name}
                                    </MenuItem>
                                ))}
                            </Select>
                            <div style={{ color: 'red' }}>{formik.touched.IconId && formik.errors.IconId}</div>
                        </FormControl>

                        <FormControl component="fieldset" fullWidth margin="normal">
                            <Typography variant="subtitle1">Type</Typography>
                            <RadioGroup
                                aria-label="is_income"
                                name="is_income"
                                value={formik.values.type}
                                onChange={formik.handleChange}
                                error={formik.touched.type && !!formik.errors.type}
                            >
                                <FormControlLabel value={true} control={<Radio />} label="Income" />
                                <FormControlLabel value={false} control={<Radio />} label="Expense" />
                            </RadioGroup>
                            {formik.touched.type && formik.errors.type && (
                                <div style={{ color: 'red' }}>{formik.errors.type}</div>
                            )}
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

export default AddCate;
