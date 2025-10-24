import React, { useMemo, useState } from 'react';
import { Box, Slider, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const CssShadowGenerator = () => {
  const { t } = useTranslation();
  const [offsetX, setOffsetX] = useState(10);
  const [offsetY, setOffsetY] = useState(20);
  const [blur, setBlur] = useState(30);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState('rgba(15,23,42,0.25)');

  const shadow = useMemo(
    () => `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`,
    [offsetX, offsetY, blur, spread, color]
  );

  const cssSnippet = `box-shadow: ${shadow};`;

  return (
    <ToolLayout title={t('tools.cssShadowGenerator.heading')} description={t('tools.cssShadowGenerator.instructions')}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography gutterBottom>{t('tools.cssShadowGenerator.fields.offsetX', { value: offsetX })}</Typography>
            <Slider min={-100} max={100} value={offsetX} onChange={(_, value) => setOffsetX(value)} />
            <Typography gutterBottom>{t('tools.cssShadowGenerator.fields.offsetY', { value: offsetY })}</Typography>
            <Slider min={-100} max={100} value={offsetY} onChange={(_, value) => setOffsetY(value)} />
            <Typography gutterBottom>{t('tools.cssShadowGenerator.fields.blur', { value: blur })}</Typography>
            <Slider min={0} max={200} value={blur} onChange={(_, value) => setBlur(value)} />
            <Typography gutterBottom>{t('tools.cssShadowGenerator.fields.spread', { value: spread })}</Typography>
            <Slider min={-50} max={50} value={spread} onChange={(_, value) => setSpread(value)} />
            <TextField type="text" label={t('tools.cssShadowGenerator.fields.color')} value={color} onChange={(event) => setColor(event.target.value)} sx={{ mt: 2 }} />
          </Box>
          <Box sx={{ flexBasis: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ width: 200, height: 160, borderRadius: 4, background: '#fff', boxShadow: shadow, border: '1px solid rgba(0,0,0,0.08)' }} />
          </Box>
        </Stack>
        <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)' }}>
          {cssSnippet}
        </Box>
      </Stack>
    </ToolLayout>
  );
};

export default CssShadowGenerator;
