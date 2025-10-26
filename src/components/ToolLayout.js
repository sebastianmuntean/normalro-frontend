import React from 'react';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import SeoFooter from './SeoFooter';
import AdSenseAd from './AdSenseAd';
import { getSeoContent } from '../data/seoContent';
import useDocumentTitle from '../hooks/useDocumentTitle';

const ToolLayout = ({ title, description, maxWidth = 'md', seoSlug, showAd = true, children }) => {
  const seoData = seoSlug ? getSeoContent(seoSlug) : null;
  
  // Set document title and meta description for SEO
  useDocumentTitle(title, description);

  return (
    <Container maxWidth={maxWidth} sx={{ py: { xs: 6, md: 10 } }}>
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)'
        }}
      >
        <Stack spacing={3}>
          {(title || description) && (
            <Box>
              {title && (
                <Typography variant="h3" component="h1" sx={{ fontWeight: 600 }} gutterBottom>
                  {title}
                </Typography>
              )}
              {description && (
                <Typography variant="body1" color="text.secondary">
                  {description}
                </Typography>
              )}
            </Box>
          )}
          {children}
          {showAd && (
            <AdSenseAd />
          )}
          {seoData && (
            <SeoFooter
              title={seoData.title}
              description={seoData.description}
              keywords={seoData.keywords}
            />
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default ToolLayout;
