import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CardContent,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Stack
} from '@mui/material';
import { IconDots, IconPlus, IconEdit, IconTrash, IconCalendarMonth } from "@tabler/icons-react";
import * as TablerIcons from "@tabler/icons-react"; 
import getLast12Months from '../func/func12m';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import axios from 'axios';
import API_URL from '../../config/api';
import { useNavigate, useLocation } from 'react-router-dom';
import AddTransactionModal from './addtrans';
import EditTrans from './edittrans';
import DeleteTrans from './dlttrans';

const renderIcon = (iconName) => {
    const IconComponent = TablerIcons[iconName]; 
    return IconComponent ? <IconComponent /> : <TablerIcons.IconHelp />; 
};
const [months, lastmonth] = getLast12Months();

const Transactions = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorEl1, setAnchorEl1] = useState(null);
    const [selectedDate, setSelectedDate] = useState(lastmonth);
    const [trans, setTrans] = useState([]);
    const [ttlIncome, setTtlIncome] = useState("0.00");
    const [ttlExpense, setTtlExpense] = useState("0.00");
    const [msgError, setErrorMsg] = useState("");
    const navigation = useNavigate();
    const [addExpenseOpen, setAddExpenseOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [selectedTransac, setSelectedTransac] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [transOpen, setTransOpen] = useState(false);
    const handleTransOpen = () => setTransOpen(true);
    const handleTransClose = () => setTransOpen(false);
    const location = useLocation(); 

    const useQuery = () => {
        return new URLSearchParams(location.search);
    };

    const handleMenuOpen = (event, tran) => {
        setSelectedTransaction(tran); 
        setAnchorEl(event.currentTarget); 
    };
    
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleExpenseAdded = (newTransaction) => {
        const yearMonth = newTransaction.date.slice(0, 7);
        setSelectedDate(yearMonth);
        axios.get(`${API_URL}/trans/viewAll?mth=${selectedDate}`, {
            headers: {
                accessToken: localStorage.getItem("accessToken"),
            }
        })
        .then((response) => {
            if (response.data) {
                const transactionsByDate = response.data.transaction.reduce((acc, tran) => {
                    const date = tran.date;
                    if (!acc[date]) {
                        acc[date] = { date, transactions: [] };
                    }
                    acc[date].transactions.push(tran);
                    return acc;
                }, {});

                setTrans(Object.values(transactionsByDate));
                setTtlIncome(response.data.ttlIncome);
                setTtlExpense(response.data.ttlExpense);
            }
        })
        .catch((error) => {
            if (error.response) {
                setErrorMsg(error.response.data.message);
            } else {
                setErrorMsg("Server Error");
            }
        });
    };

    const handleDateMenuOpen = (event) => {
        setAnchorEl1(event.currentTarget);
    };

    const handleDateMenuClose = (month) => {
        setSelectedDate(month);
        setAnchorEl1(null);
    };

    const handleEditClick = (id, tran) => {
        setSelectedTransac(tran);
        setSelectedTransactionId(id);
        handleMenuClose(true);
        setOpenEditModal(true); 
    };

    const handleDeleteClick = (transactionId) => {
        setSelectedTransactionId(transactionId);
        handleMenuClose(true);
        setDeleteDialogOpen(true);
    };

    const handleTransactionDeleted = (deletedTransactionId) => {
        let amount = 0;
        let type = '';
    
        setTrans(prevTrans => {
            const updated = prevTrans.reduce((acc, day) => {
                const filterTrans = day.transactions.filter(transaction => {
                    const isDeleted = String(transaction.id) === String(deletedTransactionId);
                    if (isDeleted) {
                        amount = transaction.amount;
                        type = transaction.type;
                    }
                    return !isDeleted;
                });
    
                if (filterTrans.length > 0) {
                    acc.push({ ...day, transactions: filterTrans });
                }
    
                return acc;
            }, []);
    
            return updated;
        });
    
        if (type === true) {
            setTtlIncome(prevIncome => {
                const newIncome = prevIncome - amount;
                return newIncome.toFixed(2);
            });
        } else {
            setTtlExpense(prevExpense => {
                const newExpense = prevExpense - amount;
                return newExpense.toFixed(2);
            });
        }
    };

    useEffect(() => {
        const query = useQuery(); 
        const mth = query.get('mth'); 

        if(mth)
            setSelectedDate(mth);

    }, [])
    
    useEffect(() => {
        if (!localStorage.getItem("accessToken")) {
            navigation('/auth/login');
        } else {

            axios.get(`${API_URL}/trans/viewAll?mth=${selectedDate}`, {
                headers: {
                    accessToken: localStorage.getItem("accessToken"),
                }
            })
            .then((response) => {
                if (response.data) {
                    const transactionsByDate = response.data.transaction.reduce((acc, tran) => {
                        const date = tran.date;
                        if (!acc[date]) {
                            acc[date] = { date, transactions: [] };
                        }
                        acc[date].transactions.push(tran);
                        return acc;
                    }, {});

                    setTrans(Object.values(transactionsByDate)); // Convert object to array
                    setTtlIncome(response.data.ttlIncome); 
                    setTtlExpense(response.data.ttlExpense); 
                } else {
                    alert('Unexpected response format. Please try again.');
                }
            }).catch((error) => {
                if (error.response) {
                    setErrorMsg(error.response.data.message);
                } else {
                    setErrorMsg("Server Error");
                }
            });
        }
    }, [selectedDate, navigation]);

    return (
        <PageContainer title="Transactions" description="Balance Page">
            <DashboardCard title="Transactions">
                <Stack direction="row" justifyContent="flex-end" mb={4}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleTransOpen}
                    startIcon={<IconPlus size="20" />}
                    sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: 3,
                    '&:hover': {
                        boxShadow: 4,
                    }
                    }}
                >
                    New Transaction
                </Button>
                </Stack>
                
                <Container maxWidth="lg">
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ backgroundColor: 'transparent' }}>
                                <CardContent sx={{ backgroundColor: 'primary.main', borderRadius: 2, p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Grid container spacing={3}>
                                                                                        
                                                                                        <Grid item xs={4}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                                                    <Typography variant="h6" sx={{ color: 'white', mr: 1 }}>
                                                        {selectedDate}
                                                    </Typography>
                                                    <Button
                                                        onClick={handleDateMenuOpen}
                                                        sx={{
                                                            minWidth: 0,
                                                            padding: 0,
                                                            color: 'white',
                                                            '&:hover': {
                                                                color: 'secondary.main',
                                                            },
                                                        }}
                                                    >
                                                        <IconCalendarMonth />
                                                    </Button>
                                                </Box>
                                            </Grid>

                                            {/* Total Expense*/}
                                            <Grid item xs={4}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                    <Typography sx={{ mb: 1, color: 'lightgrey' }}>
                                                        Total Expense
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ color: 'white' }}>
                                                        RM {ttlExpense}
                                                    </Typography>
                                                </Box>
                                            </Grid>

                                            {/* Total Income */}
                                            <Grid item xs={4}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                    <Typography sx={{ mb: 1, color: 'lightgrey' }}>
                                                        Total Income
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ color: 'white' }}>
                                                        RM {ttlIncome}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    {/* Select month menu */}
                                    <Menu
                                        anchorEl={anchorEl1}
                                        open={Boolean(anchorEl1)}
                                        onClose={() => setAnchorEl1(null)}
                                    >
                                        {months.map((month) => (
                                            <MenuItem key={month} onClick={() => handleDateMenuClose(month)}>
                                                {month}
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>

                <Box mt={2} />

                <Container>
                    <Card variant="outlined">
                        <TableContainer>
                            <Table aria-label="transactions table">
                                <TableBody>
                                {/* <Button onClick={() => setAddExpenseOpen(true)}>Add Expense</Button> */}

                                    {trans.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">
                                                <CardContent>No transaction.</CardContent>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        trans.map((day, dayIndex) => (
                                            <React.Fragment key={day.date}>
                                                {/* Date Row */}
                                                <TableRow>
                                                    <TableCell colSpan={3} sx={{ py: 1 }}>
                                                            {day.date}
                                                    </TableCell>
                                                </TableRow>

                                                {/* Transaction Rows */}
                                                {day.transactions.map((tran, index) => (
                                                    <TableRow key={tran.id}>
                                                        <TableCell>
                                                            <Box display="flex" alignItems="center">
                                                                {renderIcon(tran.Category.Icon.icon_class)}
                                                                <Typography variant="subtitle1" color="textPrimary" sx={{ ml: 1 }}>
                                                                    {tran.remark ? tran.remark : tran.Category.name}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="subtitle1" color="textPrimary">
                                                                {tran.type ? "+" : "-"} {tran.amount}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align='right'>
                                                        <IconButton
                                                            id="basic-button"
                                                            aria-controls={anchorEl ? "basic-menu" : undefined}
                                                            aria-haspopup="true"
                                                            aria-expanded={anchorEl ? "true" : undefined}
                                                            onClick={(event) => handleMenuOpen(event, tran)} // Pass the event and the transaction
                                                        >
                                                            <IconDots width={18} />
                                                        </IconButton>   
                                                            <Menu
                                                                id="basic-menu"
                                                                anchorEl={anchorEl}
                                                                open={Boolean(anchorEl)}
                                                                onClose={handleMenuClose}
                                                                MenuListProps={{
                                                                    "aria-labelledby": "basic-button"
                                                                }}
                                                            >
                                                                    <MenuItem onClick={() => {
                                                                        handleEditClick(selectedTransaction.id, selectedTransaction);
                                                                    }}>
                                                                    <ListItemIcon>
                                                                        <IconEdit width={18} />
                                                                    </ListItemIcon>
                                                                    Edit
                                                                </MenuItem>
                                                                <MenuItem onClick={() => {
                                                                        handleDeleteClick(selectedTransaction.id);
                                                                    }}>
                                                                    <ListItemIcon>
                                                                        <IconTrash width={18} />
                                                                    </ListItemIcon>
                                                                    Delete
                                                                </MenuItem>
                                                            </Menu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}

                                                {/* Divider Between Days */}
                                                {dayIndex < trans.length - 1 && (
                                                    <TableRow>
                                                        <TableCell colSpan={3}>
                                                            <Divider />
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        ))
                                    )}
                                </TableBody>
                                <EditTrans 
                                    open={openEditModal} 
                                    onClose={() => setOpenEditModal(false)} 
                                    onExpenseAdded={handleExpenseAdded} 
                                    transactionId={selectedTransactionId} 
                                    transaction={selectedTransac}
                                />

                                <DeleteTrans
                                    open={deleteDialogOpen} 
                                    onClose={() => setDeleteDialogOpen(false)} 
                                    onTransactionDeleted={handleTransactionDeleted } 
                                    transactionId={selectedTransactionId} 
                                />

                               <AddTransactionModal 
                                    open={transOpen} 
                                    onClose={handleTransClose}
                                    getExpense={handleExpenseAdded}
                                    getIncome={handleExpenseAdded}
                                />
                            </Table>
                        </TableContainer>
                    </Card>
                </Container>

            </DashboardCard>
        </PageContainer>
    );
};

export default Transactions;