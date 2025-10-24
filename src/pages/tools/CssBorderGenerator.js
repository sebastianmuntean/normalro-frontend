import React, { useMemo, useState } from 'react';
import { Box, Grid, Slider, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const CssBorderGenerator = () => {
  const { t } = useTranslation();
  const [width, setWidth] = useState(2);
  const [style, setStyle] = useState('solid');
  const [color, setColor] = useState('#2563eb');
  const [radius, setRadius] = useState(12);

  const css = useMemo(
    () => `border: ${width}px ${style} ${color};\nborder-radius: ${radius}px;`,
    [width, style, color, radius]
  );

  return (
    <ToolLayout title={t('tools.cssBorderGenerator.heading')} description={t('tools.cssBorderGenerator.instructions')} seoSlug="css-border-generator">
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Typography gutterBottom>{t('tools.cssBorderGenerator.fields.width', { value: width })}</Typography>
            <Slider min={0} max={20} value={width} onChange={(_, value) => setWidth(value)} />
            <TextField
              label={t('tools.cssBorderGenerator.fields.style')}
              value={style}
              onChange={(event) => setStyle(event.target.value)}
              helperText={t('tools.cssBorderGenerator.helpers.style')}
            />
            <TextField
              label={t('tools.cssBorderGenerator.fields.color')}
              value={color}
              onChange={(event) => setColor(event.target.value)}
            />
            <Typography gutterBottom>{t('tools.cssBorderGenerator.fields.radius', { value: radius })}</Typography>
            <Slider min={0} max={100} value={radius} onChange={(_, value) => setRadius(value)} />
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Box sx={{ width: '100%', minHeight: 160, borderRadius: radius, border: `${width}px ${style} ${color}`, background: '#f8fafc' }} />
            <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)' }}>
              {css}
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </ToolLayout>
  );
};

export default CssBorderGenerator;
