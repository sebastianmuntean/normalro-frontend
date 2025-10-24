import React, { useMemo, useState } from 'react';
import { Box, FormControl, Grid, InputLabel, MenuItem, Select, Slider, Stack, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const options = {
  justify: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'],
  align: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'],
  direction: ['row', 'row-reverse', 'column', 'column-reverse']
};

const FlexboxGenerator = () => {
  const { t } = useTranslation();
  const [justify, setJustify] = useState('center');
  const [align, setAlign] = useState('center');
  const [direction, setDirection] = useState('row');
  const [gap, setGap] = useState(16);

  const containerStyle = useMemo(
    () => ({
      display: 'flex',
      justifyContent: justify,
      alignItems: align,
      flexDirection: direction,
      gap
    }),
    [justify, align, direction, gap]
  );

  const cssSnippet = `display: flex;
flex-direction: ${direction};
justify-content: ${justify};
align-items: ${align};
gap: ${gap}px;`;

  return (
    <ToolLayout title={t('tools.flexboxGenerator.heading')} description={t('tools.flexboxGenerator.instructions')} seoSlug="flexbox-generator">
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <FormControl>
              <InputLabel>{t('tools.flexboxGenerator.fields.direction')}</InputLabel>
              <Select value={direction} label={t('tools.flexboxGenerator.fields.direction')} onChange={(event) => setDirection(event.target.value)}>
                {options.direction.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>{t('tools.flexboxGenerator.fields.justify')}</InputLabel>
              <Select value={justify} label={t('tools.flexboxGenerator.fields.justify')} onChange={(event) => setJustify(event.target.value)}>
                {options.justify.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>{t('tools.flexboxGenerator.fields.align')}</InputLabel>
              <Select value={align} label={t('tools.flexboxGenerator.fields.align')} onChange={(event) => setAlign(event.target.value)}>
                {options.align.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography gutterBottom>{t('tools.flexboxGenerator.fields.gap', { value: gap })}</Typography>
            <Slider min={0} max={80} value={gap} onChange={(_, value) => setGap(value)} />
          </Stack>
        </Grid>
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            <Box sx={{ borderRadius: 3, border: '1px dashed rgba(0,0,0,0.12)', p: 2 }}>
              <Box sx={{ ...containerStyle, width: '100%', minHeight: 220 }}>
                {[1, 2, 3].map((item) => (
                  <Box key={item} sx={{ width: 72, height: 72, borderRadius: 2, background: 'linear-gradient(135deg,#6366f1,#ec4899)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    {item}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)' }}>
              {cssSnippet}
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </ToolLayout>
  );
};

export default FlexboxGenerator;
