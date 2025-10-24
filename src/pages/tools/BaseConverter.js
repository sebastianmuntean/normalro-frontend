import React, { useMemo, useState } from 'react';
import { Alert, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const bases = [2, 8, 10, 16];

const BaseConverter = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState('255');
  const [fromBase, setFromBase] = useState(10);
  const baseValues = useMemo(() => {
    const decimal = parseInt(input, fromBase);
    if (Number.isNaN(decimal)) {
      return null;
    }
    return bases.reduce((acc, base) => ({ ...acc, [base]: decimal.toString(base) }), {});
  }, [input, fromBase]);
  const error = baseValues ? '' : t('tools.baseConverter.messages.invalid');

  return (
    <ToolLayout title={t('tools.baseConverter.heading')} description={t('tools.baseConverter.instructions')}>
      <Stack spacing={3}>
        <FormControl>
          <InputLabel>{t('tools.baseConverter.fields.from')}</InputLabel>
          <Select value={fromBase} label={t('tools.baseConverter.fields.from')} onChange={(event) => setFromBase(Number(event.target.value))}>
            {bases.map((base) => (
              <MenuItem key={base} value={base}>
                {t('tools.baseConverter.baseLabel', { base })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField label={t('tools.baseConverter.fields.value')} value={input} onChange={(event) => setInput(event.target.value)} />
        {error && <Alert severity="error">{error}</Alert>}
        {baseValues && (
          <Stack spacing={1}>
            {bases.map((base) => (
              <Typography key={base} variant="body1">
                {t('tools.baseConverter.resultLabel', { base })}: <strong>{baseValues[base]}</strong>
              </Typography>
            ))}
          </Stack>
        )}
      </Stack>
    </ToolLayout>
  );
};

export default BaseConverter;
