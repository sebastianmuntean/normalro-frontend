import React, { useMemo, useState } from 'react';
import { Box, Grid, Slider, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const PseudoElementGenerator = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState('""');
  const [width, setWidth] = useState(120);
  const [height, setHeight] = useState(120);
  const [bgColor, setBgColor] = useState('#f43f5e');
  const [position, setPosition] = useState({ top: -20, left: -20 });

  const cssSnippet = useMemo(
    () => `.card::before {
  content: ${content || '""'};
  position: absolute;
  width: ${width}px;
  height: ${height}px;
  background: ${bgColor};
  border-radius: 50%;
  top: ${position.top}px;
  left: ${position.left}px;
  z-index: -1;
}`,
    [content, width, height, bgColor, position]
  );

  return (
    <ToolLayout title={t('tools.pseudoElementGenerator.heading')} description={t('tools.pseudoElementGenerator.instructions')}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <TextField label={t('tools.pseudoElementGenerator.fields.content')} value={content} onChange={(event) => setContent(event.target.value)} />
            <TextField label={t('tools.pseudoElementGenerator.fields.background')} value={bgColor} onChange={(event) => setBgColor(event.target.value)} />
            <Typography gutterBottom>{t('tools.pseudoElementGenerator.fields.width', { value: width })}</Typography>
            <Slider min={20} max={240} value={width} onChange={(_, value) => setWidth(value)} />
            <Typography gutterBottom>{t('tools.pseudoElementGenerator.fields.height', { value: height })}</Typography>
            <Slider min={20} max={240} value={height} onChange={(_, value) => setHeight(value)} />
            <Typography gutterBottom>{t('tools.pseudoElementGenerator.fields.top', { value: position.top })}</Typography>
            <Slider min={-120} max={120} value={position.top} onChange={(_, value) => setPosition((prev) => ({ ...prev, top: value }))} />
            <Typography gutterBottom>{t('tools.pseudoElementGenerator.fields.left', { value: position.left })}</Typography>
            <Slider min={-120} max={120} value={position.left} onChange={(_, value) => setPosition((prev) => ({ ...prev, left: value }))} />
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Box sx={{ position: 'relative', width: '100%', minHeight: 220, borderRadius: 4, background: '#fff', border: '1px solid rgba(0,0,0,0.12)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
              <Box className="card" sx={{ position: 'relative', padding: '2rem 3rem', borderRadius: '24px', background: '#0f172a', color: '#fff', fontWeight: 600, overflow: 'hidden' }}>
                <Box
                  sx={{
                    content: '""',
                    position: 'absolute',
                    width,
                    height,
                    background: bgColor,
                    borderRadius: '50%',
                    top: position.top,
                    left: position.left,
                    zIndex: -1
                  }}
                />
                {t('tools.pseudoElementGenerator.preview.text')}
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

export default PseudoElementGenerator;
