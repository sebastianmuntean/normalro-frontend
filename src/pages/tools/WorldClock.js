import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const timeZones = [
  'UTC',
  'Europe/Bucharest',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'America/New_York',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Australia/Sydney'
];

const WorldClock = () => {
  const { t } = useTranslation();
  const [selectedZones, setSelectedZones] = useState(['UTC', 'Europe/Bucharest', 'America/New_York']);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const options = useMemo(
    () => ({
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
      hour12: false,
      day: '2-digit',
      month: 'short'
    }),
    []
  );

  const addZone = (zone) => {
    setSelectedZones((prev) => (prev.includes(zone) ? prev : [...prev, zone]));
  };

  const removeZone = (zone) => {
    setSelectedZones((prev) => prev.filter((item) => item !== zone));
  };

  return (
    <ToolLayout title={t('tools.worldClock.heading')} description={t('tools.worldClock.instructions')}>
      <Stack spacing={3}>
        <FormControl sx={{ maxWidth: 320 }}>
          <InputLabel>{t('tools.worldClock.fields.add')}</InputLabel>
          <Select
            label={t('tools.worldClock.fields.add')}
            value=""
            onChange={(event) => {
              addZone(event.target.value);
            }}
          >
            <MenuItem value="" disabled>
              {t('tools.worldClock.fields.choose')}
            </MenuItem>
            {timeZones.map((zone) => (
              <MenuItem key={zone} value={zone}>
                {zone}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack spacing={2}>
          {selectedZones.map((zone) => (
            <Box
              key={zone}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 2,
                border: '1px solid rgba(0,0,0,0.12)',
                px: 2,
                py: 1.5
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {zone}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {now.toLocaleString(undefined, { ...options, timeZone: zone })}
                </Typography>
              </Box>
              <Button variant="text" onClick={() => removeZone(zone)}>
                {t('tools.worldClock.actions.remove')}
              </Button>
            </Box>
          ))}
        </Stack>
      </Stack>
    </ToolLayout>
  );
};

export default WorldClock;
