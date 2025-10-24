import React, { useMemo, useState } from 'react';
import { Box, Grid, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const countLetters = (text) => {
  const frequency = {};
  text
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .split('')
    .forEach((char) => {
      frequency[char] = (frequency[char] || 0) + 1;
    });
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
};

const countWords = (text) => {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const frequency = {};
  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  const totalLength = words.reduce((sum, word) => sum + word.length, 0);
  return {
    words,
    common: Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    averageLength: words.length ? (totalLength / words.length).toFixed(2) : '0'
  };
};

const TextAnalyzer = () => {
  const { t } = useTranslation();
  const [text, setText] = useState('normal.ro brings quick tools for writers and developers.');

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        letters: [],
        words: [],
        common: [],
        averageLength: '0'
      };
    }
    const letterStats = countLetters(trimmed);
    const { words, common, averageLength } = countWords(trimmed);
    return {
      letters: letterStats,
      words,
      common,
      averageLength
    };
  }, [text]);

  return (
    <ToolLayout title={t('tools.textAnalyzer.heading')} description={t('tools.textAnalyzer.instructions')} seoSlug="text-analyzer">
      <Stack spacing={3}>
        <TextField
          label={t('tools.textAnalyzer.fields.input')}
          value={text}
          onChange={(event) => setText(event.target.value)}
          multiline
          minRows={6}
        />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('tools.textAnalyzer.sections.letters')}
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', pl: 0 }}>
              {stats.letters.map(([letter, count]) => (
                <li key={letter}>
                  {letter.toUpperCase()}: {count}
                </li>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('tools.textAnalyzer.sections.commonWords')}
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', pl: 0 }}>
              {stats.common.map(([word, count]) => (
                <li key={word}>
                  {word}: {count}
                </li>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('tools.textAnalyzer.sections.summary')}
            </Typography>
            <Typography variant="body1">
              {t('tools.textAnalyzer.summary.wordCount', { count: stats.words.length })}
            </Typography>
            <Typography variant="body1">
              {t('tools.textAnalyzer.summary.averageLength', { value: stats.averageLength })}
            </Typography>
          </Grid>
        </Grid>
      </Stack>
    </ToolLayout>
  );
};

export default TextAnalyzer;
