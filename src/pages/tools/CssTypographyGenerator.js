import React, { useMemo, useState } from 'react';
import { Box, Slider, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const CssTypographyGenerator = () => {
  const { t } = useTranslation();
  const [fontSize, setFontSize] = useState(24);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [fontWeight, setFontWeight] = useState(600);
  const [fontFamily, setFontFamily] = useState('"Inter", sans-serif');

  const snippet = useMemo(
    () => `font-family: ${fontFamily};
font-size: ${fontSize}px;
line-height: ${lineHeight};
letter-spacing: ${letterSpacing}px;
font-weight: ${fontWeight};`,
    [fontFamily, fontSize, lineHeight, letterSpacing, fontWeight]
  );

  return (
    <ToolLayout title={t('tools.cssTypographyGenerator.heading')} description={t('tools.cssTypographyGenerator.instructions')} seoSlug="css-typography-generator">
      <Stack spacing={3}>
        <TextField label={t('tools.cssTypographyGenerator.fields.fontFamily')} value={fontFamily} onChange={(event) => setFontFamily(event.target.value)} />
        <Typography gutterBottom>{t('tools.cssTypographyGenerator.fields.fontSize', { value: fontSize })}</Typography>
        <Slider min={8} max={72} value={fontSize} onChange={(_, value) => setFontSize(value)} />
        <Typography gutterBottom>{t('tools.cssTypographyGenerator.fields.lineHeight', { value: lineHeight })}</Typography>
        <Slider min={1} max={2.5} step={0.05} value={lineHeight} onChange={(_, value) => setLineHeight(value)} />
        <Typography gutterBottom>{t('tools.cssTypographyGenerator.fields.letterSpacing', { value: letterSpacing })}</Typography>
        <Slider min={-2} max={10} step={0.1} value={letterSpacing} onChange={(_, value) => setLetterSpacing(value)} />
        <Typography gutterBottom>{t('tools.cssTypographyGenerator.fields.fontWeight', { value: fontWeight })}</Typography>
        <Slider min={100} max={900} step={100} value={fontWeight} onChange={(_, value) => setFontWeight(value)} />
        <Box sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.12)', p: 3, background: '#f8fafc' }}>
          <Typography sx={{ fontFamily, fontSize, lineHeight, letterSpacing, fontWeight }}>
            {t('tools.cssTypographyGenerator.preview.sample')}
          </Typography>
        </Box>
        <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)' }}>
          {snippet}
        </Box>
      </Stack>
    </ToolLayout>
  );
};

export default CssTypographyGenerator;
