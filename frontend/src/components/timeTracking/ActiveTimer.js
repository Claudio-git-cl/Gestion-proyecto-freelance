import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Chip,
  Grid
} from '@mui/material';
import {
  Stop as StopIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { differenceInSeconds, format } from 'date-fns';

const ActiveTimer = ({ timer, onStop, project }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (timer && timer.startTime) {
      const startTime = new Date(timer.startTime);
      const seconds = differenceInSeconds(currentTime, startTime);
      setElapsedTime(seconds);
    }
  }, [timer, currentTime]);
  
  const formatElapsedTime = () => {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 3,
        background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
        color: 'white'
      }}
    >
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TimerIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Temporizador Activo
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {project ? project.name : 'Proyecto desconocido'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {timer.description || 'Sin descripción'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
              {formatElapsedTime()}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              <Chip
                label={timer.billable ? 'Facturable' : 'No facturable'}
                size="small"
                color={timer.billable ? 'secondary' : 'default'}
                sx={{ mr: 1, color: 'white', bgcolor: timer.billable ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
              />
              <Typography variant="caption">
                Iniciado: {format(new Date(timer.startTime), 'HH:mm')}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={onStop}
              sx={{ mt: 2 }}
            >
              Detener
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ActiveTimer;