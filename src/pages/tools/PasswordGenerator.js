import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  FormControlLabel,
  Paper,
  Slider,
  Stack,
  Switch,
  Typography,
  IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import { createPassword } from '../../services/api';

const PasswordGenerator = () => {
  const { t } = useTranslation();
  const [options, setOptions] = useState({
    length: 12,
    uppercase: true,
    numbers: true,
    symbols: false
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSwitchChange = (field) => (event) => {
    setOptions((prev) => ({ ...prev, [field]: event.target.checked }));
  };

  const handleLengthChange = (_, newValue) => {
    setOptions((prev) => ({ ...prev, length: newValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setCopied(false);

    try {
      const response = await createPassword(options);
      setPassword(response.data.password);
      setError('');
    } catch (err) {
      setPassword('');
      const errorCode = err?.response?.data?.error;
      if (errorCode === 'no_charset_selected') {
        setError(t('tools.passwordGenerator.messages.noCharset'));
      } else if (errorCode === 'invalid_length') {
        setError(t('tools.passwordGenerator.messages.invalidLength'));
      } else {
        setError(t('common.genericError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOptions({ length: 12, uppercase: true, numbers: true, symbols: false });
    setPassword('');
    setError('');
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
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
        <Stack spacing={4}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 600 }} gutterBottom>
              {t('tools.passwordGenerator.heading')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('tools.passwordGenerator.instructions')}
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {t('tools.passwordGenerator.length')}: {options.length}
            </Typography>
            <Slider
              value={options.length}
              onChange={handleLengthChange}
              valueLabelDisplay="auto"
              min={4}
              max={64}
            />
          </Box>

          <Stack spacing={1}>
            <FormControlLabel
              control={<Switch checked={options.uppercase} onChange={handleSwitchChange('uppercase')} />}
              label={t('tools.passwordGenerator.options.uppercase')}
            />
            <FormControlLabel
              control={<Switch checked={options.numbers} onChange={handleSwitchChange('numbers')} />}
              label={t('tools.passwordGenerator.options.numbers')}
            />
            <FormControlLabel
              control={<Switch checked={options.symbols} onChange={handleSwitchChange('symbols')} />}
              label={t('tools.passwordGenerator.options.symbols')}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button type="submit" variant="contained" disabled={loading}>
              {t('tools.passwordGenerator.actions.generate')}
            </Button>
            <Button type="button" variant="outlined" onClick={handleReset}>
              {t('tools.passwordGenerator.actions.reset')}
            </Button>
          </Stack>

          {password && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('tools.passwordGenerator.result.label')}
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
                  {password}
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

export default PasswordGenerator;
