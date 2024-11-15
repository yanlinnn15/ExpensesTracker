import React, { useEffect, useState } from 'react';
import { Stack, Typography, Avatar, Box, Select, MenuItem, Card, CardContent } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../../../components/shared/DashboardCard';
import getLast12Months from '../../func/func12m';
import axios from 'axios';
import * as TablerIcons from "@tabler/icons-react"; 

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
  
  const navigate = useNavigate();

  const handleDateMenuClose = (month) => {
    setSelectedDate(month);
    setAnchorEl1(null);
  };

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate('/auth/login');
    } else {
      axios.get(`http://localhost:3001/trans/viewAll?mth=${selectedDate}`, {
        headers: { accessToken: localStorage.getItem("accessToken") }
      })
      .then((response) => {
        if (response.data) {
          setTtlIncome(response.data.ttlIncome); 
          setTtlExpense(response.data.ttlExpense); 
          setTtlBalance(parseFloat(response.data.ttlIncome - response.data.ttlExpense).toFixed(2));
        } else {
          alert('Unexpected response format. Please try again.');
        }
      })
      .catch((error) => {
        setErrorMsg(error.response ? error.response.data.message : "Server Error");
      });
    }
  }, [selectedDate, navigate]);

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
      color: "rgb(102,187,106)",
      lightcolor: "rgb(232,245,233)",
      icon: "IconReceiptTax"
    },
    {
      title: "Expenses",
      subtitle: "Monthly Expenses",
      amount: ttlExpense, 
      color: "rgb(250,137,107)",
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