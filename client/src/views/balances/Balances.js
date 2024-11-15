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
  Typography,
  Avatar,
  Button,
  TableHead,
  CardContent,
  Stack,
  Box,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { IconCoin, IconFilter, IconChevronRight } from "@tabler/icons-react";
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Balances = () => {
  const [errormsg, setErrorMsg] = useState(null);
  const [ttlExpense, setTtlExpense] = useState("");
  const [surplus, setSurplus] = useState("");
  const [listE, setListE] = useState([]);
  const [listI, setListI] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [ttlIncome, setTtlIncome] = useState("");
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/auth/login');
      return;
    }

    const monthlyData = Array.from({ length: currentMonth }, (_, i) => ({
      month: String(i + 1).padStart(2, '0'),
      income: 0.00,
      expense: 0.00,
      balance: 0.00,
    }));

    axios.get("http://localhost:3001/trans/viewMonth", {
      headers: { accessToken: localStorage.getItem('accessToken') }
    })
      .then((response) => {
        setTtlExpense(response.data.ttlExpense);
        setTtlIncome(response.data.ttlIncome);
        setListE(response.data.monthlyE);
        setListI(response.data.monthlyI);
        setSurplus(response.data.surplus);

        response.data.monthlyI.forEach(({ year, month, totalAmount }) => {
          if (year === currentYear && month <= currentMonth) {
            const parsedAmount = parseFloat(totalAmount);
            monthlyData[month - 1].income = !isNaN(parsedAmount) ? parsedAmount.toFixed(2) : '0.00'; 
          }
        });

        response.data.monthlyE.forEach(({ year, month, totalAmount }) => {
          if (year === currentYear && month <= currentMonth) {
            const parsedAmount = parseFloat(totalAmount);
            monthlyData[month - 1].expense = !isNaN(parsedAmount) ? parsedAmount.toFixed(2) : '0.00'; 
          }
        });

        monthlyData.forEach(monthData => {
          monthData.balance = (parseFloat(monthData.income) - parseFloat(monthData.expense)).toFixed(2); // Format to 2 decimal places
        });

        setMonthlyData(monthlyData);
      })
      .catch((error) => {
        setErrorMsg(error.message);
      });
  }, [navigate, currentMonth, currentYear]);


  return (
    <PageContainer title="Balances" description="Balance Page">
      <DashboardCard title="Balances">
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        variant="rounded"
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: 'primary.main',
                        }}
                      >
                        <IconCoin sx={{ width: 24, height: 24 }} />
                      </Avatar>
                      <Typography variant="h6" color="textPrimary">
                        {currentYear} Surplus
                      </Typography>
                    </Stack>
                    
                  </Box>

                  <Typography variant="h5" sx={{ marginTop: 2 }}>
                    RM {surplus}
                  </Typography>

                  <Stack direction="row" mt={1}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="textPrimary" align="left">
                          Income : RM {ttlIncome}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="textPrimary" align="left">
                          Expenses: RM {ttlExpense}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
        <Box mt={2} />
        <Container fluid>
          <Card variant="outlined">
            <TableContainer>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '10%' }}>
                      <Typography variant="subtitle1" color="textSecondary">Month</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ width: '25%' }}>
                      <Typography variant="subtitle1" color="textSecondary">Income</Typography>
                    </TableCell>
                    <TableCell align="right"  sx={{ width: '25%' }}>
                      <Typography variant="subtitle1" color="textSecondary">Expense</Typography>
                    </TableCell>
                    <TableCell align="right"  sx={{ width: '25%' }}>
                      <Typography variant="subtitle1" color="textSecondary">Balance</Typography>
                    </TableCell>
                    <TableCell  sx={{ width: '15%' }}></TableCell>
                  </TableRow>
                </TableHead>
                  <TableBody>
                    {monthlyData.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell>
                          <Typography variant="subtitle1" color="textPrimary">
                            {row.month}
                          </Typography>
                        </TableCell>
                        <TableCell align="right"> 
                          <Typography variant="subtitle1" color="textPrimary">
                            {row.income}
                          </Typography>
                        </TableCell>
                        <TableCell align="right"> 
                          <Typography variant="subtitle1" color="textPrimary">
                            {row.expense}
                          </Typography>
                        </TableCell>
                        <TableCell align="right"> 
                          <Typography variant="subtitle1" color="textPrimary">
                            {row.balance}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                        <Link 
                          to={`/transactions?mth=${currentYear}-${row.month}`} >
                            <Button
                                sx={{
                                  minWidth: 0,
                                  padding: 0,
                                  color: 'text.secondary',
                                  '&:hover': {
                                    color: 'primary.main',
                                  },
                                }}
                                onClick={() => console.log('Filter clicked')}
                              >
                                <IconChevronRight />
                              </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Container>
      </DashboardCard>
    </PageContainer>
  );
};

export default Balances;
