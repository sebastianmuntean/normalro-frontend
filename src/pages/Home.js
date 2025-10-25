import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { alpha, useTheme } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdSenseAd from '../components/AdSenseAd';
import { tools as catalog } from '../data/tools';
import '../App.css';

const Home = () => {
  const { t } = useTranslation();
  const [tools] = useState(catalog);
  const theme = useTheme();

  const preparedTools = useMemo(
    () =>
      tools
        .filter((tool) => tool.slug !== 'invoice-generator') // Exclude featured tool
        .map((tool) => ({
          ...tool,
          route: tool.route || `/tools/${tool.slug}`
        })),
    [tools]
  );

  return (
    <Box>
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: 'linear-gradient(135deg, rgba(25,118,210,0.08), rgba(255,255,255,1))'
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <AutoAwesomeIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography variant="h2" component="h1" sx={{ fontWeight: 600 }}>
              {t('home.title')}
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth={640}>
              {t('home.subtitle')}
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Featured Tool - Invoice Generator */}
      <Container sx={{ py: { xs: 6, md: 8 } }}>
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 30px 80px rgba(102, 126, 234, 0.4)'
            }
          }}
        >
          {/* Decorative background pattern */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.1,
              background: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.08) 35px, rgba(255,255,255,.08) 70px)',
              pointerEvents: 'none'
            }}
          />
          
          <Box sx={{ position: 'relative', p: { xs: 3, sm: 4, md: 5 } }}>
            <Grid container spacing={4} alignItems="center">
              {/* Left side - Icon and title */}
              <Grid item xs={12} md={5}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <ReceiptLongIcon sx={{ fontSize: 48, color: 'white' }} />
                  </Box>
                  
                  <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }
                    }}
                  >
                    {t('tools.invoiceGenerator.featured.title')}
                  </Typography>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 400,
                      fontSize: { xs: '1rem', sm: '1.1rem' }
                    }}
                  >
                    {t('tools.invoiceGenerator.featured.subtitle')}
                  </Typography>

                  <Button
                    component={Link}
                    to="/tools/invoice-generator"
                    variant="contained"
                    size="large"
                    sx={{
                      mt: 2,
                      bgcolor: 'white',
                      color: '#667eea',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                      alignSelf: 'flex-start',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        transform: 'scale(1.05)',
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)'
                      }
                    }}
                  >
                    {t('tools.invoiceGenerator.featured.cta')}
                  </Button>
                </Stack>
              </Grid>

              {/* Right side - Features list */}
              <Grid item xs={12} md={7}>
                <Stack spacing={2}>
                  {Object.values(t('tools.invoiceGenerator.featured.features', { returnObjects: true })).map(
                    (feature, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 2,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.15)',
                            transform: 'translateX(8px)'
                          }
                        }}
                      >
                        <CheckCircleIcon
                          sx={{
                            fontSize: 24,
                            color: '#4ade80',
                            flexShrink: 0,
                            mt: 0.3
                          }}
                        />
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'white',
                            fontSize: { xs: '0.95rem', sm: '1rem' },
                            lineHeight: 1.6
                          }}
                        >
                          {feature}
                        </Typography>
                      </Box>
                    )
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>

      {/* AdSense Horizontal Ad */}
      <Container>
        <AdSenseAd />
      </Container>

      <Container sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={1} mb={4} alignItems="center" textAlign="center">
          <BuildCircleIcon color="primary" sx={{ fontSize: 36 }} />
          <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
            {t('home.toolsTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary" maxWidth={620}>
            {t('home.toolsSubtitle')}
          </Typography>
        </Stack>

        <Box
          sx={{
            position: 'relative',
            borderRadius: 5,
            p: { xs: 1.5, sm: 3 },
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 24px 40px rgba(15, 23, 42, 0.12)'
          }}
        >
          <Box
            sx={{
              columnCount: { xs: 1, sm: 2, md: 3, lg: 4 },
              columnGap: { xs: 2, sm: 3 }
            }}
          >
            {preparedTools.map((tool, index) => {
              const heightPalette = [220, 280, 200, 260, 240, 310];
              const gradientPalette = [
                ['#dfe7fd', '#f7f1ff'],
                ['#fde2e4', '#fff1d0'],
                ['#e2f0cb', '#f5f8d3'],
                ['#d0ebff', '#f1f5ff'],
                ['#f8edeb', '#ffe5ec'],
                ['#e3f2fd', '#ede7f6']
              ];
              const pair = gradientPalette[index % gradientPalette.length];

              return (
                <Paper
                  key={tool.slug}
                  component={Link}
                  to={tool.route}
                  elevation={0}
                  sx={{
                    display: 'inline-block',
                    width: '100%',
                    mb: { xs: 2, sm: 3 },
                    borderRadius: 5,
                    overflow: 'hidden',
                    textDecoration: 'none',
                    position: 'relative',
                    height: heightPalette[index % heightPalette.length],
                    backgroundImage: `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`,
                    boxShadow: '0 18px 32px rgba(15, 23, 42, 0.12)',
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                    color: theme.palette.common.white,
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 24px 40px rgba(15, 23, 42, 0.2)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2), transparent 55%), radial-gradient(circle at 80% 15%, rgba(255,255,255,0.18), transparent 60%)',
                      pointerEvents: 'none'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(to bottom, ${alpha('#000', 0)} 45%, ${alpha('#000', 0.45)})`,
                      pointerEvents: 'none'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 20,
                      left: 20,
                      right: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.4 }}>
                      {t(tool.titleKey)}
                    </Typography>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: alpha('#ffffff', 0.14),
                        border: `1px solid ${alpha('#ffffff', 0.24)}`
                      }}
                    />
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>
      </Container>

      {/* AdSense Bottom Ad */}
      <Container sx={{ pb: { xs: 4, md: 6 } }}>
        <AdSenseAd />
      </Container>
    </Box>
  );
};

export default Home;
