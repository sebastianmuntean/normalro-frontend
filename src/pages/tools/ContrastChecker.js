import React, { useMemo, useState } from 'react';
import { Alert, Box, Grid, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const hexToRgb = (hex) => {
  const match = hex.replace('#', '').match(/.{1,2}/g);
  if (!match) return null;
  const [r, g, b] = match.map((value) => parseInt(value, 16));
  return [r, g, b];
};

const luminance = (r, g, b) => {
  const channel = (value) => {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  const [rr, gg, bb] = [channel(r), channel(g), channel(b)];
  return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
};

const ratio = (hexA, hexB) => {
  const rgbA = hexToRgb(hexA);
  const rgbB = hexToRgb(hexB);
  if (!rgbA || !rgbB) return 1;
  const lumA = luminance(...rgbA);
  const lumB = luminance(...rgbB);
  const brighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (brighter + 0.05) / (darker + 0.05);
};

const rating = (contrast) => {
  if (contrast >= 7) return 'AAA';
  if (contrast >= 4.5) return 'AA';
  if (contrast >= 3) return 'AA Large';
  return 'Fail';
};

const ContrastChecker = () => {
  const { t } = useTranslation();
  const [foreground, setForeground] = useState('#111111');
  const [background, setBackground] = useState('#ffffff');
  const [error, setError] = useState('');

  const contrast = useMemo(() => {
    const valid = /^#([0-9a-f]{6})$/i;
    if (!valid.test(foreground) || !valid.test(background)) {
      setError(t('tools.contrastChecker.messages.invalid'));
      return 1;
    }
    setError('');
    return ratio(foreground, background);
  }, [foreground, background, t]);

  return (
    <ToolLayout title={t('tools.contrastChecker.heading')} description={t('tools.contrastChecker.instructions')}>
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <TextField label={t('tools.contrastChecker.fields.foreground')} value={foreground} onChange={(event) => setForeground(event.target.value)} />
            <TextField label={t('tools.contrastChecker.fields.background')} value={background} onChange={(event) => setBackground(event.target.value)} />
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={2} alignItems="center" sx={{ height: '100%' }}>
            <Box sx={{ width: '100%', minHeight: 160, borderRadius: 3, border: '1px solid rgba(0,0,0,0.12)', background: background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h5" sx={{ color: foreground, fontWeight: 600 }}>
                {t('tools.contrastChecker.previewText')}
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {contrast.toFixed(2)} : 1
            </Typography>
            <Typography color="text.secondary">{t('tools.contrastChecker.rating', { rating: rating(contrast) })}</Typography>
          </Stack>
        </Grid>
      </Grid>
    </ToolLayout>
  );
};

export default ContrastChecker;
