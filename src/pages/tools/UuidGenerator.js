import React, { useState } from 'react';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const generateUuid = () => {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }
  const digits = [...crypto.getRandomValues(new Uint8Array(16))];
  digits[6] = (digits[6] & 0x0f) | 0x40;
  digits[8] = (digits[8] & 0x3f) | 0x80;
  const hex = digits.map((b) => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
};

const UuidGenerator = () => {
  const { t } = useTranslation();
  const [uuid, setUuid] = useState(generateUuid());
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setUuid(generateUuid());
    setCopied(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout title={t('tools.uuidGenerator.heading')} description={t('tools.uuidGenerator.instructions')} maxWidth="sm">
      <Stack spacing={3} alignItems="flex-start">
        <Button variant="contained" onClick={handleGenerate}>
          {t('tools.uuidGenerator.actions.generate')}
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)', px: 2, py: 1.5, width: '100%' }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {uuid}
          </Typography>
          <IconButton color={copied ? 'success' : 'primary'} onClick={handleCopy}>
            {copied ? <CheckIcon /> : <ContentCopyIcon />}
          </IconButton>
        </Box>
      </Stack>
    </ToolLayout>
  );
};

export default UuidGenerator;
