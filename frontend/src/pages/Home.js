import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia 
} from '@mui/material';
import { 
  Assignment, 
  AccessTime, 
  Payment, 
  Chat 
} from '@mui/icons-material';

const Home = () => {
  const features = [
    {
      icon: <Assignment fontSize="large" color="primary" />,
      title: "Gestión de Proyectos",
      description: "Organiza tus proyectos freelance con un sistema de estados que te permite seguir todo el ciclo de vida."
    },
    {
      icon: <AccessTime fontSize="large" color="primary" />,
      title: "Seguimiento de Tiempo",
      description: "Registra el tiempo dedicado a cada proyecto para una facturación precisa y transparente."
    },
    {
      icon: <Payment fontSize="large" color="primary" />,
      title: "Facturación Simplificada",
      description: "Genera facturas automáticamente basadas en el tiempo registrado y las tarifas acordadas."
    },
    {
      icon: <Chat fontSize="large" color="primary" />,
      title: "Comunicación Directa",
      description: "Mantén todas las comunicaciones con tus clientes en un solo lugar, organizado por proyecto."
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 8 
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Plataforma de Gestión para Freelancers
              </Typography>
              <Typography variant="h5" paragraph>
                Gestiona tus proyectos, clientes y facturas en un solo lugar
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large" 
                  component={Link} 
                  to="/register" 
                  sx={{ mr: 2, mb: 2 }}
                >
                  Registrarse
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large" 
                  component={Link} 
                  to="/login"
                  sx={{ mb: 2 }}
                >
                  Iniciar Sesión
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img" 
                src="/hero-image.png" 
                alt="Freelance Platform" 
                sx={{ 
                  width: '100%', 
                  borderRadius: 2,
                  boxShadow: 3,
                  display: { xs: 'none', md: 'block' }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Características Principales
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h3">
                    {feature.title}
                  </Typography>
                  <Typography>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ bgcolor: 'secondary.light', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom>
            ¿Listo para optimizar tu trabajo freelance?
          </Typography>
          <Typography variant="h6" align="center" paragraph>
            Únete a nuestra plataforma y comienza a gestionar tus proyectos de manera eficiente.
          </Typography>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              component={Link} 
              to="/register"
            >
              Comenzar Ahora
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;