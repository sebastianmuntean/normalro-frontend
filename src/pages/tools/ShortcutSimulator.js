import React, { useMemo, useState } from 'react';
import { Box, List, ListItem, ListItemText, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const shortcuts = {
  'ctrl+c': 'copy',
  'ctrl+v': 'paste',
  'ctrl+x': 'cut',
  'ctrl+z': 'undo',
  'ctrl+shift+z': 'redo',
  'ctrl+shift+n': 'new incognito window (Chrome)',
  'ctrl+shift+t': 'reopen last closed tab',
  'ctrl+l': 'focus address bar',
  'ctrl+shift+k': 'open dev tools console (Firefox)',
  'ctrl+shift+i': 'open dev tools',
  'ctrl+p': 'print',
  'alt+tab': 'switch windows',
  'cmd+c': 'copy (macOS)',
  'cmd+v': 'paste (macOS)',
  'cmd+shift+3': 'screenshot (macOS)',
  'cmd+shift+4': 'area screenshot (macOS)'
};

const ShortcutSimulator = () => {
  const { t } = useTranslation();
  const [combination, setCombination] = useState('');

  const normalized = useMemo(() => combination.trim().toLowerCase(), [combination]);
  const description = shortcuts[normalized];

  return (
    <ToolLayout title={t('tools.shortcutSimulator.heading')} description={t('tools.shortcutSimulator.instructions')}>
      <Stack spacing={3}>
        <TextField
          label={t('tools.shortcutSimulator.fields.input')}
          value={combination}
          onChange={(event) => setCombination(event.target.value)}
          placeholder="Ctrl+Shift+K"
        />
        <Box sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)', p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('tools.shortcutSimulator.result.label')}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {description ? t(`tools.shortcutSimulator.shortcuts.${description}`, description) : t('tools.shortcutSimulator.messages.unknown')}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t('tools.shortcutSimulator.reference.title')}
          </Typography>
          <List dense>
            {Object.entries(shortcuts).map(([key, value]) => (
              <ListItem key={key} sx={{ py: 0 }}>
                <ListItemText primary={key.toUpperCase()} secondary={t(`tools.shortcutSimulator.shortcuts.${value}`, value)} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Stack>
    </ToolLayout>
  );
};

export default ShortcutSimulator;
