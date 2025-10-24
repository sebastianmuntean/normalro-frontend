import React from 'react';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import SeoFooter from './SeoFooter';
import { getSeoContent } from '../data/seoContent';

const ToolLayout = ({ title, description, maxWidth = 'md', seoSlug, children }) => {
  const seoData = seoSlug ? getSeoContent(seoSlug) : null;

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
