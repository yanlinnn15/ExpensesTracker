import React, { useState } from 'react';
import { Modal, Box, Typography, Button, Divider } from '@mui/material';
import AddExpenses from './addexpense'; // Assuming this is your expenses modal component
import AddIncome from './addincome'; // Assuming you have a similar component for income
import { getIn } from 'formik';

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

function AddTransactionModal({ open, onClose, getExpense, getIncome}) {
  const [transactionType, setTransactionType] = useState(null);

  const handleSelectIncome = () => {
    setTransactionType('income');
  };

  const handleSelectExpense = () => {
    setTransactionType('expense');
  };

  const handleClose = () => {
    setTransactionType(null);
    onClose();
  };

  const addNewExpense = (newTransaction) => {
    getExpense(newTransaction);
  };

  const addNewIncome = (newTransaction) => {
    getIncome(newTransaction);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" gutterBottom align="center">
          Add Transaction
        </Typography>
        <Divider sx={{ mb: 4 }} />
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Please select a transaction type to continue.
        </Typography>
        <Box display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSelectIncome}
            sx={{ flex: 2 }}
          >
            Add Income
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSelectExpense}
            sx={{ flex: 2 }}
          >
            Add Expense
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {transactionType === 'income' && (
          <AddIncome open={transactionType === 'income'} onClose={handleClose} getIncomes={addNewIncome}/>
        )}
        {transactionType === 'expense' && (
          <AddExpenses open={transactionType === 'expense'} onClose={handleClose} getExpenses={addNewExpense} />
        )}
      </Box>
    </Modal>
  );
}

export default AddTransactionModal;
