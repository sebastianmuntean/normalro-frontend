import React, { useState } from 'react';
import {
  Alert,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import { generateSlug } from '../../services/api';
import ToolLayout from '../../components/ToolLayout';

const SlugGenerator = () => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setCopied(false);
    if (!text.trim()) {
      setError(t('tools.slugGenerator.messages.empty'));
      setResult('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await generateSlug(text);
      setResult(response.data.result);
    } catch (err) {
      setError(t('common.genericError'));
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setText('');
    setResult('');
    setError('');
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError(t('common.genericError'));
    }
  };

  return (
    <ToolLayout
      title={t('tools.slugGenerator.heading')}
      description={t('tools.slugGenerator.instructions')}
      seoSlug="slug-generator"
    >
      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}

          <TextField
            multiline
            minRows={3}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t('tools.slugGenerator.placeholder')}
            fullWidth
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button type="submit" variant="contained" disabled={loading}>
              {t('tools.slugGenerator.actions.generate')}
            </Button>
            <Button type="button" variant="outlined" onClick={handleReset}>
              {t('tools.slugGenerator.actions.reset')}
            </Button>
          </Stack>

          {result && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('tools.slugGenerator.result.label')}
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
                  {result}
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

export default SlugGenerator;
