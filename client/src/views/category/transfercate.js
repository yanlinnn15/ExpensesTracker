import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, IconButton, Checkbox, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { IconSquareRoundedX } from '@tabler/icons-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as TablerIcons from "@tabler/icons-react"; 
import SelectTransCate from './selecttranscate';
import API_URL from '../../config/api';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%', 
    maxWidth: 600, 
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    overflowY: 'auto', 
    maxHeight: '80vh', 
};

function TransferCate({ open, onClose, CateId, onProcessing }) {
    const navigate = useNavigate();
    const [Count, setCount] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [selectedTransactions, setSelectedTransactions] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [openTransModal, setOpenTransModal] = useState(false);


    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/auth/login");
            return;
        }

        axios.get(`${API_URL}/trans/count/${CateId}`, {
            headers: { accessToken: token }
        })
        .then((response) => {
            const { countT, cate } = response.data; 
            setCount(Number(countT));
            const groupedTransactions = groupTransactionsByDate(cate);

            if (JSON.stringify(groupedTransactions) !== JSON.stringify(transactions)) {
                setTransactions(groupedTransactions);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    }, [CateId, navigate]);  

    const groupTransactionsByDate = (transactions) => {
        return transactions.reduce((grouped, transaction) => {
            const date = new Date(transaction.date).toLocaleDateString();
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(transaction);
            return grouped;
        }, {});
    };

    const renderIcon = (iconName) => {
        const IconComponent = TablerIcons[iconName]; 
        return IconComponent ? <IconComponent /> : <TablerIcons.IconHelp />; 
    };

    const handleSelectAll = () => {
        const newSelectedTransactions = selectAll ? [] : Object.values(transactions).flat().map((transaction) => transaction.id);
        setSelectedTransactions(newSelectedTransactions);
        setSelectAll(!selectAll);
    };

    const handleMigrate = (CateId) =>{
        setOpenTransModal(false);
        onProcessing(CateId);
    }

    const handleTransactionSelect = (transactionId) => {
        const updatedSelectedTransactions = selectedTransactions.includes(transactionId)
            ? selectedTransactions.filter(id => id !== transactionId)
            : [...selectedTransactions, transactionId];
        setSelectedTransactions(updatedSelectedTransactions);
    };

    const handleNextStep = (selectedTransactions) => {
        setSelectedTransactions(selectedTransactions);
        setOpenTransModal(true);
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{ ...style, overflowY: 'auto', maxHeight: '80vh' }}>
                <Typography variant="h6" component="h2" gutterBottom>
                    Transfer Data Before Deleting Category
                </Typography>
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16 }}>
                    <IconSquareRoundedX />
                </IconButton>

                {Count === 0 ? (
                    <Typography>No transactions available for this category.</Typography>
                ) : (
                    <>
                        <Typography variant="body2" color="textSecondary" mt={2}>
                            {Count} transactions are linked to this category.
                        </Typography>

                        <FormControlLabel
                            control={
                                <Checkbox checked={selectAll} onChange={handleSelectAll} />
                            }
                            label="Select All Transactions"
                        />

                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(transactions).map((date, index) => (
                                        <React.Fragment key={index}>
                                            <TableRow>
                                                <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>
                                                    {date}
                                                </TableCell>
                                            </TableRow>
                                            {transactions[date].map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell sx={{ width: 10 }}>
                                                        <Checkbox
                                                            checked={selectedTransactions.includes(transaction.id)}
                                                            onChange={() => handleTransactionSelect(transaction.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell align='left'>
                                                        
                                                        <Typography variant="subtitle1" color="textPrimary">
                                                        {renderIcon(transaction.Category.Icon.icon_class)}
                                                        {transaction.remark ? transaction.remark : transaction.Category.name}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align='right'>
                                                        <Typography variant="subtitle1" color="textPrimary">
                                                            {transaction.type ? "+" : "-"} {transaction.amount}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Next Step Button */}
                        <Box mt={2} display="flex" justifyContent="flex-end">
                            <Button onClick={() =>handleNextStep(selectedTransactions)} variant="contained" color="primary">
                                Next Step
                            </Button>
                        </Box>

                        <SelectTransCate 
                            open={openTransModal} 
                            onClose={() => setOpenTransModal(false)} 
                            CateId={CateId} 
                            selectedTransactions={selectedTransactions}
                            onMigrationComplete={handleMigrate}
                        />
                    </>
                )}
            </Box>
        </Modal>
    );
}

export default TransferCate;
