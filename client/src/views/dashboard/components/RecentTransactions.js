import React, { useEffect, useState } from 'react';
import DashboardCard from '../../../components/shared/DashboardCard';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  timelineOppositeContentClasses,
} from '@mui/lab';
import { Typography, CircularProgress } from '@mui/material';
import * as TablerIcons from "@tabler/icons-react"; 
import api from 'src/api';
import { showsweetAlert } from '../../../helpers/alert';
import { Box } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from 'src/helpers/authCheck';
import { INCOME_COLOR, EXPENSE_COLOR } from 'src/helpers/transactionColors';

const renderIcon = (iconName) => {
  const IconComponent = TablerIcons[iconName]; 
  return IconComponent ? <IconComponent /> : <TablerIcons.IconHelp />; 
};

function RecentTransactions() {

  const [trans, setTrans] = useState([]);
  const [msgError, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  let navigation = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigation('/auth/login');
      return;
    }
    api.get(`/trans/viewAll`)
        .then((response) => {
          if (response.data) {
            setTrans(response.data.latestTrans);
          } else {
            showsweetAlert('Error', 'Unexpected response format. Please try again.', 'error');
          }
        }).catch((error) => {
          if (error.response) {
            setErrorMsg(error.response.data.message);
          } else {
            setErrorMsg("Server Error");
          }
        }).finally(() => setIsLoading(false));
  }, []);

  return (
    <DashboardCard
      title="Recent Transactions"
      sx={{
        p: 0,
        mb: 2,
        width: '100%',
        overflow: 'auto', 
      }}
    >
      <Box>
        {isLoading && <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>}
        <Timeline
          className="theme-timeline"
          sx={{
            p: 0,
            mb: '-40px',
            minHeight: '350px', 
            '& .MuiTimelineConnector-root': {
              width: '1px',
              backgroundColor: '#efefef',
            },
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.5,
              paddingLeft: 0,
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
            },
            '& .MuiTimelineItem-root': {
              display: 'flex',
              justifyContent: 'space-between',
            },
            '& .MuiTimelineContent-root': {
              flex: 1,
            },
          }}
        >
          {trans.length === 0 ? (
            <TimelineItem>
              <TimelineOppositeContent></TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color="primary" variant="outlined" />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>No Transaction</TimelineContent>
            </TimelineItem>
          ) : (
            trans.map((transaction, index) => (
              <TimelineItem key={index}>
                <TimelineOppositeContent style={{ fontSize: '0.75rem' }}>{transaction.date}</TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="primary" variant="outlined" />
                </TimelineSeparator>
                <TimelineContent style={{ fontSize: '0.8rem' }}>
                  {renderIcon(transaction.Category.Icon.icon_class)}
                  {transaction.remark ? transaction.remark : transaction.Category.name}
                </TimelineContent>
                <TimelineContent style={{ textAlign: 'right', fontSize: '0.8rem', whiteSpace: 'nowrap', color: transaction.type === true ? INCOME_COLOR : EXPENSE_COLOR }}>
                  {transaction.type === true ? "+" : "-"}RM {transaction.amount}
                </TimelineContent>
              </TimelineItem>
            ))
          )}
        </Timeline>
      </Box>
    </DashboardCard>
  );
};

export default RecentTransactions;
