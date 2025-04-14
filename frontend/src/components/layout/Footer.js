import React from 'react';
import { Box, Container, Typography, Link, Divider, Grid, IconButton } from '@mui/material';
import { Facebook, Twitter, LinkedIn, Instagram, GitHub } from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              FreelanceGest
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestiona tus proyectos freelance de manera eficiente con nuestra plataforma integral.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton aria-label="facebook" color="primary">
                <Facebook />
              </IconButton>
              <IconButton aria-label="twitter" color="primary">
                <Twitter />
              </IconButton>
              <IconButton aria-label="linkedin" color="primary">
                <LinkedIn />
              </IconButton>
              <IconButton aria-label="instagram" color="primary">
                <Instagram />
              </IconButton>
              <IconButton aria-label="github" color="primary">
                <GitHub />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Enlaces Rápidos
            </Typography>
            <Link href="/dashboard" color="inherit" display="block" sx={{ mb: 1 }}>
              Dashboard
            </Link>
            <Link href="/projects" color="inherit" display="block" sx={{ mb: 1 }}>
              Proyectos
            </Link>
            <Link href="/clients" color="inherit" display="block" sx={{ mb: 1 }}>
              Clientes
            </Link>
            <Link href="/invoices" color="inherit" display="block" sx={{ mb: 1 }}>
              Facturas
            </Link>
            <Link href="/time-tracking" color="inherit" display="block">
              Control de Tiempo
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Soporte
            </Typography>
            <Link href="/help" color="inherit" display="block" sx={{ mb: 1 }}>
              Centro de Ayuda
            </Link>
            <Link href="/faq" color="inherit" display="block" sx={{ mb: 1 }}>
              Preguntas Frecuentes
            </Link>
            <Link href="/contact" color="inherit" display="block" sx={{ mb: 1 }}>
              Contacto
            </Link>
            <Link href="/privacy" color="inherit" display="block" sx={{ mb: 1 }}>
              Política de Privacidad
            </Link>
            <Link href="/terms" color="inherit" display="block">
              Términos de Servicio
            </Link>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} FreelanceGest. Todos los derechos reservados.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Desarrollado con ❤️ para freelancers
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;