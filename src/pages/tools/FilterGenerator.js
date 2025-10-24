import React, { useMemo, useState } from 'react';
import { Box, Slider, Stack, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const FilterGenerator = () => {
  const { t } = useTranslation();
  const [blur, setBlur] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [hue, setHue] = useState(0);
  const [saturate, setSaturate] = useState(100);

  const filterValue = useMemo(
    () =>
      `filter: blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) hue-rotate(${hue}deg) saturate(${saturate}%);`,
    [blur, brightness, contrast, hue, saturate]
  );

  return (
    <ToolLayout title={t('tools.filterGenerator.heading')} description={t('tools.filterGenerator.instructions')}>
      <Stack spacing={3}>
        <Typography gutterBottom>{t('tools.filterGenerator.fields.blur', { value: blur })}</Typography>
        <Slider min={0} max={20} value={blur} onChange={(_, value) => setBlur(value)} />
        <Typography gutterBottom>{t('tools.filterGenerator.fields.brightness', { value: brightness })}</Typography>
        <Slider min={50} max={200} value={brightness} onChange={(_, value) => setBrightness(value)} />
        <Typography gutterBottom>{t('tools.filterGenerator.fields.contrast', { value: contrast })}</Typography>
        <Slider min={50} max={200} value={contrast} onChange={(_, value) => setContrast(value)} />
        <Typography gutterBottom>{t('tools.filterGenerator.fields.hue', { value: hue })}</Typography>
        <Slider min={0} max={360} value={hue} onChange={(_, value) => setHue(value)} />
        <Typography gutterBottom>{t('tools.filterGenerator.fields.saturate', { value: saturate })}</Typography>
        <Slider min={50} max={200} value={saturate} onChange={(_, value) => setSaturate(value)} />
        <Box sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.12)', overflow: 'hidden', height: 220 }}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
              filter: `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) hue-rotate(${hue}deg) saturate(${saturate}%)`
            }}
          />
        </Box>
        <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)' }}>
          {filterValue}
        </Box>
      </Stack>
    </ToolLayout>
  );
};

export default FilterGenerator;
