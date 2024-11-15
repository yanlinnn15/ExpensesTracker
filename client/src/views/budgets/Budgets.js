import React, { useEffect, useState } from 'react';
import {
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  useTheme
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { Container, Grid, Stack, Avatar, Card, CardContent, CardHeader } from '@mui/material';
import { IconCircleCheck, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import DashboardCard from '../../components/shared/DashboardCard';
import Chart from 'react-apexcharts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddBudget from './addbudget';
import EditBudget from './editbudget';
import DeleteBudget from './deletebudget';
import { showToast } from '../../helpers/showtoast';

function Budgets() {
  const theme = useTheme();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [ttlBudget, setTtlBudget] = useState(0.00);
  const [ttlAmount, setTtlAmount] = useState(0.00);
  const [budgetTrans, setBudgetTrans] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setDeleteDialogOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const navigator = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigator('/auth/login');
      return;
    }
    axios.get("http://localhost:3001/budget/viewAll", {
      headers: { accessToken },
    })
    .then((response) => {
      if (response.data) {
        console.log(response.data.totalAmount)

        setTtlBudget(
          isNaN(parseFloat(response.data.totalBudget)) ? 0 : parseFloat(response.data.totalBudget).toFixed(2)
        );
        setTtlAmount(
          isNaN(parseFloat(response.data.totalAmount)) ? 0 : parseFloat(response.data.totalAmount).toFixed(2)
        );
        setBudgetTrans(response.data.budgetTrans);
      }
    })
    .catch((error) => {
      setErrorMsg(error.message);
    });
  }, [navigator]);

  const handleBudgetAdded = (newCate) => {
    axios.get('http://localhost:3001/budget/viewAll', {
      headers: {
        accessToken: localStorage.getItem("accessToken"),
      }
    })
    .then((response) => {
      if (response.data) {
        setTtlBudget(
          isNaN(parseFloat(response.data.totalBudget)) ? 0 : parseFloat(response.data.totalBudget).toFixed(2)
        );
        setTtlAmount(
          isNaN(parseFloat(response.data.totalAmount)) ? 0 : parseFloat(response.data.totalAmount).toFixed(2)
        );
        setBudgetTrans(response.data.budgetTrans);
        showToast('Successful!');
      }
    })
    .catch((error) => {
      setErrorMsg(error.message);
    });
  };

  const handleEditClick = (id, budget) => {
    setSelectedBudget(budget);
    setSelectedBudgetId(id);
    setOpenEditModal(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedBudgetId(id);
    setDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    setOpenAddModal(true);
  };

  const handleDelete = (id) => {
    const budgetItem = budgetTrans.find((item) => item.id === id);
    setBudgetTrans(budgetTrans.filter((item) => item.id !== id));
    setTtlAmount((parseFloat(ttlAmount - budgetItem.totalSpent)).toFixed(2));
    setTtlBudget((parseFloat(ttlBudget - budgetItem.amount)).toFixed(2));
    showToast('Deleted successfully!');
  };

  const primary = "rgb(93,135,255)";
  const primarylight = "rgb(236,242,255)";
  const successlight = "rgb(230, 255, 250)";

  return (
    <PageContainer title="Budgets" description="this is Budgets">
      <DashboardCard title="Budgets">
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" fontWeight="700"></Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleAddClick()}
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
              New Budget
            </Button>
          </Stack>

          <Grid container spacing={3} mb={4}>
            {[ 
              { title: "Total Budget", amount: ttlBudget, color: primary, bgcolor: primarylight },
              { title: "Total Spent", amount: ttlAmount, color: theme.palette.error.main, bgcolor: "rgb(255, 231, 217)" },
              { title: "Remaining Budget", amount: (ttlBudget - ttlAmount).toFixed(2), color: "rgb(0, 194, 146)", bgcolor: successlight }
            ].map((card, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card elevation={3} sx={{ bgcolor: card.bgcolor, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="textSecondary">{card.title}</Typography>
                    <Typography variant="h4" color={card.color} sx={{ fontWeight: 'bold' }}>RM {card.amount.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            {budgetTrans.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="h6" align="center" color="textSecondary">
                  No Budget Available
                </Typography>
              </Grid>
            ) : (
              budgetTrans.map((budget, index) => {
                const percentage = ((budget.totalSpent / budget.amount) * 100).toFixed(1);
                const isOverBudget = budget.totalSpent >= budget.amount*0.75;

                const pieChartOptions = {
                  series: [budget.totalSpent, Math.max(0, budget.amount - budget.totalSpent)],
                  options: {
                    chart: { type: 'donut', height: 200 },
                    labels: ['Spent', 'Remaining'],
                    colors: [isOverBudget ? theme.palette.error.main : primary, primarylight],
                    plotOptions: { pie: { donut: { size: '75%' } } },
                    dataLabels: { enabled: false },
                    legend: { show: false },
                    stroke: { show: false }
                  }
                };

                return (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Card elevation={3} sx={{ transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                      <CardHeader
                        title= {budget.remark? budget.remark: budget.Category.name}
                        action={
                          <Stack direction="row" spacing={1}>
                            <IconButton onClick={() => handleEditClick(budget.id, budget)} size="small">
                              <IconPencil size={18} />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteClick(budget.id)} size="small" color="error">
                              <IconTrash size={18} />
                            </IconButton>
                          </Stack>
                        }
                      />
                      <CardContent>
                        <Box display="flex" justifyContent="center" mb={2}>
                          <Chart options={pieChartOptions.options} series={pieChartOptions.series} type="donut" width="200px" />
                        </Box>
                        <Typography variant="h6" align="center" gutterBottom>
                          RM {(budget.totalSpent.toFixed(2)).toLocaleString()} / RM {budget.amount.toLocaleString()}
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="center">
                          <Avatar sx={{ bgcolor: successlight, width: 24, height: 24, mr: 1 }}>
                            <IconCircleCheck size={16} color="#4caf50" />
                          </Avatar>
                          <Typography variant="body2">{percentage}% of budget used</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        </Container>
      </DashboardCard>

      <AddBudget 
        open={openAddModal} 
        onClose={() => setOpenAddModal(false)} 
        onBudgetAdded={handleBudgetAdded} 
      />

      <EditBudget 
        open={openEditModal} 
        onClose={() => setOpenEditModal(false)} 
        onBudgetAdded={handleBudgetAdded} 
        Bid={selectedBudgetId}
        budgets={selectedBudget}
      />

      <DeleteBudget
        open={openDeleteDialog} 
        onClose={() => setDeleteDialogOpen(false)} 
        onBudgetDeleted={handleDelete} 
        budgetID={selectedBudgetId} 
      />
    </PageContainer>
  );
};

export default Budgets;
