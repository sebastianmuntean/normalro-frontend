import React from 'react';
import { Box, Typography } from '@mui/material';

const SeoFooter = ({ title, description, keywords }) => (
  <Box
    sx={{
      mt: 6,
      pt: 4,
      borderTop: '1px solid',
      borderColor: 'divider',
      opacity: 0.7
    }}
  >
    {title && (
      <Typography
        variant="h6"
        component="h2"
        sx={{
          fontSize: '1rem',
          fontWeight: 500,
          mb: 1.5,
          color: 'text.secondary'
        }}
      >
        {title}
      </Typography>
    )}
    {description && (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          lineHeight: 1.7,
          mb: keywords ? 2 : 0
        }}
      >
        {description}
      </Typography>
    )}
    {keywords && keywords.length > 0 && (
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ fontStyle: 'italic' }}
        >
          Cuvinte cheie: {keywords.join(', ')}
        </Typography>
      </Box>
    )}
  </Box>
);

export default SeoFooter;

