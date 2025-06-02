import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleClose();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleClose();
  };

  const handleHomeClick = () => {
    navigate('/dashboard');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <>
      {/* Global CSS Reset */}
      <style jsx global>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          width: 100%;
          height: 100%;
        }
        *, *::before, *::after {
          box-sizing: inherit;
        }
      `}</style>
      
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          width: '100%',
          margin: 0,
          padding: 0,
          backgroundColor: '#ffffff'
        }}
      >
        {/* Header - Clean and minimal */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            color: '#1f2937'
          }}
        >
          <Toolbar 
            sx={{ 
              px: { xs: 2, sm: 3, md: 4 },
              minHeight: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 }
            }}
          >
            {/* Logo/Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 800,
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                >
                  SA
                </Typography>
              </Box>
              <Typography
                variant="h6"
                component="div"
                sx={{ 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  color: '#1f2937'
                }}
                onClick={handleHomeClick}
              >
                StaffPortal
              </Typography>
              <Typography
                variant="body2"
                sx={{ 
                  ml: 2, 
                  color: '#6b7280',
                  display: { xs: 'none', sm: 'block' },
                  fontSize: '0.8rem'
                }}
              >
                MLI International Schools
              </Typography>
            </Box>

            {/* Navigation Links */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
              <Button
                color="inherit"
                startIcon={<HomeIcon sx={{ fontSize: '1.1rem' }} />}
                onClick={handleHomeClick}
                sx={{ 
                  fontWeight: location.pathname === '/dashboard' ? 600 : 400,
                  display: { xs: 'none', md: 'flex' },
                  fontSize: '0.875rem',
                  py: 0.5,
                  color: '#374151',
                  '&:hover': {
                    backgroundColor: '#f3f4f6'
                  }
                }}
              >
                Dashboard
              </Button>
            </Box>

            {/* User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                display: { xs: 'none', sm: 'flex' }, 
                flexDirection: 'column', 
                alignItems: 'flex-end', 
                mr: 1 
              }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  lineHeight: 1.2,
                  color: '#1f2937'
                }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: '#6b7280',
                  fontSize: '0.7rem',
                  lineHeight: 1
                }}>
                  {user?.role}
                </Typography>
              </Box>
              
              <IconButton
                size="small"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                sx={{ 
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: '#f3f4f6'
                  }
                }}
              >
                <Avatar
                  sx={{ 
                    width: 28, 
                    height: 28, 
                    bgcolor: '#3b82f6',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  {getInitials(user?.firstName, user?.lastName)}
                </Avatar>
              </IconButton>
              
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1f2937' }}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    {user?.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem 
                  onClick={handleProfileClick}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f3f4f6'
                    }
                  }}
                >
                  <PersonIcon sx={{ mr: 1, color: '#6b7280' }} />
                  <Typography sx={{ color: '#374151' }}>My Profile</Typography>
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#fef2f2'
                    }
                  }}
                >
                  <LogoutIcon sx={{ mr: 1, color: '#ef4444' }} />
                  <Typography sx={{ color: '#ef4444' }}>Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Content - No constraints, full width */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            width: '100%',
            margin: 0,
            padding: 0,
            backgroundColor: 'transparent'
          }}
        >
          {children}
        </Box>

        {/* Footer - Clean and minimal */}
        <Box
          component="footer"
          sx={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e5e7eb',
            py: 2,
            px: { xs: 2, sm: 3, md: 4 },
            width: '100%'
          }}
        >
          <Typography variant="body2" sx={{ color: '#6b7280', textAlign: 'center' }}>
            © 2024 MLI International Schools. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </>
  );
} 