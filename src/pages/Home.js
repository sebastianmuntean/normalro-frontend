import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import { tools as catalog } from '../data/tools';
import '../App.css';

const Home = () => {
  const { t } = useTranslation();
  const [tools] = useState(catalog);
  const theme = useTheme();

  const preparedTools = useMemo(
    () =>
      tools.map((tool) => ({
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
    </Box>
  );
};

export default Home;
