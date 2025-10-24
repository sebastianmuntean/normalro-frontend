import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Slider, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { keyframes } from '@mui/system';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const CssAnimationGenerator = () => {
  const { t } = useTranslation();
  const [duration, setDuration] = useState(2);
  const [translateX, setTranslateX] = useState(40);
  const [opacityStart, setOpacityStart] = useState(0);
  const [opacityEnd, setOpacityEnd] = useState(1);
  const [name, setName] = useState('normalFade');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const copyTimeoutRef = useRef(null);
  const previewTimeoutRef = useRef(null);

  const animationCode = useMemo(
    () => `@keyframes ${name} {
  from {
    transform: translateX(${translateX * -1}px);
    opacity: ${opacityStart};
  }
  to {
    transform: translateX(0);
    opacity: ${opacityEnd};
  }
}

.animated-element {
  animation: ${name} ${duration}s ease-in-out forwards;
}`,
    [name, translateX, opacityStart, opacityEnd, duration]
  );

  const animationKeyframes = useMemo(
    () =>
      keyframes`
        from {
          transform: translateX(${translateX * -1}px);
          opacity: ${opacityStart};
        }
        to {
          transform: translateX(0);
          opacity: ${opacityEnd};
        }
      `,
    [translateX, opacityStart, opacityEnd]
  );

  const previewStyle = {
    width: 160,
    height: 160,
    borderRadius: 24,
    background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
    animation: isPreviewing ? `${animationKeyframes} ${duration}s ease-in-out forwards` : 'none'
  };

  const handlePreview = () => {
    if (previewTimeoutRef.current) {
      window.clearTimeout(previewTimeoutRef.current);
    }
    setIsPreviewing(false);
    requestAnimationFrame(() => {
      setIsPreviewing(true);
      previewTimeoutRef.current = window.setTimeout(() => {
        setIsPreviewing(false);
      }, duration * 1000);
    });
  };

  const handleCopy = async () => {
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current);
    }

    if (!navigator.clipboard) {
      setCopyStatus(t('tools.cssAnimationGenerator.messages.copyFailed'));
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopyStatus('');
      }, 2000);
      return;
    }

    try {
      await navigator.clipboard.writeText(animationCode);
      setCopyStatus(t('tools.cssAnimationGenerator.messages.copied'));
    } catch (error) {
      setCopyStatus(t('tools.cssAnimationGenerator.messages.copyFailed'));
    }

    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyStatus('');
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      if (previewTimeoutRef.current) {
        window.clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ToolLayout title={t('tools.cssAnimationGenerator.heading')} description={t('tools.cssAnimationGenerator.instructions')} seoSlug="css-animation-generator">
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <TextField label={t('tools.cssAnimationGenerator.fields.name')} value={name} onChange={(event) => setName(event.target.value)} />
            <Typography gutterBottom>{t('tools.cssAnimationGenerator.fields.duration', { value: duration })}</Typography>
            <Slider
              min={0.5}
              max={10}
              step={0.1}
              value={duration}
              onChange={(_, value) => setDuration(Array.isArray(value) ? value[0] : value)}
            />
            <Typography gutterBottom>{t('tools.cssAnimationGenerator.fields.translateX', { value: translateX })}</Typography>
            <Slider
              min={-100}
              max={100}
              value={translateX}
              onChange={(_, value) => setTranslateX(Array.isArray(value) ? value[0] : value)}
            />
            <Typography gutterBottom>{t('tools.cssAnimationGenerator.fields.opacityStart', { value: opacityStart })}</Typography>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={opacityStart}
              onChange={(_, value) => setOpacityStart(Array.isArray(value) ? value[0] : value)}
            />
            <Typography gutterBottom>{t('tools.cssAnimationGenerator.fields.opacityEnd', { value: opacityEnd })}</Typography>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={opacityEnd}
              onChange={(_, value) => setOpacityEnd(Array.isArray(value) ? value[0] : value)}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={2} alignItems="center">
            <Box sx={{ width: 240, height: 240, borderRadius: 4, border: '1px dashed rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
              <Box sx={previewStyle} />
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={handlePreview}>
                {t('tools.cssAnimationGenerator.actions.preview')}
              </Button>
              <Button variant="contained" onClick={handleCopy}>
                {t('tools.cssAnimationGenerator.actions.copy')}
              </Button>
            </Stack>
            {copyStatus && (
              <Typography variant="caption" color="text.secondary">
                {copyStatus}
              </Typography>
            )}
            <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)', width: '100%' }}>
              {animationCode}
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </ToolLayout>
  );
};

export default CssAnimationGenerator;
