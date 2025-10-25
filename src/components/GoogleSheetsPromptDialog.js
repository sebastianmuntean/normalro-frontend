import React from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const GoogleSheetsPromptDialog = ({ open, onClose, onConnect, onNever }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ fontSize: '2rem' }}>☁️</Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Conectează-te la Google Sheets
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Salvează-ți datele în siguranță în cloud
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2.5}>
          <Alert severity="info" icon={<InfoOutlinedIcon />}>
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              💡 Recomandare: Conectare Google Sheets
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pentru o experiență optimă și siguranța datelor tale
            </Typography>
          </Alert>

          <Box>
            <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>✨</span>
              <span>Beneficii:</span>
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box sx={{ fontSize: '1.2rem', flexShrink: 0 }}>☁️</Box>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Salvare Automată în Cloud
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Datele tale (furnizor, produse, clienți, facturi) sunt salvate automat și accesibile de oriunde.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box sx={{ fontSize: '1.2rem', flexShrink: 0 }}>🔄</Box>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Sincronizare Continuă
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Sincronizare automată la fiecare 5 minute + la fiecare export de factură.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box sx={{ fontSize: '1.2rem', flexShrink: 0 }}>💾</Box>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Backup Permanent
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Nu pierzi niciodată datele - Google păstrează versiuni istorice și backup-uri.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box sx={{ fontSize: '1.2rem', flexShrink: 0 }}>📊</Box>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Acces Direct la Date
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Vizualizează și editează toate datele direct în Google Sheets când vrei.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box sx={{ fontSize: '1.2rem', flexShrink: 0 }}>🔒</Box>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Securitate Maximă
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Autentificare OAuth 2.0 de la Google. Datele tale sunt protejate la cel mai înalt nivel.
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>

          <Divider />

          <Box sx={{ bgcolor: 'success.50', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
            <Typography variant="caption" color="success.dark" fontWeight="medium">
              ⚡ Configurare rapidă: Mai puțin de 30 de secunde!
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onNever}
          variant="text"
          color="inherit"
          size="small"
        >
          Nu îmi mai aminti
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
        >
          Mai târziu
        </Button>
        <Button
          onClick={onConnect}
          variant="contained"
          color="primary"
          startIcon={<CloudUploadIcon />}
        >
          Conectează-te acum
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoogleSheetsPromptDialog;

