import React, { useEffect } from 'react';
import { Box } from '@mui/material';

const AdSenseAd = ({ 
  adSlot = '6421076333',
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = {}
}) => {
  useEffect(() => {
    try {
      // Inițializează AdSense ad
      if (window.adsbygoogle && process.env.NODE_ENV === 'production') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // Nu afișa reclame în development
  if (process.env.NODE_ENV !== 'production') {
    return (
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: 'grey.200', 
          borderRadius: 1, 
          textAlign: 'center',
          border: '2px dashed',
          borderColor: 'grey.400',
          ...style
        }}
      >
        <span style={{ color: '#666', fontSize: '12px' }}>
          📢 AdSense Ad (doar în producție)
        </span>
      </Box>
    );
  }

  return (
    <Box sx={{ my: 3, textAlign: 'center', ...style }}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5893681443097325"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </Box>
  );
};

export default AdSenseAd;

