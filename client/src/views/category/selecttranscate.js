import React, { useState, useEffect } from 'react';
import { Card, CardActionArea, Grid, Modal, Box, Typography, Button, IconButton, Select, MenuItem } from '@mui/material';
import { IconSquareRoundedX } from '@tabler/icons-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as TablerIcons from "@tabler/icons-react"; 
import API_URL from '../../config/api';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '600px',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

const renderIcon = (iconName) => {
    const IconComponent = TablerIcons[iconName]; 
    return IconComponent ? <IconComponent /> : <TablerIcons.IconHelp />; 
};

function SelectTransCate({ open, onClose, CateId, onMigrationComplete, selectedTransactions }) {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/auth/login");
            return;
        }

        axios.get(`${API_URL}/cate/someCate/${CateId}`, {
            headers: { accessToken: token }
        })
        .then(response => setCategories(response.data))
        .catch(error => console.error("Error fetching categories:", error));
    }, [navigate]);

    const handleNextStep = async (newCategoryId) => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setError('User is not authenticated');
            setLoading(false);
            return;
        }
        try {
            console.log(selectedTransactions)
            const migrationPromises =selectedTransactions.map((transId) => {
                console.log(transId)
                return axios.patch(`${API_URL}/trans/edit/${transId}`, {
                    CategoryId: newCategoryId,
                }, {
                    headers: { accessToken: token }
                });
            });

            await Promise.all(migrationPromises);
            setLoading(false);
            onMigrationComplete(CateId); 
        } catch (err) {
            setLoading(false);
            setError('An error occurred during the migration process');
            console.error(err);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <Typography variant="h6" component="h2" gutterBottom>
                    Select a Category for the Chosen Transactions
                </Typography>
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16 }}>
                    <IconSquareRoundedX />
                </IconButton>

                <Typography variant="body2" color="textSecondary" mt={2}>
                    Please select a category to assign to the chosen transactions.
                </Typography>

                    <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>Select Category</Typography>
                        <Grid container spacing={2}>
                            {categories.map((category) => (
                                <Grid item xs={12} sm={6} md={4} key={category.id}>
                                    <Card
                                        variant={selectedCategory === category.id ? "outlined" : "elevation"}
                                        sx={{
                                            cursor: 'pointer',
                                            padding: 2,
                                            border: selectedCategory === category.id ? '2px solid #3f51b5' : 'none',
                                        }}
                                        onClick={() => setSelectedCategory(category.id)}
                                    >
                                        <CardActionArea>
                                            <Box display="flex" flexDirection="column" alignItems="center">
                                                {renderIcon(category.Icon.icon_class)}
                                                <Typography variant="subtitle1" mt={1}>{category.name}</Typography>
                                            </Box>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button onClick={() => handleNextStep(selectedCategory)} variant="contained" color="primary" disabled={!selectedCategory}>
                        Confirm
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}

export default SelectTransCate;
