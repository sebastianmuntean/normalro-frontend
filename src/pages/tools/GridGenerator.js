import React, { useMemo, useState } from 'react';
import { Box, Grid, Slider, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const GridGenerator = () => {
  const { t } = useTranslation();
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(2);
  const [gap, setGap] = useState(16);
  const [template, setTemplate] = useState('1fr 2fr 1fr');

  const cssSnippet = useMemo(
    () => `display: grid;
grid-template-columns: ${template || `repeat(${columns}, 1fr)`};
grid-template-rows: repeat(${rows}, minmax(120px, auto));
gap: ${gap}px;`,
    [template, columns, rows, gap]
  );

  const previewColumns = template ? template.split(' ').length : columns;

  return (
    <ToolLayout title={t('tools.gridGenerator.heading')} description={t('tools.gridGenerator.instructions')} seoSlug="grid-generator">
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <TextField
              label={t('tools.gridGenerator.fields.columns')}
              value={columns}
              type="number"
              onChange={(event) => setColumns(Math.max(1, Number(event.target.value) || 1))}
            />
            <TextField
              label={t('tools.gridGenerator.fields.rows')}
              value={rows}
              type="number"
              onChange={(event) => setRows(Math.max(1, Number(event.target.value) || 1))}
            />
            <TextField
              label={t('tools.gridGenerator.fields.template')}
              value={template}
              onChange={(event) => setTemplate(event.target.value)}
              helperText={t('tools.gridGenerator.helpers.template')}
            />
            <Typography gutterBottom>{t('tools.gridGenerator.fields.gap', { value: gap })}</Typography>
            <Slider min={0} max={64} value={gap} onChange={(_, value) => setGap(value)} />
          </Stack>
        </Grid>
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            <Box sx={{ borderRadius: 3, border: '1px dashed rgba(0,0,0,0.12)', p: 2 }}>
              <Box
                sx={{
                  display: 'grid',
                  gap,
                  gridTemplateColumns: template || `repeat(${columns}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, minmax(120px, auto))`
                }}
              >
                {Array.from({ length: previewColumns * rows }).map((_, index) => (
                  <Box key={index} sx={{ borderRadius: 2, background: 'linear-gradient(135deg,#f97316,#facc15)', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600 }}>
                    {index + 1}
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

export default GridGenerator;
