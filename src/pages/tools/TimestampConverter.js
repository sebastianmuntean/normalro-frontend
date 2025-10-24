import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { Grid, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const TimestampConverter = () => {
  const { t } = useTranslation();
  const [unix, setUnix] = useState(Math.floor(Date.now() / 1000));
  const [iso, setIso] = useState(new Date().toISOString());
  const [readable, setReadable] = useState(new Date().toLocaleString());

  const updateFromUnix = (value) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;
    const date = new Date(numeric * 1000);
    setUnix(numeric);
    setIso(date.toISOString());
    setReadable(date.toLocaleString());
  };

  const updateFromIso = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return;
    setIso(value);
    setUnix(Math.floor(date.getTime() / 1000));
    setReadable(date.toLocaleString());
  };

  const updateFromReadable = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return;
    setReadable(value);
    setIso(date.toISOString());
    setUnix(Math.floor(date.getTime() / 1000));
  };

  return (
    <ToolLayout title={t('tools.timestampConverter.heading')} description={t('tools.timestampConverter.instructions')} seoSlug="timestamp-converter">
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <TextField
              label={t('tools.timestampConverter.fields.unix')}
              value={unix}
              onChange={(event) => updateFromUnix(event.target.value)}
            />
            <TextField
              label={t('tools.timestampConverter.fields.iso')}
              value={iso}
              onChange={(event) => updateFromIso(event.target.value)}
            />
            <TextField
              label={t('tools.timestampConverter.fields.readable')}
              value={readable}
              onChange={(event) => updateFromReadable(event.target.value)}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} md={8}>
          <Box sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)', p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('tools.timestampConverter.result.label')}
            </Typography>
            <Typography variant="body1">{t('tools.timestampConverter.result.unix', { value: unix })}</Typography>
            <Typography variant="body1">{t('tools.timestampConverter.result.iso', { value: iso })}</Typography>
            <Typography variant="body1">{t('tools.timestampConverter.result.readable', { value: readable })}</Typography>
          </Box>
        </Grid>
      </Grid>
    </ToolLayout>
  );
};

export default TimestampConverter;
