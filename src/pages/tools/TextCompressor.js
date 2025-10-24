import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { deflate, inflate } from 'pako';
import ToolLayout from '../../components/ToolLayout';

const TextCompressor = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState('compress');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!input.trim()) {
      setError(t('tools.textCompressor.messages.empty'));
      setOutput('');
      return;
    }
    setError('');
    try {
      if (mode === 'compress') {
        const compressed = deflate(input, { to: 'string' });
        const base64 = btoa(compressed);
        setOutput(base64);
      } else {
        const binary = atob(input.trim());
        const decompressed = inflate(binary, { to: 'string' });
        setOutput(decompressed);
      }
    } catch (err) {
      setError(t('tools.textCompressor.messages.failed'));
      setOutput('');
    }
  };

  return (
    <ToolLayout
      title={t('tools.textCompressor.heading')}
      description={t('tools.textCompressor.instructions')}
      seoSlug="text-compressor"
    >
      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        <ToggleButtonGroup value={mode} exclusive onChange={(_, next) => next && setMode(next)}>
            <ToggleButton value="compress">{t('tools.textCompressor.mode.compress')}</ToggleButton>
            <ToggleButton value="decompress">{t('tools.textCompressor.mode.decompress')}</ToggleButton>
          </ToggleButtonGroup>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            multiline
            minRows={6}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t('tools.textCompressor.placeholder')}
            fullWidth
          />

          <Button type="submit" variant="contained">
            {mode === 'compress'
              ? t('tools.textCompressor.actions.compress')
              : t('tools.textCompressor.actions.decompress')}
          </Button>

          {output && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('tools.textCompressor.result.label')}
              </Typography>
              <Box
                component="textarea"
                value={output}
                readOnly
                sx={{ width: '100%', minHeight: 200, p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)', fontFamily: 'monospace' }}
              />
            </Stack>
          )}
      </Stack>
    </ToolLayout>
  );
};

export default TextCompressor;
