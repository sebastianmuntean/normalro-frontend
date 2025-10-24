import React, { useMemo, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const effects = {
  color: {
    base: 'background: #2563eb; color: #fff; transition: background 0.3s ease;\n',
    hover: '&:hover { background: #7c3aed; }'
  },
  scale: {
    base: 'transform: scale(1); transition: transform 0.3s ease;\n',
    hover: '&:hover { transform: scale(1.05); }'
  },
  rotate: {
    base: 'transform: rotate(0deg); transition: transform 0.4s ease;\n',
    hover: '&:hover { transform: rotate(3deg); }'
  },
  lift: {
    base: 'transform: translateY(0); box-shadow: 0 8px 16px rgba(15, 23, 42, 0.1); transition: all 0.3s ease;\n',
    hover: '&:hover { transform: translateY(-6px); box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18); }'
  }
};

const HoverEffectGenerator = () => {
  const { t } = useTranslation();
  const [effect, setEffect] = useState('color');

  const css = useMemo(() => `.hover-card {\n  ${effects[effect].base}${effects[effect].hover}\n}`, [effect]);

  const previewStyles = useMemo(() => {
    const base = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 2.5rem',
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: '#2563eb',
      color: '#fff',
      fontWeight: 600
    };
    switch (effect) {
      case 'scale':
        base.transform = 'scale(1)';
        base['&:hover'] = { transform: 'scale(1.05)' };
        break;
      case 'rotate':
        base.transform = 'rotate(0deg)';
        base['&:hover'] = { transform: 'rotate(3deg)' };
        break;
      case 'lift':
        base.transform = 'translateY(0)';
        base.boxShadow = '0 8px 16px rgba(15, 23, 42, 0.1)';
        base['&:hover'] = {
          transform: 'translateY(-6px)',
          boxShadow: '0 12px 24px rgba(15, 23, 42, 0.18)'
        };
        break;
      default:
        base['&:hover'] = { background: '#7c3aed' };
        break;
    }
    return base;
  }, [effect]);

  return (
    <ToolLayout title={t('tools.hoverEffectGenerator.heading')} description={t('tools.hoverEffectGenerator.instructions')} seoSlug="hover-effect-generator">
      <Stack spacing={3}>
        <FormControl sx={{ maxWidth: 240 }}>
          <InputLabel>{t('tools.hoverEffectGenerator.fields.effect')}</InputLabel>
          <Select value={effect} label={t('tools.hoverEffectGenerator.fields.effect')} onChange={(event) => setEffect(event.target.value)}>
            {Object.keys(effects).map((key) => (
              <MenuItem key={key} value={key}>
                {t(`tools.hoverEffectGenerator.effects.${key}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ borderRadius: 3, border: '1px dashed rgba(0,0,0,0.12)', p: 4, textAlign: 'center' }}>
          <Box className="hover-card" sx={previewStyles}>
            {t('tools.hoverEffectGenerator.preview.text')}
          </Box>
        </Box>
        <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)' }}>
          {css}
        </Box>
      </Stack>
    </ToolLayout>
  );
};

export default HoverEffectGenerator;
