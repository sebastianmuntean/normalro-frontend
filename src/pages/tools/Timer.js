import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ToolLayout from '../../components/ToolLayout';

const formatTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((milliseconds % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
};

const formatTimer = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const Timer = () => {
  const { t } = useTranslation();
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const stopwatchStartRef = useRef(null);
  const stopwatchIntervalRef = useRef(null);

  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRemaining, setTimerRemaining] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIntervalRef = useRef(null);
  const [timerError, setTimerError] = useState('');

  const cleanupStopwatch = () => {
    if (stopwatchIntervalRef.current) {
      window.clearInterval(stopwatchIntervalRef.current);
      stopwatchIntervalRef.current = null;
    }
  };

  const cleanupTimer = () => {
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startStopwatch = () => {
    if (stopwatchRunning) {
      return;
    }
    stopwatchStartRef.current = Date.now() - stopwatchTime;
    cleanupStopwatch();
    stopwatchIntervalRef.current = window.setInterval(() => {
      setStopwatchTime(Date.now() - (stopwatchStartRef.current ?? Date.now()));
    }, 50);
    setStopwatchRunning(true);
  };

  const pauseStopwatch = () => {
    if (!stopwatchRunning) {
      return;
    }
    cleanupStopwatch();
    setStopwatchRunning(false);
  };

  const resetStopwatch = () => {
    cleanupStopwatch();
    setStopwatchRunning(false);
    setStopwatchTime(0);
  };

  const startTimer = () => {
    if (timerSeconds <= 0) {
      setTimerError(t('tools.timer.messages.invalidDuration'));
      return;
    }
    if (timerRunning) {
      return;
    }
    setTimerError('');
    setTimerRemaining(timerSeconds);
    cleanupTimer();
    const endTime = Date.now() + timerSeconds * 1000;
    timerIntervalRef.current = window.setInterval(() => {
      const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimerRemaining(diff);
      if (diff === 0) {
        cleanupTimer();
        setTimerRunning(false);
      }
    }, 250);
    setTimerRunning(true);
  };

  const resetTimer = () => {
    cleanupTimer();
    setTimerRunning(false);
    setTimerRemaining(timerSeconds);
  };

  useEffect(() => {
    if (!timerRunning) {
      setTimerRemaining(timerSeconds);
    }
  }, [timerSeconds, timerRunning]);

  useEffect(() => {
    return () => {
      cleanupStopwatch();
      cleanupTimer();
    };
  }, []);

  return (
    <ToolLayout
      title={t('tools.timer.heading')}
      description={t('tools.timer.instructions')}
      seoSlug="timer"
    >
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)'
            }}
          >
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight="600">
                {t('tools.timer.stopwatch.heading')}
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 600, textAlign: 'center' }}>
                {formatTime(stopwatchTime)}
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  onClick={stopwatchRunning ? pauseStopwatch : startStopwatch}
                >
                  {stopwatchRunning
                    ? t('tools.timer.stopwatch.actions.pause')
                    : t('tools.timer.stopwatch.actions.start')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetStopwatch}
                >
                  {t('tools.timer.stopwatch.actions.reset')}
                </Button>
                <Button
                  variant="text"
                  onClick={() => {
                    navigator.clipboard.writeText(formatTime(stopwatchTime));
                  }}
                >
                  {t('tools.timer.stopwatch.actions.copy')}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)'
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography variant="h3" component="h2" sx={{ fontWeight: 600 }} gutterBottom>
                  {t('tools.timer.countdown.heading')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('tools.timer.countdown.instructions')}
                </Typography>
              </Box>

              {timerError && <Alert severity="error">{timerError}</Alert>}

              <Stack direction="row" spacing={2}>
                <TextField
                  type="number"
                  label={t('tools.timer.countdown.fields.minutes')}
                  value={Math.floor(timerSeconds / 60)}
                  onChange={(event) => {
                    const minutes = Number(event.target.value) || 0;
                    setTimerSeconds(minutes * 60 + (timerSeconds % 60));
                  }}
                />
                <TextField
                  type="number"
                  label={t('tools.timer.countdown.fields.seconds')}
                  value={timerSeconds % 60}
                  onChange={(event) => {
                    const seconds = Math.min(59, Math.max(0, Number(event.target.value) || 0));
                    setTimerSeconds(Math.floor(timerSeconds / 60) * 60 + seconds);
                  }}
                />
              </Stack>

              <Typography variant="h2" sx={{ fontWeight: 600, textAlign: 'center' }}>
                {formatTimer(timerRemaining)}
              </Typography>

              <Stack direction="row" spacing={2} justifyContent="center">
                <Button variant="contained" onClick={startTimer} disabled={timerRunning}>
                  {t('tools.timer.countdown.actions.start')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetTimer}
                >
                  {t('tools.timer.countdown.actions.reset')}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </ToolLayout>
  );
};

export default Timer;
