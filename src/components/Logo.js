import React from 'react';
import { Box } from '@mui/material';
import logoImage from '../assets/bricks.png';

const Logo = ({ size = 40 }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box component="img" src={logoImage} alt="normal.ro bricks logo" sx={{ height: size, width: 'auto' }} />
    </Box>
  );
};

export default Logo;