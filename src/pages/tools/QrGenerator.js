import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';

const QrGenerator = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (!input.trim()) {
      setError(t('tools.qrGenerator.messages.empty'));
      setQrDataUrl('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const dataUrl = await QRCode.toDataURL(input, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 320
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      setError(t('common.genericError'));
      setQrDataUrl('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <Paper
        component="form"
        onSubmit={handleGenerate}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)'
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 600 }} gutterBottom>
              {t('tools.qrGenerator.heading')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('tools.qrGenerator.instructions')}
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label={t('tools.qrGenerator.fields.input')}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t('tools.qrGenerator.placeholder')}
            fullWidth
            multiline
            minRows={3}
          />

          <Button type="submit" variant="contained" disabled={loading}>
            {t('tools.qrGenerator.actions.generate')}
          </Button>

          {qrDataUrl && (
            <Stack spacing={2} alignItems="center">
              <Box
                component="img"
                src={qrDataUrl}
                alt={t('tools.qrGenerator.qrAlt')}
                sx={{ width: '100%', maxWidth: 320, borderRadius: 2, boxShadow: '0 8px 24px rgba(15,23,42,0.18)' }}
              />
              <Button
                type="button"
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = qrDataUrl;
                  link.download = 'qr-code.png';
                  link.click();
                }}
              >
                {t('tools.qrGenerator.actions.download')}
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default QrGenerator;
