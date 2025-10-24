import React, { useMemo, useState } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const diceTypes = [4, 6, 8, 10, 12, 20];

const DiceSimulator = () => {
  const { t } = useTranslation();
  const [dice, setDice] = useState(1);
  const [sides, setSides] = useState(6);
  const [results, setResults] = useState([]);

  const total = useMemo(() => results.reduce((sum, value) => sum + value, 0), [results]);

  const roll = () => {
    const throws = Array.from({ length: dice }, () => Math.floor(Math.random() * sides) + 1);
    setResults(throws);
  };

  return (
    <ToolLayout title={t('tools.diceSimulator.heading')} description={t('tools.diceSimulator.instructions')} seoSlug="dice-simulator">
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            type="number"
            label={t('tools.diceSimulator.fields.dice')}
            value={dice}
            onChange={(event) => setDice(Math.max(1, Number(event.target.value) || 1))}
          />
          <FormControl>
            <InputLabel>{t('tools.diceSimulator.fields.sides')}</InputLabel>
            <Select value={sides} label={t('tools.diceSimulator.fields.sides')} onChange={(event) => setSides(Number(event.target.value))}>
              {diceTypes.map((value) => (
                <MenuItem key={value} value={value}>
                  d{value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={roll}>
            {t('tools.diceSimulator.actions.roll')}
          </Button>
        </Stack>
        {results.length > 0 && (
          <Box sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)', p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('tools.diceSimulator.result.label')}
            </Typography>
            <Typography variant="body1">{results.join(', ')}</Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              {t('tools.diceSimulator.result.total', { total })}
            </Typography>
          </Box>
        )}
      </Stack>
    </ToolLayout>
  );
};

export default DiceSimulator;
