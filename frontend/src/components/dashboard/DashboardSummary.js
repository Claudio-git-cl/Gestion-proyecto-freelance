import React from 'react';
import { Paper, Box, Typography, useTheme, alpha } from '@mui/material';
import { Link } from 'react-router-dom';

const DashboardSummary = ({ title, value, icon, color, linkTo }) => {
  const theme = useTheme();
  
  return (
    <Paper
      component={Link}
      to={linkTo}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {title}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            borderRadius: '50%',
            bgcolor: alpha(color, 0.1),
            color: color,
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', mt: 'auto' }}>
        {value}
      </Typography>
    </Paper>
  );
};

export default DashboardSummary;