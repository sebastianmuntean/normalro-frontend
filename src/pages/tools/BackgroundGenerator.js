import React, { useMemo, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const BackgroundGenerator = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState('solid');
  const [colorA, setColorA] = useState('#0ea5e9');
  const [colorB, setColorB] = useState('#9333ea');
  const [angle, setAngle] = useState(135);

  const backgroundValue = useMemo(() => {
    if (mode === 'solid') {
      return colorA;
    }
    if (mode === 'gradient') {
      return `linear-gradient(${angle}deg, ${colorA}, ${colorB})`;
    }
    return `radial-gradient(circle at center, ${colorA}, ${colorB})`;
  }, [mode, colorA, colorB, angle]);

  const cssSnippet = `background: ${backgroundValue};`;

  return (
    <ToolLayout title={t('tools.backgroundGenerator.heading')} description={t('tools.backgroundGenerator.instructions')}>
      <Stack spacing={3}>
        <FormControl sx={{ maxWidth: 240 }}>
          <InputLabel>{t('tools.backgroundGenerator.fields.mode')}</InputLabel>
          <Select value={mode} label={t('tools.backgroundGenerator.fields.mode')} onChange={(event) => setMode(event.target.value)}>
            <MenuItem value="solid">{t('tools.backgroundGenerator.modes.solid')}</MenuItem>
            <MenuItem value="gradient">{t('tools.backgroundGenerator.modes.linear')}</MenuItem>
            <MenuItem value="radial">{t('tools.backgroundGenerator.modes.radial')}</MenuItem>
          </Select>
        </FormControl>
        <TextField type="color" label={t('tools.backgroundGenerator.fields.colorA')} value={colorA} onChange={(event) => setColorA(event.target.value)} InputLabelProps={{ shrink: true }} />
        {mode !== 'solid' && (
          <TextField type="color" label={t('tools.backgroundGenerator.fields.colorB')} value={colorB} onChange={(event) => setColorB(event.target.value)} InputLabelProps={{ shrink: true }} />
        )}
        {mode === 'gradient' && (
          <TextField type="number" label={t('tools.backgroundGenerator.fields.angle')} value={angle} onChange={(event) => setAngle(Number(event.target.value))} />
        )}
        <Box sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.12)', height: 220, background: backgroundValue }} />
        <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)' }}>
          {cssSnippet}
        </Box>
      </Stack>
    </ToolLayout>
  );
};

export default BackgroundGenerator;
