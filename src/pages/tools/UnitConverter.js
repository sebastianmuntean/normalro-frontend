import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const buildUnit = (value, labelKey, factor) => ({ value, labelKey, factor });

const convertTemperature = (value, from, to) => {
  if (from === to) return value;
  let celsius;
  switch (from) {
    case 'fahrenheit':
      celsius = (value - 32) * (5 / 9);
      break;
    case 'kelvin':
      celsius = value - 273.15;
      break;
    default:
      celsius = value;
  }

  switch (to) {
    case 'fahrenheit':
      return celsius * (9 / 5) + 32;
    case 'kelvin':
      return celsius + 273.15;
    default:
      return celsius;
  }
};

const catalog = {
  length: {
    units: [
      buildUnit('meter', 'tools.unitConverter.units.meter', 1),
      buildUnit('centimeter', 'tools.unitConverter.units.centimeter', 0.01),
      buildUnit('kilometer', 'tools.unitConverter.units.kilometer', 1000),
      buildUnit('inch', 'tools.unitConverter.units.inch', 0.0254),
      buildUnit('foot', 'tools.unitConverter.units.foot', 0.3048),
      buildUnit('mile', 'tools.unitConverter.units.mile', 1609.344)
    ],
    convert: (value, from, to) => (value * from.factor) / to.factor
  },
  weight: {
    units: [
      buildUnit('kilogram', 'tools.unitConverter.units.kilogram', 1),
      buildUnit('gram', 'tools.unitConverter.units.gram', 0.001),
      buildUnit('pound', 'tools.unitConverter.units.pound', 0.45359237),
      buildUnit('ounce', 'tools.unitConverter.units.ounce', 0.0283495)
    ],
    convert: (value, from, to) => (value * from.factor) / to.factor
  },
  temperature: {
    units: [
      buildUnit('celsius', 'tools.unitConverter.units.celsius', 1),
      buildUnit('fahrenheit', 'tools.unitConverter.units.fahrenheit', 1),
      buildUnit('kelvin', 'tools.unitConverter.units.kelvin', 1)
    ],
    convert: convertTemperature
  }
};

const UnitConverter = () => {
  const { t } = useTranslation();
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('kilometer');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const availableUnits = useMemo(() => catalog[category].units, [category]);

  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setCategory(newCategory);
    const units = catalog[newCategory].units;
    setFromUnit(units[0].value);
    setToUnit(units[1]?.value || units[0].value);
    setResult('');
    setError('');
  };

  const convertValue = () => {
    if (!input.trim()) {
      setError(t('tools.unitConverter.messages.empty'));
      setResult('');
      return;
    }

    const numeric = Number(input);
    if (Number.isNaN(numeric)) {
      setError(t('tools.unitConverter.messages.invalidNumber'));
      setResult('');
      return;
    }

    const context = catalog[category];
    const from = context.units.find((unit) => unit.value === fromUnit);
    const to = context.units.find((unit) => unit.value === toUnit);

    if (!from || !to) {
      setError(t('common.genericError'));
      setResult('');
      return;
    }

    const converted = context.convert(numeric, from, to);
    setResult(converted);
    setError('');
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
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
              {t('tools.unitConverter.heading')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('tools.unitConverter.instructions')}
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <FormControl fullWidth>
            <InputLabel>{t('tools.unitConverter.fields.category')}</InputLabel>
            <Select value={category} label={t('tools.unitConverter.fields.category')} onChange={handleCategoryChange}>
              <MenuItem value="length">{t('tools.unitConverter.categories.length')}</MenuItem>
              <MenuItem value="weight">{t('tools.unitConverter.categories.weight')}</MenuItem>
              <MenuItem value="temperature">{t('tools.unitConverter.categories.temperature')}</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label={t('tools.unitConverter.fields.value')}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            fullWidth
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>{t('tools.unitConverter.fields.from')}</InputLabel>
              <Select value={fromUnit} label={t('tools.unitConverter.fields.from')} onChange={(event) => setFromUnit(event.target.value)}>
                {availableUnits.map((unit) => (
                  <MenuItem key={unit.value} value={unit.value}>
                    {t(unit.labelKey)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('tools.unitConverter.fields.to')}</InputLabel>
              <Select value={toUnit} label={t('tools.unitConverter.fields.to')} onChange={(event) => setToUnit(event.target.value)}>
                {availableUnits.map((unit) => (
                  <MenuItem key={unit.value} value={unit.value}>
                    {t(unit.labelKey)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Button variant="contained" onClick={convertValue}>
            {t('tools.unitConverter.actions.convert')}
          </Button>

          {result !== '' && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('tools.unitConverter.result.label')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {t('tools.unitConverter.result.formatted', { value: Number(result.toFixed(6)) })}
              </Typography>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default UnitConverter;
