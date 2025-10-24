import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
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
              {t('tools.slugGenerator.heading')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('tools.slugGenerator.instructions')}
            </Typography>
          </Box>

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
      </Paper>
    </Container>
  );
};

export default SlugGenerator;
