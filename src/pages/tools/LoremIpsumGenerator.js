import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Slider, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const baseText =
  'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum';

const createParagraph = (wordCount) => {
  const words = baseText.split(' ');
  const output = [];
  for (let i = 0; i < wordCount; i += 1) {
    output.push(words[i % words.length]);
  }
  const sentence = output.join(' ');
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
};

const LoremIpsumGenerator = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState('paragraphs');
  const [amount, setAmount] = useState(3);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const description = useMemo(() => t('tools.loremIpsum.instructions'), [t]);

  const generate = () => {
    if (amount <= 0) {
      setError(t('tools.loremIpsum.messages.invalidAmount'));
      setOutput('');
      return;
    }
    setError('');
    if (mode === 'words') {
      const words = baseText.split(' ');
      const result = [];
      for (let i = 0; i < amount; i += 1) {
        result.push(words[i % words.length]);
      }
      setOutput(result.join(' '));
    } else {
      const paragraphs = [];
      for (let i = 0; i < amount; i += 1) {
        paragraphs.push(createParagraph(80));
      }
      setOutput(paragraphs.join('\n\n'));
    }
  };

  return (
    <ToolLayout title={t('tools.loremIpsum.heading')} description={description}>
      {error && <Alert severity="error">{error}</Alert>}
      <Stack spacing={2} alignItems="flex-start">
        <ToggleButtonGroup value={mode} exclusive onChange={(_, next) => next && setMode(next)}>
          <ToggleButton value="paragraphs">{t('tools.loremIpsum.mode.paragraphs')}</ToggleButton>
          <ToggleButton value="words">{t('tools.loremIpsum.mode.words')}</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ width: '100%', maxWidth: 320 }}>
          <Typography gutterBottom>
            {mode === 'paragraphs'
              ? t('tools.loremIpsum.labels.paragraphs', { count: amount })
              : t('tools.loremIpsum.labels.words', { count: amount })}
          </Typography>
          <Slider
            min={1}
            max={mode === 'paragraphs' ? 10 : 500}
            value={amount}
            onChange={(_, value) => setAmount(value)}
          />
        </Box>
        <Button variant="contained" onClick={generate}>
          {t('tools.loremIpsum.actions.generate')}
        </Button>
        {output && (
          <Box
            component="textarea"
            value={output}
            readOnly
            sx={{ width: '100%', minHeight: 200, p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)', fontFamily: 'inherit' }}
          />
        )}
      </Stack>
    </ToolLayout>
  );
};

export default LoremIpsumGenerator;
