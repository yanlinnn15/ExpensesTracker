import React, { useEffect, useState } from 'react';
import { Stack, Typography, Avatar, Box, Select, MenuItem, Card, CardContent, CircularProgress } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../../../components/shared/DashboardCard';
import getLast12Months from '../../func/func12m';
import api from 'src/api';
import * as TablerIcons from "@tabler/icons-react";
import { isAuthenticated } from 'src/helpers/authCheck';
import { INCOME_COLOR, EXPENSE_COLOR } from 'src/helpers/transactionColors';
import { showsweetAlert } from '../../../helpers/alert';

const renderIcon = (iconName) => {
  const IconComponent = TablerIcons[iconName]; 
  return IconComponent ? <IconComponent /> : <TablerIcons.IconHelp />; 
};


const BalanceOverview = () => {
  const [anchorEl1, setAnchorEl1] = useState(null);
  const [months, lastmonth] = getLast12Months();
  const [selectedDate, setSelectedDate] = useState(lastmonth);
  const [ttlExpense, setTtlExpense] = useState(0);
  const [ttlIncome, setTtlIncome] = useState(0);
  const [ttlBalance, setTtlBalance] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleDateMenuClose = (month) => {
    setSelectedDate(month);
    setAnchorEl1(null);
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/auth/login');
      return;
    }
    setIsLoading(true);
    api.get(`/trans/viewAll?mth=${selectedDate}`)
    .then((response) => {
      if (response.data) {
        setTtlIncome(response.data.ttlIncome);
        setTtlExpense(response.data.ttlExpense);
        setTtlBalance(parseFloat(response.data.ttlIncome - response.data.ttlExpense).toFixed(2));
      } else {
        showsweetAlert('Error', 'Unexpected response format. Please try again.', 'error');
      }
    })
    .catch((error) => {
      setErrorMsg(error.response ? error.response.data.message : "Server Error");
    })
    .finally(() => setIsLoading(false));
  }, [selectedDate]);

  const stats = [
    {
      title: "Total Balance",
      subtitle: "Monthly Balance",
      amount: ttlBalance, 
      color: "rgb(93, 135, 255)",
      lightcolor: "rgb(236,242,255)",
      icon: "IconMoneybag"
    },
    {
      title: "Income",
      subtitle: "Monthly Income",
      amount: ttlIncome,
      color: INCOME_COLOR,
      lightcolor: "rgb(232,245,233)",
      icon: "IconReceiptTax"
    },
    {
      title: "Expenses",
      subtitle: "Monthly Expenses",
      amount: ttlExpense,
      color: EXPENSE_COLOR,
      lightcolor: "rgb(253,237,232)",
      icon: "IconCreditCardPay"
    }
  ];

  return (
    <DashboardCard 
      title="Monthly Balance" 
      sx={{ padding: '20px' }}
      action={
        <Select
          labelId="month-dd"
          id="month-dd"
          value={selectedDate}
          size="small"
          onChange={(event) => handleDateMenuClose(event.target.value)}
        >
          {months.map((month) => (
            <MenuItem key={month} value={month}>
              {month}
            </MenuItem>
          ))}
        </Select>
      }
    >
      {errorMsg && <Typography color="error">{errorMsg}</Typography>}
      {isLoading && <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>}
      <Stack spacing={3} mt={2}>
        {stats.map((stat, i) => (
          <Card key={i} sx={{ backgroundColor: stat.lightcolor, boxShadow: 2 }}>
            <CardContent>
              <Stack
                direction="row"
                spacing={2}
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      bgcolor: stat.lightcolor,
                      color: stat.color,
                      width: 60,
                      height: 70
                    }}
                  >
             
                    {renderIcon(stat.icon)}
                  </Avatar>
                  <Box >
                    <Typography variant="h6" mb="4px">
                      {stat.title}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      {stat.subtitle}
                    </Typography>
                  </Box>
                </Stack>
                <Typography
                  variant="subtitle2"
                  fontWeight="600"
                  color={stat.title === "Expenses" ? "error" : "primary"}
                >
                  RM {stat.amount}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </DashboardCard>
  );
};

export default BalanceOverview;