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
          py: { xs: 6, md: 8 },
          bgcolor: 'linear-gradient(135deg, rgba(25,118,210,0.08), rgba(255,255,255,1))'
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={2} alignItems="center" textAlign="center">
            <AutoAwesomeIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h2" component="h1" sx={{ fontWeight: 600, fontSize: { xs: '2rem', md: '2.5rem' } }}>
              {t('home.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={620} fontSize={{ xs: '0.95rem', md: '1.1rem' }}>
              {t('home.subtitle')}
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Featured Tool - Invoice Generator */}
      <Container sx={{ py: { xs: 4, md: 6 } }}>
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 30px 80px rgba(102, 126, 234, 0.4)'
            }
          }}
        >
          {/* Decorative background pattern */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.08,
              background: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.08) 35px, rgba(255,255,255,.08) 70px)',
              pointerEvents: 'none'
            }}
          />
          
          <Box sx={{ position: 'relative', p: { xs: 2, sm: 3, md: 4 } }}>
            <Grid container spacing={3} alignItems="center">
              {/* Left side - Icon, title and CTA */}
              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <ReceiptLongIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  
                  <Typography
                    variant="h4"
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                    }}
                  >
                    {t('tools.invoiceGenerator.featured.title')}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.95)',
                      fontWeight: 500,
                      fontSize: { xs: '0.9rem', sm: '0.95rem' }
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
                      mt: 1,
                      bgcolor: 'white',
                      color: '#667eea',
                      fontWeight: 600,
                      fontSize: '1rem',
                      py: 1.2,
                      px: 3,
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

              {/* Right side - Features grid (2 columns) */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={1.5}>
                  {Object.values(t('tools.invoiceGenerator.featured.features', { returnObjects: true })).map(
                    (feature, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            transition: 'all 0.2s ease',
                            minHeight: 70,
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.15)',
                              transform: 'translateX(4px)',
                              borderColor: 'rgba(255, 255, 255, 0.3)'
                            }
                          }}
                        >
                          <CheckCircleIcon
                            sx={{
                              fontSize: 20,
                              color: '#4ade80',
                              flexShrink: 0,
                              mt: 0.2
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'white',
                              fontSize: { xs: '0.85rem', sm: '0.9rem' },
                              lineHeight: 1.5
                            }}
                          >
                            {feature}
                          </Typography>
                        </Box>
                      </Grid>
                    )
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>

      {/* AdSense Horizontal Ad */}
      <Container>
        <AdSenseAd />
      </Container>

      <Container sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={1} mb={3} alignItems="center" textAlign="center">
          <BuildCircleIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h2" sx={{ fontWeight: 600, fontSize: { xs: '1.5rem', md: '2rem' } }}>
            {t('home.toolsTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" maxWidth={580} fontSize={{ xs: '0.9rem', md: '0.95rem' }}>
            {t('home.toolsSubtitle')}
          </Typography>
        </Stack>

        <Box
          sx={{
            position: 'relative',
            borderRadius: 4,
            p: { xs: 1.5, sm: 2 },
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 20px 35px rgba(15, 23, 42, 0.1)'
          }}
        >
          <Box
            sx={{
              columnCount: { xs: 1, sm: 2, md: 3, lg: 4 },
              columnGap: { xs: 2, sm: 2.5 }
            }}
          >
            {preparedTools.map((tool, index) => {
              const heightPalette = [180, 220, 160, 200, 190, 240];
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
                    mb: { xs: 2, sm: 2.5 },
                    borderRadius: 4,
                    overflow: 'hidden',
                    textDecoration: 'none',
                    position: 'relative',
                    height: heightPalette[index % heightPalette.length],
                    backgroundImage: `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`,
                    boxShadow: '0 16px 28px rgba(15, 23, 42, 0.1)',
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                    color: theme.palette.common.white,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 20px 35px rgba(15, 23, 42, 0.16)'
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
