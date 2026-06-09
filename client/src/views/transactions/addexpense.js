import React, { useState, useEffect } from 'react';  
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal, Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, TextField, IconButton, CircularProgress } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { IconPlus, IconSquareRoundedX } from '@tabler/icons-react';
import * as TablerIcons from "@tabler/icons-react";
import api from 'src/api';  
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from 'src/helpers/authCheck';
import { modalStyle as style } from 'src/helpers/modalStyle';

const renderIcon = (iconName) => {
  const IconComponent = TablerIcons[iconName];
  return IconComponent ? <IconComponent /> : <TablerIcons.IconHelp />;
};

const today = (() => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
})();

const initialValues = {
  amount: '',
  remark: '',
  CategoryId: '',
  date: today,
  type: false
};

const validationSchema = Yup.object({
  amount: Yup.number().required('Required').min(0.1, 'Must be at least 0.1'),
  remark: Yup.string().optional(),
  CategoryId: Yup.string().required('Required'),
  date: Yup.date().required('Required'),
});

function AddExpenses({ open, onClose, getExpenses }) {
  const navigate = useNavigate();  
  const [cate, setCate] = useState([]);  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/auth/login");
      return;
    }
    api.get("/cate/viewAll").then((response) => {
      if (response.data) {
        setCate(response.data.cateexpense);
      }
    }).catch((error) => {
      const message = error.response ? error.response.data.message : error.message;
      setDialogMessage(message);
      setDialogOpen(true);
    });
  }, []);

  const onSubmit = (data, { setSubmitting }) => {
    api.post("/trans/", data).then((response) => {
        if (response.data && response.data.trans) {
            const category = cate.find(c => c.id === data.CategoryId);
            const transaction = {
                ...response.data.trans,
                Category: {
                    name: category?.name || 'Unknown',
                    Icon: category?.Icon || { icon_class: 'IconHelp' }
                }
            };
            getExpenses(transaction);
            onClose();
        }
    }).catch((error) => {
        console.error("Error submitting expense:", error);
        const message = error.response ? error.response.data.message : error.message;
        setDialogMessage(message);
        setDialogOpen(true);
    }).finally(() => setSubmitting(false));
};

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" gutterBottom>
          Add Expense
        </Typography>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16 }}>
          <IconSquareRoundedX />
        </IconButton>
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
        >
          {({ handleChange, values, errors, touched, isSubmitting }) => (
            <Form className="formContainer">
              <FormControl fullWidth margin="normal">
                <TextField
                  name="amount"
                  type="number"
                  label="Amount"
                  variant="outlined"
                  onChange={handleChange}
                  value={values.amount}
                  error={touched.amount && !!errors.amount}
                  helperText={touched.amount && errors.amount}
                  inputProps={{ 'aria-label': 'Amount' }}
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel id="CategoryId">Category</InputLabel>
                <Field
                  as={Select}
                  name="CategoryId"
                  label="Category"
                  labelId="CategoryId"
                  variant="outlined"
                  displayEmpty
                  error={touched.CategoryId && !!errors.CategoryId}
                >
                  {cate.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {renderIcon(cat.Icon.icon_class)}{cat.name}
                    </MenuItem>
                  ))}
                </Field>
                <ErrorMessage name="CategoryId" component="div" style={{ color: 'red' }} />
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
                  onChange={handleChange}
                  value={values.date}
                  error={touched.date && !!errors.date}
                  helperText={touched.date && errors.date}
                  inputProps={{ 'aria-label': 'Date' }} // Accessibility
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <TextField
                  name="remark"
                  label="Remark (optional)"
                  variant="outlined"
                  onChange={handleChange}
                  value={values.remark}
                  inputProps={{ 'aria-label': 'Remark' }} // Accessibility
                />
              </FormControl>

              <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting} startIcon={isSubmitting ? null : <IconPlus />}>
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Add Expense"}
              </Button>
            </Form>
          )}
        </Formik>

        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle></DialogTitle>
          <DialogContent>
            <DialogContentText>{dialogMessage}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">OK</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Modal>
  );
}

export default AddExpenses;