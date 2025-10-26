import React from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';

const ClearDataConfirmDialog = ({ open, onClose, onConfirm, dataSummary }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: 'warning.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>⚠️</span>
          <span>Confirmare Ștergere Date</span>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Atenție!</strong> Ești pe cale să ștergi toate datele salvate local în browser.
        </Alert>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          📊 Sumar Date care vor fi Șterse:
        </Typography>

        <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
          {/* Date Cookie */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              🍪 Cookie Furnizor
            </Typography>
            {dataSummary.cookie?.hasData ? (
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2">
                  • Furnizor: <strong>{dataSummary.cookie.supplierName || 'N/A'}</strong>
                </Typography>
                <Typography variant="body2">
                  • Serie: <strong>{dataSummary.cookie.series || 'N/A'}</strong>
                </Typography>
                <Typography variant="body2">
                  • Număr: <strong>{dataSummary.cookie.number || 'N/A'}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                  Salvat la: {dataSummary.cookie.savedDate || 'N/A'}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                Nu există date salvate în cookie
              </Typography>
            )}
          </Box>

          {/* Template-uri */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              📦 Template-uri Produse
            </Typography>
            <Typography variant="body2" sx={{ pl: 2 }}>
              {dataSummary.templates?.products || 0} template-uri produse vor fi șterse
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              👥 Template-uri Clienți
            </Typography>
            <Typography variant="body2" sx={{ pl: 2 }}>
              {dataSummary.templates?.clients || 0} template-uri clienți vor fi șterse
            </Typography>
          </Box>

          {/* Istoric Facturi */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              📄 Istoric Facturi
            </Typography>
            <Typography variant="body2" sx={{ pl: 2 }}>
              {dataSummary.invoices || 0} facturi din istoric vor fi șterse
            </Typography>
          </Box>

          {/* Google Sheets */}
          {dataSummary.googleSheets?.connected && (
            <Box>
              <Typography variant="subtitle2" color="success.main" gutterBottom>
                ☁️ Google Sheets
              </Typography>
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  ✅ Datele din Google Sheets <strong>NU vor fi afectate</strong> și vor rămâne intacte.
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  ID: {dataSummary.googleSheets.spreadsheetId}
                </Typography>
              </Alert>
            </Box>
          )}
        </Box>

        <Alert severity="error">
          <strong>Important:</strong> Această acțiune este ireversibilă! Datele locale vor fi șterse definitiv.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
        >
          Anulează
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          startIcon={<span>🗑️</span>}
        >
          Șterge Toate Datele
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClearDataConfirmDialog;


