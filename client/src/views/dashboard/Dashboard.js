import React from 'react';
import { Grid, Box } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

// components
import TransOverview from './components/TransOverview';
import RecentTransactions from './components/RecentTransactions';
import BudgetTracker from './components/BudgetTrack';
import PaymentGateways from './components/balance';


const Dashboard = () => {
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <TransOverview />
          </Grid>
          <Grid item xs={12} lg={5}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <PaymentGateways />
              </Grid>
              
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6}>
            <RecentTransactions />
          </Grid>
          <Grid item xs={12} lg={6}>
            <BudgetTracker />
          </Grid> 
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
