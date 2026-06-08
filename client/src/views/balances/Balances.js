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
  Alert,
  CircularProgress,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { IconCoin, IconChevronRight } from "@tabler/icons-react";
import { useNavigate, Link } from 'react-router-dom';
import api from 'src/api';
import { isAuthenticated } from 'src/helpers/authCheck';
import { INCOME_COLOR, EXPENSE_COLOR } from 'src/helpers/transactionColors';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Balances = () => {
  const [errormsg, setErrorMsg] = useState(null);
  const [ttlExpense, setTtlExpense] = useState("");
  const [surplus, setSurplus] = useState("");
  const [listE, setListE] = useState([]);
  const [listI, setListI] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [ttlIncome, setTtlIncome] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/auth/login');
      return;
    }

    const monthlyData = Array.from({ length: currentMonth }, (_, i) => ({
      month: String(i + 1).padStart(2, '0'),
      income: 0.00,
      expense: 0.00,
      balance: 0.00,
    }));

    api.get("/trans/viewMonth")
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
          monthData.balance = (parseFloat(monthData.income) - parseFloat(monthData.expense)).toFixed(2);
        });

        setMonthlyData(monthlyData);
      })
      .catch((error) => {
        setErrorMsg(error.message);
      })
      .finally(() => setIsLoading(false));
  }, [navigate, currentMonth, currentYear]);


  return (
    <PageContainer title="Balances" description="Balance Page">
      <DashboardCard title="Balances">
        {errormsg && <Alert severity="warning" sx={{ mb: 2 }}>{errormsg}</Alert>}
        {isLoading && <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>}
        <Container maxWidth="lg" disableGutters>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
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
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      RM {surplus}
                    </Typography>
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} mt={2} spacing={1}>
                    <Typography variant="subtitle2" color="textPrimary">
                      Income: RM {ttlIncome}
                    </Typography>
                    <Typography variant="subtitle2" color="textPrimary">
                      Expenses: RM {ttlExpense}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
        <Box mt={2} />
        <Container maxWidth={false} disableGutters>
          <Card variant="outlined" sx={{ overflow: 'hidden' }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table aria-label="simple table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ px: 1 }}>
                      <Typography variant="subtitle2" color="textSecondary">Month</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ px: 1 }}>
                      <Typography variant="subtitle2" color="textSecondary">Income</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ px: 1 }}>
                      <Typography variant="subtitle2" color="textSecondary">Expense</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ px: 1 }}>
                      <Typography variant="subtitle2" color="textSecondary">Balance</Typography>
                    </TableCell>
                    <TableCell sx={{ px: 1 }} />
                  </TableRow>
                </TableHead>
                  <TableBody>
                    {monthlyData.map((row) => {
                      const balanceNum = parseFloat(row.balance);
                      const balanceColor = balanceNum >= 0 ? INCOME_COLOR : EXPENSE_COLOR;
                      return (
                        <TableRow key={row.month}>
                          <TableCell sx={{ px: 1 }}>
                            <Typography variant="subtitle2" color="textPrimary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                              {MONTH_NAMES[parseInt(row.month, 10) - 1]}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ px: 1 }}>
                            <Typography variant="subtitle2" color="textPrimary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {row.income}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ px: 1 }}>
                            <Typography variant="subtitle2" color="textPrimary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {row.expense}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ px: 1 }}>
                            <Typography variant="subtitle2" color={balanceColor} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}>
                              {row.balance}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ px: 1 }}>
                            <Link to={`/transactions?mth=${currentYear}-${row.month}`}>
                              <Button
                                sx={{
                                  minWidth: 0,
                                  padding: 0,
                                  color: 'text.secondary',
                                  '&:hover': {
                                    color: 'primary.main',
                                  },
                                }}
                              >
                                <IconChevronRight />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
