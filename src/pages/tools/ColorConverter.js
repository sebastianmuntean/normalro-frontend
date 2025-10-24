import React, { useState } from 'react';
import { Alert, Box, Grid, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const hexRegex = /^#?([0-9a-fA-F]{6})$/;
const rgbRegex = /^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;
const hslRegex = /^hsl\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const rgbToHex = (r, g, b) => `#${[r, g, b].map((val) => val.toString(16).padStart(2, '0')).join('')}`;

const hslToRgb = (h, s, l) => {
  const hue = (h % 360) / 360;
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;

  if (sat === 0) {
    const grey = Math.round(light * 255);
    return [grey, grey, grey];
  }

  const hueToRgb = (p, q, t) => {
    let temp = t;
    if (temp < 0) temp += 1;
    if (temp > 1) temp -= 1;
    if (temp < 1 / 6) return p + (q - p) * 6 * temp;
    if (temp < 1 / 2) return q;
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
    return p;
  };

  const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
  const p = 2 * light - q;

  const r = Math.round(hueToRgb(p, q, hue + 1 / 3) * 255);
  const g = Math.round(hueToRgb(p, q, hue) * 255);
  const b = Math.round(hueToRgb(p, q, hue - 1 / 3) * 255);
  return [r, g, b];
};

const rgbToHsl = (r, g, b) => {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  let h;
  let s;
  const l = (max + min) / 2;

  if (max === min) {
    h = 0;
    s = 0;
  } else {
    const diff = max - min;
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    switch (max) {
      case nr:
        h = (ng - nb) / diff + (ng < nb ? 6 : 0);
        break;
      case ng:
        h = (nb - nr) / diff + 2;
        break;
      default:
        h = (nr - ng) / diff + 4;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

const ColorConverter = () => {
  const { t } = useTranslation();
  const [hex, setHex] = useState('#3366ff');
  const [rgb, setRgb] = useState('rgb(51, 102, 255)');
  const [hsl, setHsl] = useState('hsl(220, 100%, 60%)');
  const [error, setError] = useState('');

  const updateFromRgb = (r, g, b) => {
    const [h, s, l] = rgbToHsl(r, g, b);
    setHex(rgbToHex(r, g, b));
    setRgb(`rgb(${r}, ${g}, ${b})`);
    setHsl(`hsl(${h}, ${s}%, ${l}%)`);
  };

  const handleHexChange = (value) => {
    setHex(value);
    const match = value.match(hexRegex);
    if (!match) {
      setError(t('tools.colorConverter.messages.invalidHex'));
      return;
    }
    const hexValue = match[1];
    const r = parseInt(hexValue.substring(0, 2), 16);
    const g = parseInt(hexValue.substring(2, 4), 16);
    const b = parseInt(hexValue.substring(4, 6), 16);
    updateFromRgb(r, g, b);
    setError('');
  };

  const handleRgbChange = (value) => {
    setRgb(value);
    const match = value.match(rgbRegex);
    if (!match) {
      setError(t('tools.colorConverter.messages.invalidRgb'));
      return;
    }
    const r = clamp(Number(match[1]), 0, 255);
    const g = clamp(Number(match[2]), 0, 255);
    const b = clamp(Number(match[3]), 0, 255);
    updateFromRgb(r, g, b);
    setError('');
  };

  const handleHslChange = (value) => {
    setHsl(value);
    const match = value.match(hslRegex);
    if (!match) {
      setError(t('tools.colorConverter.messages.invalidHsl'));
      return;
    }
    const h = Number(match[1]);
    const s = Number(match[2]);
    const l = Number(match[3]);
    const [r, g, b] = hslToRgb(h, s, l);
    updateFromRgb(r, g, b);
    setError('');
  };

  return (
    <ToolLayout title={t('tools.colorConverter.heading')} description={t('tools.colorConverter.instructions')}>
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <TextField label={t('tools.colorConverter.fields.hex')} value={hex} onChange={(event) => handleHexChange(event.target.value)} />
            <TextField label={t('tools.colorConverter.fields.rgb')} value={rgb} onChange={(event) => handleRgbChange(event.target.value)} />
            <TextField label={t('tools.colorConverter.fields.hsl')} value={hsl} onChange={(event) => handleHslChange(event.target.value)} />
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={2} alignItems="center" sx={{ height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              {t('tools.colorConverter.preview.label')}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Box sx={{ width: 120, height: 120, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)', background: hex }} />
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </ToolLayout>
  );
};

export default ColorConverter;
