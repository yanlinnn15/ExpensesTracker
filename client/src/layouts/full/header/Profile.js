import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  IconUserCircle
} from '@tabler/icons-react';
import { AuthContext } from '../../../helpers/AuthContext';
import {  IconUser } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  let navigate = useNavigate();
  const [anchorEl2, setAnchorEl2] = useState(null);
  const { authState, setAuthState } = useContext(AuthContext);
  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setAuthState({ fname: "", id: 0, status: false });
    navigate("/auth/login")
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
            sx={{
                width: 35,
                height: 35,
                backgroundColor:"primary.main"
            }}
        >
          <IconUserCircle />
        </Avatar>
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '200px',
          },
        }}
      >
        {authState.id && (
          <Link to={`/profile/${authState.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <MenuItem>
              <ListItemIcon>
                <IconUser width={20} />
              </ListItemIcon>
              <ListItemText primary="My Profile" />
            </MenuItem>
          </Link>
        )}
                <Box mt={1} py={1} px={2}>
          <Button to="/auth/login" variant="outlined" color="primary" onClick={logout} fullWidth>
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
