import React from 'react';
import { Box, Container, Typography, Stack, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 4,
        bgcolor: 'grey.100',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={2}>
          {/* Links */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 1, sm: 3 }}
            justifyContent="center"
            alignItems="center"
          >
            <Link
              component={RouterLink}
              to="/privacy-policy"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: '0.875rem' }}
            >
              Politica de Confidențialitate
            </Link>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>•</Box>
            <Link
              component={RouterLink}
              to="/terms-of-service"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: '0.875rem' }}
            >
              Termeni și Condiții
            </Link>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>•</Box>
            <Link
              href="mailto:contact@normal.ro"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: '0.875rem' }}
            >
              Contact
            </Link>
          </Stack>

          {/* Company Info */}
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 Pravalia SRL. Toate drepturile rezervate.
          </Typography>
          <Typography variant="caption" color="text.disabled" align="center">
            CUI: 37024165 | Reg Com: J32/124/2017 | Str. Siretului, Nr. 20, Sibiu, România
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;

