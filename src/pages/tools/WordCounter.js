import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ToolLayout from '../../components/ToolLayout';
const metricsOrder = ['words', 'characters', 'sentences', 'paragraphs', 'estimatedReadingMinutes'];

const WordCounter = () => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const computeMetrics = (value) => {
    const trimmed = value.trim();
    const wordsArray = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const sentencesArray = trimmed ? trimmed.split(/[.!?]+/).filter((segment) => segment.trim()) : [];
    const paragraphsArray = trimmed
      ? trimmed
          .split(/\n{2,}|\r?\n\s*\r?\n/)
          .map((segment) => segment.trim())
          .filter(Boolean)
      : [];

    const totalCharacters = value.length;
    const totalWords = wordsArray.length;
    const totalSentences = sentencesArray.length;
    const totalParagraphs = paragraphsArray.length || (trimmed ? 1 : 0);
    const estimatedReadingMinutes = totalWords ? Math.max(1, Math.round(totalWords / 200)) : 0;

    return {
      words: totalWords,
      characters: totalCharacters,
      sentences: totalSentences,
      paragraphs: totalParagraphs,
      estimatedReadingMinutes
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!text.trim()) {
      setError(t('tools.wordCounter.messages.empty'));
      setMetrics(null);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = computeMetrics(text);
      setMetrics(result);
    } catch (err) {
      setMetrics(null);
      setError(t('common.genericError'));
    }
    setLoading(false);
  };

  const handleReset = () => {
    setText('');
    setMetrics(null);
    setError('');
  };

  return (
    <ToolLayout
      title={t('tools.wordCounter.heading')}
      description={t('tools.wordCounter.instructions')}
      seoSlug="word-counter"
    >
      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}

          <TextField
            multiline
            minRows={8}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t('tools.wordCounter.placeholder')}
            fullWidth
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button type="submit" variant="contained" disabled={loading}>
              {t('tools.wordCounter.actions.analyze')}
            </Button>
            <Button type="button" variant="outlined" onClick={handleReset}>
              {t('tools.wordCounter.actions.reset')}
            </Button>
          </Stack>

          {metrics && (
            <Paper variant="outlined" sx={{ borderRadius: 3 }}>
              <Grid container>
                {metricsOrder.map((key, index) => {
                  const isLast = index === metricsOrder.length - 1;
                  const isOddColumn = index % 2 === 1;
                  const isLastRow = index >= metricsOrder.length - 2;
                  return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                      key={key}
                      sx={{
                        borderBottom: {
                          xs: isLast ? 'none' : '1px solid rgba(0,0,0,0.06)',
                          sm: isLastRow ? 'none' : '1px solid rgba(0,0,0,0.06)'
                        },
                        borderRight: {
                          sm: isOddColumn || isLast ? 'none' : '1px solid rgba(0,0,0,0.06)'
                        }
                      }}
                    >
                      <Box sx={{ p: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          {t(`tools.wordCounter.metrics.${key}`)}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {metrics[key] ?? 0}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          )}
      </Stack>
    </ToolLayout>
  );
};

export default WordCounter;
