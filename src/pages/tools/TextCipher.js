import React, { useState } from 'react';
import { Box, Button, Slider, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const shiftChar = (char, offset) => {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(((code - 65 + offset + 26) % 26) + 65);
  }
  if (code >= 97 && code <= 122) {
    return String.fromCharCode(((code - 97 + offset + 26) % 26) + 97);
  }
  return char;
};

const processText = (text, offset) => text.split('').map((char) => shiftChar(char, offset)).join('');

const TextCipher = () => {
  const { t } = useTranslation();
  const [shift, setShift] = useState(3);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const encrypt = () => {
    setOutput(processText(input, shift));
  };

  const decrypt = () => {
    setOutput(processText(input, -shift));
  };

  return (
    <ToolLayout title={t('tools.textCipher.heading')} description={t('tools.textCipher.instructions')}>
      <Stack spacing={3}>
        <TextField
          label={t('tools.textCipher.fields.input')}
          multiline
          minRows={4}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <Box>
          <Typography gutterBottom>{t('tools.textCipher.fields.shift', { value: shift })}</Typography>
          <Slider min={1} max={25} value={shift} onChange={(_, value) => setShift(value)} />
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button variant="contained" onClick={encrypt}>
            {t('tools.textCipher.actions.encrypt')}
          </Button>
          <Button variant="outlined" onClick={decrypt}>
            {t('tools.textCipher.actions.decrypt')}
          </Button>
        </Stack>
        {output && (
          <Box component="textarea" value={output} readOnly sx={{ width: '100%', minHeight: 160, p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)', fontFamily: 'monospace' }} />
        )}
      </Stack>
    </ToolLayout>
  );
};

export default TextCipher;
