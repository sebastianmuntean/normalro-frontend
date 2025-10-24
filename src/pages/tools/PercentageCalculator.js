import React, { useState } from 'react';
import { Alert, Box, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const modes = ['part-of', 'percentage-of', 'increase', 'decrease'];

const PercentageCalculator = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState('part-of');
  const [base, setBase] = useState('100');
  const [value, setValue] = useState('20');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const calculate = (selectedMode, baseInput, valueInput) => {
    const baseNumber = Number(baseInput);
    const valueNumber = Number(valueInput);
    if (Number.isNaN(baseNumber) || Number.isNaN(valueNumber)) {
      setError(t('tools.percentageCalculator.messages.invalidNumber'));
      setResult('');
      return;
    }
    setError('');
    let computed = 0;
    switch (selectedMode) {
      case 'part-of':
        computed = (baseNumber * valueNumber) / 100;
        setResult(t('tools.percentageCalculator.result.partOf', { percent: valueNumber, base: baseNumber, result: computed }));
        break;
      case 'percentage-of':
        computed = (baseNumber / valueNumber) * 100;
        setResult(t('tools.percentageCalculator.result.percentageOf', { value: baseNumber, base: valueNumber, result: computed }));
        break;
      case 'increase':
        computed = baseNumber + (baseNumber * valueNumber) / 100;
        setResult(t('tools.percentageCalculator.result.increase', { base: baseNumber, percent: valueNumber, result: computed }));
        break;
      case 'decrease':
        computed = baseNumber - (baseNumber * valueNumber) / 100;
        setResult(t('tools.percentageCalculator.result.decrease', { base: baseNumber, percent: valueNumber, result: computed }));
        break;
      default:
        break;
    }
  };

  const handleChange = (setter) => (event) => {
    setter(event.target.value);
    calculate(mode, mode === 'percentage-of' ? event.target.value : base, mode === 'percentage-of' ? value : event.target.value);
  };

  return (
    <ToolLayout title={t('tools.percentageCalculator.heading')} description={t('tools.percentageCalculator.instructions')}>
      <Stack spacing={3}>
        <FormControl>
          <InputLabel>{t('tools.percentageCalculator.fields.mode')}</InputLabel>
          <Select value={mode} label={t('tools.percentageCalculator.fields.mode')} onChange={(event) => { setMode(event.target.value); setResult(''); }}>
            {modes.map((item) => (
              <MenuItem key={item} value={item}>
                {t(`tools.percentageCalculator.modes.${item}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField label={t('tools.percentageCalculator.fields.base')} value={base} onChange={(event) => handleChange(setBase)(event)} />
        <TextField label={t('tools.percentageCalculator.fields.value')} value={value} onChange={(event) => handleChange(setValue)(event)} />
        <Box sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)', p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('tools.percentageCalculator.result.label')}
          </Typography>
          {error ? <Alert severity="error">{error}</Alert> : <Typography variant="h5">{result}</Typography>}
        </Box>
      </Stack>
    </ToolLayout>
  );
};

export default PercentageCalculator;
