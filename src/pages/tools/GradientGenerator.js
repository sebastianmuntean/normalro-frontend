import React, { useMemo, useState } from 'react';
import { Box, Button, IconButton, Stack, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const GradientGenerator = () => {
  const { t } = useTranslation();
  const [angle, setAngle] = useState(135);
  const [type, setType] = useState('linear');
  const [colors, setColors] = useState(['#ff6b6b', '#7950f2']);

  const gradientValue = useMemo(() => {
    const stops = colors.join(', ');
    return type === 'linear'
      ? `linear-gradient(${angle}deg, ${stops})`
      : `radial-gradient(circle, ${stops})`;
  }, [angle, colors, type]);

  const cssSnippet = useMemo(() => `background: ${gradientValue};`, [gradientValue]);

  const updateColor = (index, value) => {
    setColors((prev) => prev.map((color, i) => (i === index ? value : color)));
  };

  const addColor = () => {
    setColors((prev) => [...prev, '#ffffff']);
  };

  const removeColor = (index) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ToolLayout title={t('tools.gradientGenerator.heading')} description={t('tools.gradientGenerator.instructions')}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            type="number"
            label={t('tools.gradientGenerator.fields.angle')}
            value={angle}
            onChange={(event) => setAngle(Number(event.target.value))}
            disabled={type === 'radial'}
            helperText={type === 'radial' ? t('tools.gradientGenerator.helpers.angleDisabled') : ''}
          />
          <TextField
            select
            label={t('tools.gradientGenerator.fields.type')}
            SelectProps={{ native: true }}
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="linear">{t('tools.gradientGenerator.types.linear')}</option>
            <option value="radial">{t('tools.gradientGenerator.types.radial')}</option>
          </TextField>
        </Stack>

        <Stack spacing={2}>
          {colors.map((color, index) => (
            <Stack direction="row" spacing={2} alignItems="center" key={`${color}-${index}`}>
              <TextField
                type="color"
                label={t('tools.gradientGenerator.fields.color', { index: index + 1 })}
                value={color}
                onChange={(event) => updateColor(index, event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              {colors.length > 2 && (
                <IconButton onClick={() => removeColor(index)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Stack>
          ))}
          <Button startIcon={<AddIcon />} onClick={addColor}>
            {t('tools.gradientGenerator.actions.addStop')}
          </Button>
        </Stack>

        <Box sx={{ width: '100%', minHeight: 220, borderRadius: 3, border: '1px solid rgba(0,0,0,0.12)', background: gradientValue }} />

        <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)' }}>
          {cssSnippet}
        </Box>
      </Stack>
    </ToolLayout>
  );
};

export default GradientGenerator;
