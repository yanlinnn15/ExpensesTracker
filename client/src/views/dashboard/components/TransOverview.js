import React, { useState, useEffect, useMemo } from "react";
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
import api from 'src/api';
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from 'src/helpers/authCheck';

const CHART_COLORS = [
  "#5d87ff", "#49beff", "#f5a623", "#7ed321",
  "#bd10e0", "#ff6b6b", "#4ecdc4", "#45b7d1",
  "#96ceb4", "#ffeaa7",
];

const TransOverview = () => {
  let navigate = useNavigate();
  const theme = useTheme();
  const textColor = theme.palette.mode === "dark" ? "rgba(255,255,255,0.8)" : "#2A3547";

  const [tabIndex, setTabIndex] = useState(0);
  const [months, lastmonth] = getLast12Months();
  const [selectedDate, setSelectedDate] = useState(lastmonth);
  const [expense, setExpense] = useState([]);
  const [income, setIncome] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleDateMenuClose = (month) => setSelectedDate(month);
  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/auth/login');
      return;
    }
    api.get(`/trans/viewAll?mth=${selectedDate}`)
      .then((response) => {
        setIncome(response.data.monthly.filter(item => item.type === true));
        setExpense(response.data.monthly.filter(item => item.type === false));
        setErrorMsg(null);
      })
      .catch((error) => {
        setErrorMsg(error.response ? error.response.data.message : "Server Error");
      });
  }, [selectedDate]);

  const data = useMemo(() => ({
    income: {
      labels: income.map((t) => t?.Category?.name ?? "Unknown"),
      values: income.map((t) => Math.abs(parseFloat(t?.totalAmount) || 0)),
    },
    expenses: {
      labels: expense.map((t) => t?.Category?.name ?? "Unknown"),
      values: expense.map((t) => Math.abs(parseFloat(t?.totalAmount) || 0)),
    },
  }), [income, expense]);

  const selectedData = tabIndex === 0 ? data.income : data.expenses;

  const chartColors = useMemo(
    () => selectedData.labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
    [selectedData]
  );

  const chartOptions = useMemo(() => ({
    chart: {
      type: "donut",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      toolbar: { show: false },
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
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return `RM ${total.toFixed(2)}`;
              },
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
    legend: { show: false },
    tooltip: {
      theme: "dark",
      fillSeriesColor: false,
      y: { formatter: (v) => `RM ${parseFloat(v).toFixed(2)}` },
    },
  }), [selectedData, chartColors, textColor]);

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
            onChange={(e) => handleDateMenuClose(e.target.value)}
            displayEmpty
          >
            {months.map((month) => (
              <MenuItem key={month} value={month}>{month}</MenuItem>
            ))}
          </Select>
        }
      >
        {errorMsg && <Typography color="error">{errorMsg}</Typography>}
        <Box sx={{ borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "center" }}>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label="Income" />
            <Tab label="Expenses" />
          </Tabs>
        </Box>
        <Grid container spacing={2} mt={1} p={2}>
          <Grid item xs={12} md={6}>
            {selectedData.labels.length > 0 ? (
              <Chart
                key={`${tabIndex}-${selectedDate}`}
                options={chartOptions}
                series={selectedData.values}
                type="donut"
                height="250px"
              />
            ) : (
              <Typography variant="h6" color="textSecondary" sx={{ minHeight: 250 }}>
                No Transactions for {tabIndex === 0 ? 'Income' : 'Expenses'}.
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <CardContent sx={{ minHeight: 250, maxHeight: 250, overflowY: "auto" }}>
              <Stack spacing={2}>
                {selectedData.labels.length > 0 ? (
                  selectedData.labels.map((category, index) => (
                    <Stack direction="row" spacing={2} alignItems="center" key={index}>
                      <Box
                        width={38}
                        height={38}
                        bgcolor={chartColors[index]}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{ borderRadius: "7px" }}
                      >
                        <Typography display="flex" alignItems="center" justifyContent="center">
                          <IconGridDots width={22} />
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="600">{category}</Typography>
                        <Typography variant="subtitle2" color="textSecondary">
                          Amount: RM {selectedData.values[index].toFixed(2)}
                        </Typography>
                      </Box>
                    </Stack>
                  ))
                ) : (
                  <Typography variant="body1" color="textSecondary">No data available.</Typography>
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
