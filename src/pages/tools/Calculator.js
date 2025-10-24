import React, { useState } from 'react';
import { Box, Button, Container, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const keys = [
  ['7', '8', '9', '/'],
  ['4', '5', '6', '*'],
  ['1', '2', '3', '-'],
  ['0', '.', '=', '+']
];

const isValidExpression = (expression) => /^[0-9+\-*/.()\s]*$/.test(expression);

const evaluateExpression = (expression) => {
  if (!isValidExpression(expression)) {
    throw new Error('invalid');
  }
  // eslint-disable-next-line no-new-func
  const evaluator = new Function(`return (${expression})`);
  const result = evaluator();
  if (!Number.isFinite(result)) {
    throw new Error('invalid');
  }
  return result;
};

const Calculator = () => {
  const { t } = useTranslation();
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleInput = (value) => {
    setError('');
    if (value === '=') {
      try {
        const computed = evaluateExpression(expression || '0');
        setResult(String(computed));
      } catch (err) {
        setError(t('tools.calculator.messages.invalid'));
        setResult('');
      }
      return;
    }

    setExpression((prev) => prev + value);
  };

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 6, md: 10 } }}>
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)'
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 600 }} gutterBottom>
              {t('tools.calculator.heading')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('tools.calculator.instructions')}
            </Typography>
          </Box>

          <TextField
            label={t('tools.calculator.fields.expression')}
            value={expression}
            onChange={(event) => setExpression(event.target.value)}
            fullWidth
          />

          <Grid container spacing={1}>
            {keys.flat().map((key) => (
              <Grid item xs={3} key={key}>
                <Button
                  variant={key === '=' ? 'contained' : 'outlined'}
                  color={key === '=' ? 'primary' : 'inherit'}
                  onClick={() => handleInput(key)}
                  fullWidth
                >
                  {key}
                </Button>
              </Grid>
            ))}
          </Grid>

          <Stack direction="row" spacing={2}>
            <Button
              variant="text"
              onClick={() => {
                setExpression('');
                setResult('');
                setError('');
              }}
            >
              {t('tools.calculator.actions.clear')}
            </Button>
            <Button
              variant="text"
              onClick={() => {
                setExpression((prev) => prev.slice(0, -1));
              }}
            >
              {t('tools.calculator.actions.delete')}
            </Button>
          </Stack>

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          {result && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('tools.calculator.result.label')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {result}
              </Typography>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default Calculator;
