import React, { useMemo, useState } from 'react';
import { Alert, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

const PalindromeChecker = () => {
  const { t } = useTranslation();
  const [text, setText] = useState('Never odd or even');
  const normalized = useMemo(() => normalize(text), [text]);
  const isPalindrome = normalized === normalized.split('').reverse().join('');

  return (
    <ToolLayout title={t('tools.palindromeChecker.heading')} description={t('tools.palindromeChecker.instructions')} maxWidth="sm">
      <Stack spacing={3}>
        <TextField label={t('tools.palindromeChecker.fields.input')} value={text} onChange={(event) => setText(event.target.value)} />
        {text.trim() === '' ? (
          <Alert severity="info">{t('tools.palindromeChecker.messages.empty')}</Alert>
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {isPalindrome
              ? t('tools.palindromeChecker.result.yes')
              : t('tools.palindromeChecker.result.no')}
          </Typography>
        )}
      </Stack>
    </ToolLayout>
  );
};

export default PalindromeChecker;
