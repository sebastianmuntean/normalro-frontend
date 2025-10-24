import React, { useState } from 'react';
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const patterns = {
  email: {
    expression: '^[\\w-\\.+]+@([\\w-]+\\.)+[\\w-]{2,}$',
    descriptionKey: 'tools.regexGenerator.patterns.email'
  },
  phone: {
    expression: '^\\+?\\d{7,15}$',
    descriptionKey: 'tools.regexGenerator.patterns.phone'
  },
  url: {
    expression: '^(https?:\\/\\/)?([\\w.-]+)\\.([a-z.]{2,6})([\\/\\w .-]*)*\\/?$',
    descriptionKey: 'tools.regexGenerator.patterns.url'
  },
  postal: {
    expression: '^[0-9]{4,6}$',
    descriptionKey: 'tools.regexGenerator.patterns.postal'
  }
};

const RegexGenerator = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState('email');
  const [customRegex, setCustomRegex] = useState(patterns.email.expression);
  const [testText, setTestText] = useState('');
  const [error, setError] = useState('');
  const [matches, setMatches] = useState(null);

  const handlePatternChange = (value) => {
    setSelected(value);
    setCustomRegex(patterns[value].expression);
    setError('');
    setMatches(null);
  };

  const handleTest = () => {
    try {
      const regex = new RegExp(customRegex);
      setMatches(regex.test(testText));
      setError('');
    } catch (err) {
      setError(t('tools.regexGenerator.messages.invalidRegex'));
      setMatches(null);
    }
  };

  return (
    <ToolLayout title={t('tools.regexGenerator.heading')} description={t('tools.regexGenerator.instructions')}>
      <Stack spacing={3}>
        <FormControl fullWidth>
          <InputLabel>{t('tools.regexGenerator.fields.pattern')}</InputLabel>
          <Select value={selected} label={t('tools.regexGenerator.fields.pattern')} onChange={(event) => handlePatternChange(event.target.value)}>
            {Object.entries(patterns).map(([key, info]) => (
              <MenuItem key={key} value={key}>
                {t(info.descriptionKey)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label={t('tools.regexGenerator.fields.regex')}
          value={customRegex}
          onChange={(event) => setCustomRegex(event.target.value)}
          fullWidth
        />

        <TextField
          label={t('tools.regexGenerator.fields.test')}
          value={testText}
          onChange={(event) => setTestText(event.target.value)}
          fullWidth
        />

        <Button variant="contained" onClick={handleTest}>
          {t('tools.regexGenerator.actions.test')}
        </Button>

        {error && <Alert severity="error">{error}</Alert>}

        {matches !== null && (
          <Box sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)', p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('tools.regexGenerator.result.label')}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {matches ? t('tools.regexGenerator.result.match') : t('tools.regexGenerator.result.noMatch')}
            </Typography>
          </Box>
        )}
      </Stack>
    </ToolLayout>
  );
};

export default RegexGenerator;
