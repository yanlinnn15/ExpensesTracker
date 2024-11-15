import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { useTheme } from "@mui/material/styles";
import {
  Grid,
  Stack,
  Typography,
  Box,
  CardContent,
  Select,
  MenuItem,
  Tab,
  Tabs
} from "@mui/material";
import DashboardCard from '../../../components/shared/DashboardCard';
import { IconGridDots } from "@tabler/icons-react";
import getLast12Months from '../../func/func12m';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const TransOverview = () => {
  let navigate = useNavigate();
  const theme = useTheme();
  const primary = "rgb(93, 135, 255)";
  const secondary = "rgb(73,190,255)";
  const textColor =
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.8)" : "#2A3547";

  const [tabIndex, setTabIndex] = useState(0);
  const [months, lastmonth] = getLast12Months();
  const [selectedDate, setSelectedDate] = useState(lastmonth);
  const [expense, setExpense] = useState([]);
  const [income, setIncome] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null); 

  const handleDateMenuClose = (month) => {
    setSelectedDate(month);
  };

  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate('/auth/login');
    } else {
      axios.get(`http://localhost:3001/trans/viewAll?mth=${selectedDate}`, {
        headers: { accessToken: localStorage.getItem("accessToken") }
      })
      .then((response) => {
        const incomeData = response.data.monthly.filter(item => item.type === true);
        const expenseData = response.data.monthly.filter(item => item.type === false);

        setIncome(incomeData);
        setExpense(expenseData);
      })
      .catch((error) => {
        setErrorMsg(error.response ? error.response.data.message : "Server Error");
      });
    }
  }, [selectedDate, navigate]);

  const data = {
    income: {
      labels: income?.map((transaction) => transaction?.Category?.name) || [],
      values: income?.map((transaction) => Number(transaction?.totalAmount)) || []
    },
    expenses: {
      labels: expense?.map((transaction) => transaction?.Category?.name) || [],
      values: expense?.map((transaction) => Number(transaction?.totalAmount)) || []
    }
  };

  const selectedData = tabIndex === 0 ? data.income : data.expenses;

  const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  };

  const chartColors = selectedData.labels.map((_, index) =>
    [primary, secondary][index] || generateRandomColor()
  );

  const optionscolumnchart = {
    chart: {
      type: "donut",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      toolbar: { show: false },
      height: 275
    },
    labels: selectedData.labels,
    colors: chartColors,
    plotOptions: {
      pie: {
        donut: {
          size: "89%",
          background: "transparent",
          labels: {
            show: true,
            name: { show: true, offsetY: 7 },
            total: {
              show: true,
              color: textColor,
              fontSize: "20px",
              fontWeight: "600",
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return `RM ${total.toFixed(2)}`;
              },
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
    legend: { show: false },
    tooltip: {
      theme: "dark",
      fillSeriesColor: false,
      y: {
        formatter: (value) => `RM ${parseFloat(value).toFixed(2)}` 
      }
    }
  };

  return (
    <Grid item xs={12}>
      <DashboardCard 
        title="Transaction Overview" 
        action={
            <Select
            labelId="month-dd"
            id="month-dd"
            value={selectedDate}
            size="small"
            onChange={(event) => handleDateMenuClose(event.target.value)}
            displayEmpty 
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
        <Box sx={{ borderBottom: 1, borderColor: "divider", alignItems:"center",
                        display: "flex", 
                      justifyContent:"center" }}>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label="Income" />
            <Tab label="Expenses" />
          </Tabs>
        </Box>
        <Grid container spacing={2} mt={1} p={2}>
          <Grid item xs={12} md={6}>
            {selectedData.labels.length > 0 ? (
              <Chart
                options={optionscolumnchart}
                series={selectedData.values} // Use the raw float values directly
                type="donut"
                height="275px"
              />
            ) : (
              <Typography variant="h6" color="textSecondary" sx={{ minHeight: 275, maxHeight: 275, overflowY: "auto" }}>
                No Transactions for {tabIndex === 0 ? 'Income' : 'Expenses'}.
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <CardContent sx={{ minHeight: 275, maxHeight: 275, overflowY: "auto" }}>
              <Stack spacing={2}>
                {selectedData.labels.length > 0 ? (
                  selectedData.labels.map((category, index) => (
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      key={index}
                    >
                      <Box
                        width={38}
                        height={38}
                        bgcolor={chartColors[index]}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{ borderRadius: "7px" }}
                      >
                        <Typography
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <IconGridDots width={22} />
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="600">
                          {category}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          color="textSecondary"
                        >
                          Amount: RM {parseFloat(selectedData.values[index]).toFixed(2)}
                        </Typography>
                      </Box>
                    </Stack>
                  ))
                ) : (
                  <Typography variant="body1" color="textSecondary">
                    No data available.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Grid>
        </Grid>
      </DashboardCard>
    </Grid>
  );
};

export default TransOverview;