import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';
import ToolLayout from '../../components/ToolLayout';

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
    <ToolLayout
      title={t('tools.qrGenerator.heading')}
      description={t('tools.qrGenerator.instructions')}
      maxWidth="sm"
      seoSlug="qr-generator"
    >
      <Stack spacing={3} component="form" onSubmit={handleGenerate}>
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
    </ToolLayout>
  );
};

export default QrGenerator;
