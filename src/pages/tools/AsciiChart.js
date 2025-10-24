import React, { useMemo, useState } from 'react';
import { Alert, Box, Stack, TextField } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const AsciiChart = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState('5,9,3,6');
  const { chart, error } = useMemo(() => {
    const parsed = input
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => !Number.isNaN(value));
    if (input.trim() && parsed.length === 0) {
      return { chart: '', error: t('tools.asciiChart.messages.invalid') };
    }
    const max = Math.max(...parsed, 0);
    const text = parsed
      .map((value, index) => {
        const barLength = max ? Math.round((value / max) * 20) : 0;
        const bar = '#'.repeat(barLength || 1);
        return `${index + 1}. ${bar} (${value})`;
      })
      .join('\n');
    return { chart: text, error: '' };
  }, [input, t]);

  return (
    <ToolLayout title={t('tools.asciiChart.heading')} description={t('tools.asciiChart.instructions')} seoSlug="ascii-chart">
      <Stack spacing={3}>
        <TextField
          label={t('tools.asciiChart.fields.values')}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          helperText={t('tools.asciiChart.helpers.example')}
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)' }}>
          {chart}
        </Box>
      </Stack>
    </ToolLayout>
  );
};

export default AsciiChart;
