import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { deflate, inflate } from 'pako';

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
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)'
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 600 }} gutterBottom>
              {t('tools.textCompressor.heading')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('tools.textCompressor.instructions')}
            </Typography>
          </Box>

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
      </Paper>
    </Container>
  );
};

export default TextCompressor;
