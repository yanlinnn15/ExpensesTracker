import React, { useState, useEffect } from 'react';  
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal, Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, TextField, IconButton } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { IconPlus, IconSquareRoundedX } from '@tabler/icons-react';
import * as TablerIcons from "@tabler/icons-react";
import axios from 'axios';  
import { useNavigate } from 'react-router-dom';

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
});

function EditCate({ open, onClose, onCateAdded, CateId, cate }) {
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
      
        axios.get("http://localhost:3001/icon/view", {
            headers: { accessToken: token }
        })
        .then((response) => {
            setIcon(response.data || []);  // Ensure icon is always an array
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
        console.error("Error:", message);  // Log the error
        setDialogMessage(message);
        setDialogOpen(true);
    };

    const formik = useFormik({
        initialValues: {
            name: cate?.name || '',
            IconId: cate?.IconId || '',
            is_income: cate?.is_income || false,
        },
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: (data) => {    
            axios.patch(`http://localhost:3001/cate/edit/${CateId}`, data, {
                headers: { accessToken: localStorage.getItem("accessToken") }
            })
            .then((response) => {        
                if (response.data && response.data.category) {
                    const updatedCategory = {
                        ...response.data.category,
                        Icon: {
                            icon_name: data.name,
                            icon_class: icon.find(c => c.id === data.IconId)?.icon_class || 'IconHelp'
                        }
                    };
                    onCateAdded(updatedCategory);
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
                    Edit Category
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

                        <Button type="submit" variant="contained" color="primary" fullWidth >
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

export default EditCate;
