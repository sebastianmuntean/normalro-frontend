import React, { useMemo, useState } from 'react';
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'react-i18next';
import ToolLayout from '../../components/ToolLayout';

const CodeMinifier = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState('css');
  const [source, setSource] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const processors = useMemo(
    () => ({
      css: (input) =>
        input
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\s*([{};:,>])\s+/g, '$1')
          .replace(/\s+/g, ' ')
          .replace(/;}/g, '}')
          .trim(),
      js: (input) =>
        input
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/(^|[^:])\/\/.*$/gm, '$1')
          .replace(/\s+/g, ' ')
          .replace(/\s*([{}();,:+\-*/<>=])\s*/g, '$1')
          .trim()
    }),
    []
  );

  const handleMinify = (event) => {
    event.preventDefault();
    if (!source.trim()) {
      setError(t('tools.codeMinifier.messages.empty'));
      setResult('');
      return;
    }

    try {
      const processed = processors[mode](source);
      setResult(processed);
      setError('');
      setCopied(false);
    } catch (err) {
      setError(t('common.genericError'));
      setResult('');
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      setError(t('common.genericError'));
    }
  };

  return (
    <ToolLayout
      title={t('tools.codeMinifier.heading')}
      description={t('tools.codeMinifier.instructions')}
      seoSlug="code-minifier"
    >
      <Stack spacing={3} component="form" onSubmit={handleMinify}>
        <ToggleButtonGroup value={mode} exclusive onChange={(_, next) => next && setMode(next)}>
            <ToggleButton value="css">{t('tools.codeMinifier.mode.css')}</ToggleButton>
            <ToggleButton value="js">{t('tools.codeMinifier.mode.js')}</ToggleButton>
          </ToggleButtonGroup>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            multiline
            minRows={8}
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder={t('tools.codeMinifier.placeholder')}
            fullWidth
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button type="submit" variant="contained">
              {t('tools.codeMinifier.actions.minify')}
            </Button>
            <Button
              type="button"
              variant="text"
              onClick={() => {
                setSource('');
                setResult('');
                setError('');
                setCopied(false);
              }}
            >
              {t('tools.codeMinifier.actions.reset')}
            </Button>
          </Stack>

          {result && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('tools.codeMinifier.result.label')}
                </Typography>
                <IconButton color={copied ? 'success' : 'primary'} onClick={handleCopy}>
                  {copied ? <CheckIcon /> : <ContentCopyIcon />}
                </IconButton>
              </Stack>
              <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace' }}>
                {result}
              </Box>
            </Paper>
          )}
      </Stack>
    </ToolLayout>
  );
};

export default CodeMinifier;
