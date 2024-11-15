import React, {useState, useEffect} from 'react';
import { Select, MenuItem, Typography, LinearProgress, Box, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from '../../../components/shared/DashboardCard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



const BudgetTracker = () => {

    let navigator = useNavigate();
    
    const theme = useTheme();
    const [budgetTrans, setBudgetTrans] = useState([]);


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
            setBudgetTrans(response.data.budgetTrans);
          }
        })
        .catch((error) => {
          setErrorMsg(error.message);
        });
      }, [navigator]);
      
      return (
        <DashboardCard title="Yearly Budget Overview" sx={{ p: 0, mb: 2, width: '100%' }}>
            <Box sx={{ minHeight: '310px' }}> 
                <Stack spacing={2}>
                    {budgetTrans.length === 0 ? (
                        <Typography variant="subtitle1" align="center" color="textSecondary">
                            No Budgets Available
                        </Typography>
                    ) : (
                        budgetTrans.map((budget, index) => {
                            const progress = (budget.totalSpent / budget.amount) * 100;
                            const clampedProgress = Math.min(progress, 100);
                            return (
                                <Box key={index}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle1">{budget.remark ? budget.remark : budget.Category.name}</Typography>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            RM {budget.totalSpent.toFixed(2)} / RM {budget.amount}
                                            
                                        </Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={clampedProgress} 
                                        sx={{
                                            height: 10,
                                            borderRadius: 5,
                                            backgroundColor: theme.palette.grey[300],
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: clampedProgress > 75.00 ? theme.palette.error.main : theme.palette.primary.main,
                                            }
                                        }}
                                    />
                                </Box>
                            );
                        })
                    )}
                </Stack>
            </Box>
        </DashboardCard>
    );
};

export default BudgetTracker;
