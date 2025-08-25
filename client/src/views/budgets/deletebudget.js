import React, { useState, useEffect } from 'react';
import {Modal, Box, Typography, Button, IconButton } from '@mui/material';
import { IconSquareRoundedX } from '@tabler/icons-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { showsweetAlert } from '../../helpers/alert';
import API_URL from '../../config/api';

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

function DeleteBudget({ open, onClose, onBudgetDeleted, budgetID }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/auth/login");
        }
    }, [navigate]);

    const handleError = (error) => {
        const message = error.response 
            ? error.response.data.message || error.message 
            : error.message;
        showsweetAlert("Error", message, 'error')
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const response = await axios.delete(`${API_URL}/budget/dlt/${budgetID}`, {
                headers: { accessToken: localStorage.getItem("accessToken") }
            });
            onBudgetDeleted(budgetID); 
            onClose();
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <Typography variant="h6" component="h2" gutterBottom>
                    Delete Budget
                </Typography>
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16 }}>
                    <IconSquareRoundedX />
                </IconButton>
                <Typography>Are you sure you want to delete this Budget?</Typography>
                <Box mt={2} display="flex" justifyContent="space-between">
                    <Button onClick={onClose} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} variant="contained" color="error" disabled={isLoading}>
                        {isLoading ? "Deleting..." : "Delete"}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}

export default DeleteBudget;
