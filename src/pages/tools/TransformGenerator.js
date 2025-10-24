import React, { useMemo, useState } from 'react';
import { Box, Slider, Stack, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const TransformGenerator = () => {
  const { t } = useTranslation();
  const [rotate, setRotate] = useState(12);
  const [scale, setScale] = useState(1.05);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [skew, setSkew] = useState(0);

  const transformValue = useMemo(
    () => `transform: translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotate}deg) skew(${skew}deg);`,
    [rotate, scale, translateX, translateY, skew]
  );

  return (
    <ToolLayout title={t('tools.transformGenerator.heading')} description={t('tools.transformGenerator.instructions')}>
      <Stack spacing={3}>
        <Typography gutterBottom>{t('tools.transformGenerator.fields.rotate', { value: rotate })}</Typography>
        <Slider min={-180} max={180} value={rotate} onChange={(_, value) => setRotate(value)} />
        <Typography gutterBottom>{t('tools.transformGenerator.fields.scale', { value: scale })}</Typography>
        <Slider min={0.2} max={2} step={0.01} value={scale} onChange={(_, value) => setScale(value)} />
        <Typography gutterBottom>{t('tools.transformGenerator.fields.translateX', { value: translateX })}</Typography>
        <Slider min={-200} max={200} value={translateX} onChange={(_, value) => setTranslateX(value)} />
        <Typography gutterBottom>{t('tools.transformGenerator.fields.translateY', { value: translateY })}</Typography>
        <Slider min={-200} max={200} value={translateY} onChange={(_, value) => setTranslateY(value)} />
        <Typography gutterBottom>{t('tools.transformGenerator.fields.skew', { value: skew })}</Typography>
        <Slider min={-45} max={45} value={skew} onChange={(_, value) => setSkew(value)} />

        <Box sx={{ borderRadius: 3, border: '1px dashed rgba(0,0,0,0.12)', p: 4, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              width: 180,
              height: 180,
              background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
              borderRadius: '32px',
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotate}deg) skew(${skew}deg)`,
              transition: 'transform 0.2s ease'
            }}
          />
        </Box>
        <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)' }}>
          {transformValue}
        </Box>
      </Stack>
    </ToolLayout>
  );
};

export default TransformGenerator;
