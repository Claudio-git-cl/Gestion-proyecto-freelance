import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Button,
  Tooltip,
  Divider,
  ListItemIcon,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Dashboard as DashboardIcon,
  Assignment as ProjectsIcon,
  People as ClientsIcon,
  Receipt as InvoicesIcon,
  Timer as TimeTrackingIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { logout } from '../../redux/slices/authSlice';
import { toggleDarkMode } from '../../redux/slices/themeSlice';

const pages = [
  { name: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { name: 'Proyectos', path: '/projects', icon: <ProjectsIcon /> },
  { name: 'Clientes', path: '/clients', icon: <ClientsIcon /> },
  { name: 'Facturas', path: '/invoices', icon: <InvoicesIcon /> },
  { name: 'Control de Tiempo', path: '/time-tracking', icon: <TimeTrackingIcon /> }
];

const MainNavigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user } = useSelector(state => state.auth);
  const { darkMode } = useSelector(state => state.theme);
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleLogout = () => {
    dispatch(logout())
      .unwrap()
      .then(() => {
        navigate('/login');
      });
    handleCloseUserMenu();
  };
  
  const handleToggleTheme = () => {
    dispatch(toggleDarkMode());
    handleCloseUserMenu();
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          FreelanceGest
        </Typography>
        <IconButton onClick={handleToggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItem key={page.name} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={page.path}
              selected={isActive(page.path)}
              onClick={handleToggleDrawer}
            >
              <ListItemIcon>
                {page.icon}
              </ListItemIcon>
              <ListItemText primary={page.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
  
  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {isMobile ? (
              <>
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleToggleDrawer}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography
                  variant="h6"
                  noWrap
                  component={RouterLink}
                  to="/dashboard"
                  sx={{
                    mr: 2,
                    display: 'flex',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  FreelanceGest
                </Typography>
              </>
            ) : (
              <>
                <Typography
                  variant="h6"
                  noWrap
                  component={RouterLink}
                  to="/dashboard"
                  sx={{
                    mr: 2,
                    display: 'flex',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  FreelanceGest
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex' }}>
                  {pages.map((page) => (
                    <Button
                      key={page.name}
                      component={RouterLink}
                      to={page.path}
                      sx={{
                        my: 2,
                        color: 'white',
                        display: 'block',
                        backgroundColor: isActive(page.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        }
                      }}
                    >
                      {page.name}
                    </Button>
                  ))}
                </Box>
              </>
            )}
            
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Abrir opciones">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={user?.firstName}
                    src={user?.avatar || '/static/images/avatar/default.jpg'}
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={handleCloseUserMenu} component={RouterLink} to="/profile">
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Perfil</Typography>
                </MenuItem>
                <MenuItem onClick={handleCloseUserMenu} component={RouterLink} to="/settings">
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Configuración</Typography>
                </MenuItem>
                <MenuItem onClick={handleToggleTheme}>
                  <ListItemIcon>
                    {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                  </ListItemIcon>
                  <Typography textAlign="center">
                    {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Cerrar Sesión</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleToggleDrawer}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default MainNavigation;