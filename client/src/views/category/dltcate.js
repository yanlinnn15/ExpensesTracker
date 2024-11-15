import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal, Box, Typography, Button, IconButton } from '@mui/material';
import { IconSquareRoundedX } from '@tabler/icons-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TransferCate from './transfercate';
import { SuccessDialog } from '../Dialog/success';

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

function DeleteCate({ open, onClose, onCateDeleted, CateId }) {
    const navigate = useNavigate();
    const [Count, setCount] = useState(0); // Initialize to 0
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [openTransModal, setOpenTransModal] = useState(false);
    const [selectedCateId, setSelectedCateId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/auth/login");
            return; 
        }

        setIsLoading(true);
        axios.get(`http://localhost:3001/trans/count/${CateId}`, {
            headers: { accessToken: token }
        })
        .then((response) => {
            setCount(Number(response.data.countT)); 
        })
        .catch((error) => {
            handleError(error);
        })
        .finally(() => {
            setIsLoading(false); 
        });

    }, [CateId, navigate]);

    const handleError = (error) => {
        const message = error.response 
            ? error.response.data.message || error.message 
            : error.message;
        console.error("Error:", message);
        setDialogMessage(message);
        setDialogOpen(true);
    };

    const handleTransClick = (id) => {
        setSelectedCateId(id);
        setOpenTransModal(true); 
    };

    const handleDelete = async () => {
        setOpenTransModal(false);
        setIsLoading(true);
        try {
            await axios.delete(`http://localhost:3001/cate/dlt/${CateId}`, {
                headers: { accessToken: localStorage.getItem("accessToken") }
            });
            onCateDeleted(CateId); 
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
                    Delete Category
                </Typography>
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16 }}>
                    <IconSquareRoundedX />
                </IconButton>

                {Count === 0 ? (
                    <>
                        <Typography>Are you sure you want to delete this Category?</Typography>
                        <Box mt={2} display="flex" justifyContent="space-between">
                            <Button onClick={onClose} variant="outlined" color="secondary">
                                Cancel
                            </Button>
                            <Button onClick={handleDelete} variant="contained" color="error" disabled={isLoading}>
                                {isLoading ? "Deleting..." : "Delete"}
                            </Button>
                        </Box>
                    </>
                ) : (
                    <>
                        <Typography>Are you sure you want to delete this category? 
                            Deleting this category will also remove all transactions associated with it.</Typography>
                        <Box mt={2} display="flex" justifyContent="space-between">
                            <Button onClick={() => handleTransClick(CateId)} variant="outlined" color="secondary">
                                Transfer Data
                            </Button>
                            <Button onClick={handleDelete} variant="contained" color="error" disabled={isLoading}>
                                {isLoading ? "Deleting..." : "Delete"}
                            </Button>
                        </Box>
                    </>
                )}

                {/* Error Dialog */}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                    <DialogTitle>Error</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{dialogMessage}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)} color="primary">OK</Button>
                    </DialogActions>
                </Dialog>

                <TransferCate
                  open={openTransModal} 
                  onClose={() => setOpenTransModal(false)} 
                  CateId={selectedCateId} 
                  onProcessing={handleDelete}
              />

            </Box>
        </Modal>
    );
}

export default DeleteCate;
