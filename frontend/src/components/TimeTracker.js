import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Chip
} from '@mui/material';
import { PlayArrow, Stop, Pause } from '@mui/icons-material';

const TimeTracker = ({ isActive, startTime, projectName, description }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive && startTime) {
      // Calcular el tiempo transcurrido inicial
      const initialElapsed = Math.floor((new Date() - new Date(startTime)) / 1000);
      setElapsedTime(initialElapsed);

      // Iniciar el temporizador
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      // Detener el temporizador si no está activo
      clearInterval(timerRef.current);
    }

    // Limpiar el temporizador al desmontar
    return () => clearInterval(timerRef.current);
  }, [isActive, startTime]);

  // Formatear el tiempo transcurrido en formato HH:MM:SS
  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isActive && (
        <Chip 
          label="En curso" 
          color="primary" 
          size="small" 
          sx={{ 
            position: 'absolute', 
            top: 10, 
            right: 10,
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 0.7 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0.7 }
            }
          }} 
        />
      )}

      <Typography variant="h6" gutterBottom>
        Cronómetro
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 3 }}>
        <Box sx={{ 
          position: 'relative', 
          display: 'inline-flex',
          width: 150,
          height: 150
        }}>
          <CircularProgress 
            variant="determinate" 
            value={isActive ? 100 : 0}
            size={150}
            thickness={4}
            sx={{ 
              color: theme => isActive ? theme.palette.primary.main : theme.palette.grey[300],
              position: 'absolute'
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h4" component="div" fontFamily="monospace">
              {formatElapsedTime(elapsedTime)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {isActive && (
        <Box sx={{ mt: 2 }}>
          {projectName && (
            <Typography variant="body1" gutterBottom>
              <strong>Proyecto:</strong> {projectName}
            </Typography>
          )}
          
          {description && (
            <Typography variant="body1" gutterBottom>
              <strong>Tarea:</strong> {description}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default TimeTracker;