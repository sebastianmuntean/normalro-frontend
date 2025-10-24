import React, { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const sampleColors = (context, width, height, sampleSize = 10) => {
  const colors = {};
  const stepX = Math.max(1, Math.floor(width / sampleSize));
  const stepY = Math.max(1, Math.floor(height / sampleSize));

  for (let y = 0; y < height; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      const [r, g, b] = context.getImageData(x, y, 1, 1).data;
      const key = `${r},${g},${b}`;
      colors[key] = (colors[key] || 0) + 1;
    }
  }

  return Object.entries(colors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([key]) => {
      const [r, g, b] = key.split(',').map(Number);
      return {
        rgb: `rgb(${r}, ${g}, ${b})`,
        hex: `#${[r, g, b].map((val) => val.toString(16).padStart(2, '0')).join('')}`
      };
    });
};

const ColorExtractor = () => {
  const { t } = useTranslation();
  const [colors, setColors] = useState([]);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(t('tools.colorExtractor.messages.invalidFile'));
      setColors([]);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const palette = sampleColors(ctx, img.width, img.height, 16);
        setColors(palette);
        setError('');
      };
      img.src = reader.result;
      if (imageRef.current) {
        imageRef.current.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)'
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 600 }} gutterBottom>
              {t('tools.colorExtractor.heading')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('tools.colorExtractor.instructions')}
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Button variant="contained" component="label">
            {t('tools.colorExtractor.actions.upload')}
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>

          <Box>
            <img ref={imageRef} alt={t('tools.colorExtractor.previewAlt')} style={{ maxWidth: '100%', borderRadius: 12, display: colors.length ? 'block' : 'none' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Box>

          {colors.length > 0 && (
            <Grid container spacing={2}>
              {colors.map((color) => (
                <Grid item xs={6} sm={3} key={color.hex}>
                  <Stack spacing={1} alignItems="center">
                    <Box sx={{ width: '100%', pt: '75%', borderRadius: 2, background: color.hex, border: '1px solid rgba(0,0,0,0.12)' }} />
                    <Typography variant="body2">{color.hex}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {color.rgb}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default ColorExtractor;
