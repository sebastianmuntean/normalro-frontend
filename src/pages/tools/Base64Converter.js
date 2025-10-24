import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import ToolLayout from '../../components/ToolLayout';
const Base64Converter = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleModeChange = (_, newMode) => {
    if (newMode) {
      setMode(newMode);
    }
  };

  const encodeBase64 = useMemo(
    () => (value) => {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(value);
      let binary = '';
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      return window.btoa(binary);
    },
    []
  );

  const decodeBase64 = useMemo(
    () => (value) => {
      const binary = window.atob(value);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    },
    []
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) {
      setError(t('tools.base64Converter.messages.empty'));
      return;
    }

    setLoading(true);
    setError('');
    setCopied(false);

    try {
      const processed = mode === 'encode' ? encodeBase64(input) : decodeBase64(input);
      setOutput(processed);
    } catch (err) {
      setError(t('tools.base64Converter.messages.invalid'));
      setOutput('');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setError('');
    setCopied(false);
  };

  const handleSwap = () => {
    setInput(output);
    setOutput('');
    setMode((prev) => (prev === 'encode' ? 'decode' : 'encode'));
    setError('');
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError(t('common.genericError'));
    }
  };

  return (
    <ToolLayout
      title={t('tools.base64Converter.heading')}
      description={t('tools.base64Converter.instructions')}
      seoSlug="base64-converter"
    >
      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            color="primary"
            sx={{ alignSelf: 'flex-start' }}
          >
            <ToggleButton value="encode">{t('tools.base64Converter.mode.encode')}</ToggleButton>
            <ToggleButton value="decode">{t('tools.base64Converter.mode.decode')}</ToggleButton>
          </ToggleButtonGroup>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            multiline
            minRows={6}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t('tools.base64Converter.placeholder')}
            fullWidth
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button type="submit" variant="contained" disabled={loading}>
              {t('tools.base64Converter.actions.convert')}
            </Button>
            <Button type="button" variant="outlined" onClick={handleSwap} disabled={!output}>
              {t('tools.base64Converter.actions.swap')}
            </Button>
            <Button type="button" variant="text" onClick={handleReset}>
              {t('tools.base64Converter.actions.reset')}
            </Button>
          </Stack>

          {output && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('tools.base64Converter.result.label')}
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                <Typography variant="body1" sx={{ wordBreak: 'break-all', pr: 2 }}>
                  {output}
                </Typography>
                <IconButton color={copied ? 'success' : 'primary'} onClick={handleCopy}>
                  {copied ? <CheckIcon /> : <ContentCopyIcon />}
                </IconButton>
              </Paper>
            </Stack>
          )}
      </Stack>
    </ToolLayout>
  );
};

export default Base64Converter;
