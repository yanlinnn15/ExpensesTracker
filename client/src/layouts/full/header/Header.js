import React, { useState, useContext, useEffect } from 'react';
import { Box, AppBar, Toolbar, styled, Stack, IconButton, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import Profile from './Profile';
import { IconMenu, IconPlus } from '@tabler/icons-react';
import { AuthContext } from '../../../helpers/AuthContext';

const Header = ({ toggleMobileSidebar }) => {
  const { authState } = useContext(AuthContext);

  const [fname, setFname] = useState('Guest'); 

  useEffect(() => {
    if (authState.status) {
      
      setFname(authState.fname || 'User');  
    }
  }, [authState.fname]); 

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    [theme.breakpoints.up('lg')]: {
      minHeight: '70px',
    },
  }));
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: 'none',
              xs: 'inline',
            },
          }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>

        <Box flexGrow={1} />

        <Stack spacing={1} direction="row" alignItems="center">
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  toggleMobileSidebar: PropTypes.func.isRequired,
};

export default Header;