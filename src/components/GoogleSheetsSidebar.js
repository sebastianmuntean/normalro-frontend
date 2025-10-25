import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Fab,
  IconButton,
  Paper,
  Stack,
  Typography,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const GoogleSheetsSidebar = ({
  // States
  googleSheetsReady,
  googleSheetsConnected,
  googleSheetsId,
  isSyncingToSheets,
  syncStatus,
  lastSyncTime,
  expandedAccordion,
  saveDataConsent,
  
  // Handlers
  onAccordionChange,
  onCreateSpreadsheet,
  onConnectSpreadsheet,
  onSyncManual,
  onDisconnect,
  onOpenSpreadsheet,
  onOpenHistory,
  onSaveDataConsentChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Tab-uri Verticale pentru fiecare secțiune */}
      {!isOpen && (
        <Stack
          spacing={1}
          sx={{
            position: 'fixed',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1200
          }}
        >
          {/* Tab Google Sheets */}
          <Paper
            onClick={toggleSidebar}
            elevation={3}
            sx={{
              cursor: 'pointer',
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              bgcolor: googleSheetsConnected ? 'success.main' : 'primary.main',
              color: 'white',
              p: 1.5,
              pl: 2,
              pr: 1,
              minHeight: 100,
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s',
              '&:hover': {
                right: 4,
                bgcolor: googleSheetsConnected ? 'success.dark' : 'primary.dark',
                boxShadow: 6
              }
            }}
          >
            <Stack spacing={1} alignItems="center">
              <Box sx={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                <Typography variant="caption" fontWeight="bold" fontSize="0.7rem" sx={{ letterSpacing: 1 }}>
                  GOOGLE SHEETS
                </Typography>
              </Box>
              <Box sx={{ fontSize: '1.1rem' }}>
                {googleSheetsConnected ? '✅' : '⚠️'}
              </Box>
              {isSyncingToSheets && (
                <CircularProgress size={14} sx={{ color: 'white' }} />
              )}
            </Stack>
          </Paper>

          {/* Tab Salvare Date */}
          <Paper
            onClick={toggleSidebar}
            elevation={3}
            sx={{
              cursor: 'pointer',
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              bgcolor: saveDataConsent ? 'info.main' : 'warning.main',
              color: 'white',
              p: 1.5,
              pl: 2,
              pr: 1,
              minHeight: 100,
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s',
              '&:hover': {
                right: 4,
                bgcolor: saveDataConsent ? 'info.dark' : 'warning.dark',
                boxShadow: 6
              }
            }}
          >
            <Stack spacing={1} alignItems="center">
              <Box sx={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                <Typography variant="caption" fontWeight="bold" fontSize="0.7rem" sx={{ letterSpacing: 1 }}>
                  SALVARE DATE
                </Typography>
              </Box>
              <Box sx={{ fontSize: '1.1rem' }}>
                {saveDataConsent ? '✅' : '⚠️'}
              </Box>
            </Stack>
          </Paper>

          {/* Tab Istoric Facturi */}
          <Paper
            onClick={onOpenHistory}
            elevation={3}
            sx={{
              cursor: 'pointer',
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              bgcolor: 'secondary.main',
              color: 'white',
              p: 1.5,
              pl: 2,
              pr: 1,
              minHeight: 100,
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s',
              '&:hover': {
                right: 4,
                bgcolor: 'secondary.dark',
                boxShadow: 6
              }
            }}
          >
            <Stack spacing={1} alignItems="center">
              <Box sx={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                <Typography variant="caption" fontWeight="bold" fontSize="0.7rem" sx={{ letterSpacing: 1 }}>
                  ISTORIC FACTURI
                </Typography>
              </Box>
              <Box sx={{ fontSize: '1.1rem' }}>
                📄
              </Box>
            </Stack>
          </Paper>
        </Stack>
      )}

      {/* Overlay pentru închidere */}
      {isOpen && (
        <Box
          onClick={toggleSidebar}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 1250,
            transition: 'opacity 0.3s',
            opacity: isOpen ? 1 : 0
          }}
        />
      )}

      {/* Sidebar Panel */}
      <Paper 
        elevation={8} 
        sx={{ 
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : -350,
          width: 350,
          height: '100vh',
          zIndex: 1300,
          overflow: 'auto',
          transition: 'right 0.3s ease-in-out',
          borderLeft: '2px solid',
          borderColor: 'divider'
        }}
      >
        {/* Header cu buton închidere */}
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}
        >
          <Typography variant="h6" fontSize="1rem" fontWeight="bold">
            ☁️ Google Sheets
          </Typography>
          <IconButton 
            onClick={toggleSidebar}
            size="small"
            sx={{ color: 'white' }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      {/* De ce Google Sheets */}
      <Accordion 
        expanded={expandedAccordion === 'why-sheets'} 
        onChange={onAccordionChange('why-sheets')}
        disableGutters
        elevation={0}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon fontSize="small" />}
          sx={{ 
            bgcolor: 'primary.50',
            '&:hover': { bgcolor: 'primary.100' },
            minHeight: 40,
            '& .MuiAccordionSummary-content': { my: 0.5 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <InfoOutlinedIcon color="primary" sx={{ fontSize: 16 }} />
            <Typography variant="caption" fontWeight="bold" fontSize="0.8rem">
              De ce Google Sheets?
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1.5 }}>
          <Stack spacing={1}>
            <Box>
              <Typography variant="caption" fontWeight="600" display="block" fontSize="0.75rem">
                ☁️ Salvare în Cloud
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" fontSize="0.7rem">
                Date accesibile oriunde, oricând
              </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <Box>
              <Typography variant="caption" fontWeight="600" display="block" fontSize="0.75rem">
                🔄 Sincronizare Automată
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" fontSize="0.7rem">
                La fiecare 5 min + la export
              </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <Box>
              <Typography variant="caption" fontWeight="600" display="block" fontSize="0.75rem">
                📊 Acces Direct
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" fontSize="0.7rem">
                Editează în Google Sheets
              </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <Box>
              <Typography variant="caption" fontWeight="600" display="block" fontSize="0.75rem">
                🔒 OAuth 2.0
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" fontSize="0.7rem">
                Securitate Google
              </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <Box>
              <Typography variant="caption" fontWeight="600" display="block" fontSize="0.75rem">
                💾 Backup Automat
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" fontSize="0.7rem">
                Versiuni istorice
              </Typography>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Google Sheets Connection */}
      {googleSheetsReady && (
        <Accordion 
          expanded={expandedAccordion === 'google-sheets'} 
          onChange={onAccordionChange('google-sheets')}
          disableGutters
          elevation={0}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon fontSize="small" />}
            sx={{ 
              bgcolor: googleSheetsConnected ? 'success.50' : 'warning.50',
              '&:hover': { bgcolor: googleSheetsConnected ? 'success.100' : 'warning.100' },
              minHeight: 40,
              '& .MuiAccordionSummary-content': { my: 0.5 }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', justifyContent: 'space-between' }}>
              <Typography variant="caption" fontWeight="bold" fontSize="0.8rem" color={googleSheetsConnected ? 'success.dark' : 'warning.dark'}>
                {googleSheetsConnected ? '✅ Conectat' : '⚠️ Neconectat'}
              </Typography>
              {isSyncingToSheets && <CircularProgress size={14} />}
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 1.5 }}>
            {syncStatus && (
              <Alert severity="info" sx={{ py: 0.5, mb: 1.5, fontSize: '0.7rem' }}>
                {syncStatus}
              </Alert>
            )}

            {googleSheetsConnected ? (
              <Stack spacing={1.5}>
                {/* Informații Spreadsheet */}
                <Box sx={{ bgcolor: 'success.50', p: 1, borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
                  <Typography variant="caption" fontWeight="bold" color="success.dark" display="block" fontSize="0.75rem" mb={0.5}>
                    📊 Spreadsheet Activ
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" fontSize="0.65rem" mb={0.5}>
                    Spreadsheet ID:
                  </Typography>
                  <code style={{ fontSize: '0.6rem', backgroundColor: '#fff', padding: '2px 4px', borderRadius: '3px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {googleSheetsId}
                  </code>
                </Box>

                {/* Date Sincronizate */}
                <Box sx={{ bgcolor: 'info.50', p: 1, borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
                  <Typography variant="caption" fontWeight="bold" color="info.dark" display="block" fontSize="0.75rem" mb={0.5}>
                    📋 Date Sincronizate
                  </Typography>
                  <Stack spacing={0.3}>
                    <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                      • Date Furnizor (serie, CUI, adresă)
                    </Typography>
                    <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                      • Template Produse (nume, preț, TVA)
                    </Typography>
                    <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                      • Template Clienți (CUI, contact)
                    </Typography>
                    <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                      • Istoric Facturi (complete)
                    </Typography>
                  </Stack>
                </Box>

                {/* Ultima Sincronizare */}
                {lastSyncTime && (
                  <Box sx={{ bgcolor: 'grey.100', p: 0.8, borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="caption" color="success.main" fontWeight="600" fontSize="0.7rem">
                      🔄 Ultima sincronizare: {lastSyncTime}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" fontSize="0.6rem">
                      (automată la fiecare 5 min + export)
                    </Typography>
                  </Box>
                )}

                <Divider />

                {/* Butoane Acțiuni */}
                <Stack spacing={0.5}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CloudUploadIcon sx={{ fontSize: 14 }} />}
                    onClick={onSyncManual}
                    disabled={isSyncingToSheets}
                    fullWidth
                    sx={{ fontSize: '0.7rem', py: 0.5 }}
                  >
                    Sincronizare Manuală
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    onClick={onOpenSpreadsheet}
                    fullWidth
                    sx={{ fontSize: '0.7rem', py: 0.5 }}
                  >
                    📊 Deschide în Google Sheets
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    color="error"
                    onClick={onDisconnect}
                    fullWidth
                    sx={{ fontSize: '0.65rem', py: 0.5, mt: 0.5 }}
                  >
                    ✖ Deconectează Spreadsheet
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={1.5}>
                {/* Info Box - Nu este conectat */}
                <Box sx={{ bgcolor: 'warning.50', p: 1, borderRadius: 1, border: '1px solid', borderColor: 'warning.300' }}>
                  <Typography variant="caption" fontWeight="bold" color="warning.dark" display="block" fontSize="0.75rem" mb={0.5}>
                    ⚠️ Nu ești conectat
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                    Conectează un spreadsheet Google Sheets pentru:
                  </Typography>
                  <Stack spacing={0.3} mt={0.5}>
                    <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                      ✅ Salvare automată în cloud
                    </Typography>
                    <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                      ✅ Acces de pe orice device
                    </Typography>
                    <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                      ✅ Backup securizat Google
                    </Typography>
                    <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                      ✅ Editare directă în Sheets
                    </Typography>
                  </Stack>
                </Box>

                <Divider />

                {/* Butoane pentru conectare */}
                <Box>
                  <Typography variant="caption" fontWeight="bold" display="block" fontSize="0.7rem" mb={0.8}>
                    Opțiuni de Conectare:
                  </Typography>
                  <Stack spacing={0.5}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                      onClick={onCreateSpreadsheet}
                      disabled={isSyncingToSheets}
                      fullWidth
                      sx={{ fontSize: '0.7rem', py: 0.5 }}
                    >
                      + Crează Spreadsheet Nou
                    </Button>
                    <Typography variant="caption" color="text.secondary" fontSize="0.6rem" textAlign="center">
                      (automat cu toate sheet-urile necesare)
                    </Typography>
                    
                    <Divider sx={{ my: 0.5 }}>SAU</Divider>
                    
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={onConnectSpreadsheet}
                      disabled={isSyncingToSheets}
                      fullWidth
                      sx={{ fontSize: '0.7rem', py: 0.5 }}
                    >
                      🔗 Conectează Spreadsheet Existent
                    </Button>
                    <Typography variant="caption" color="text.secondary" fontSize="0.6rem" textAlign="center">
                      (dacă ai deja un spreadsheet creat manual)
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Salvare Date */}
      <Accordion 
        expanded={expandedAccordion === 'consent'} 
        onChange={onAccordionChange('consent')}
        disableGutters
        elevation={0}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon fontSize="small" />}
          sx={{ 
            bgcolor: saveDataConsent ? 'info.50' : 'warning.50',
            '&:hover': { bgcolor: saveDataConsent ? 'info.100' : 'warning.100' },
            minHeight: 40,
            '& .MuiAccordionSummary-content': { my: 0.5 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" fontWeight="bold" fontSize="0.8rem" color={saveDataConsent ? 'info.dark' : 'warning.dark'}>
              {saveDataConsent ? '✅' : '⚠️'} Salvare Date
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1.5 }}>
          <Stack spacing={1.5}>
            {/* Explicație generală */}
            <Box sx={{ bgcolor: 'grey.50', p: 1, borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
              <Typography variant="caption" fontWeight="bold" display="block" fontSize="0.75rem" mb={0.5}>
                📝 Unde se salvează datele?
              </Typography>
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                Aplicația salvează datele în 3 locuri pentru confort maxim:
              </Typography>
            </Box>

            {/* Cookie Browser */}
            <Box sx={{ bgcolor: 'primary.50', p: 1, borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
              <Typography variant="caption" fontWeight="bold" color="primary.dark" display="block" fontSize="0.72rem" mb={0.5}>
                🍪 Cookie Browser (criptat)
              </Typography>
              <Stack spacing={0.3}>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  • Date furnizor (nume, CUI, adresă)
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  • Serie factură + Număr curent
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  • Cotă TVA implicită
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  • Valabilitate: 90 zile
                </Typography>
              </Stack>
            </Box>

            {/* Local Storage */}
            <Box sx={{ bgcolor: 'secondary.50', p: 1, borderRadius: 1, border: '1px solid', borderColor: 'secondary.200' }}>
              <Typography variant="caption" fontWeight="bold" color="secondary.dark" display="block" fontSize="0.72rem" mb={0.5}>
                💾 Local Storage
              </Typography>
              <Stack spacing={0.3}>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  • Template-uri produse (salvate)
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  • Template-uri clienți (salvate)
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  • Istoric facturi generate
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  • Valabilitate: permanent (până la ștergere)
                </Typography>
              </Stack>
            </Box>

            {/* Google Sheets */}
            {googleSheetsConnected && (
              <Box sx={{ bgcolor: 'success.50', p: 1, borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
                <Typography variant="caption" fontWeight="bold" color="success.dark" display="block" fontSize="0.72rem" mb={0.5}>
                  ☁️ Google Sheets (cloud)
                </Typography>
                <Stack spacing={0.3}>
                  <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                    ✅ TOATE datele de mai sus
                  </Typography>
                  <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                    ✅ Backup automat în cloud
                  </Typography>
                  <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                    ✅ Sincronizare automată (5 min)
                  </Typography>
                  <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                    ✅ Acces de pe orice device
                  </Typography>
                </Stack>
              </Box>
            )}

            {/* Avertisment despre riscul salvării doar în browser */}
            {!googleSheetsConnected && (
              <Box sx={{ bgcolor: 'warning.50', p: 1, borderRadius: 1, border: '1px solid', borderColor: 'warning.300' }}>
                <Typography variant="caption" fontWeight="bold" color="warning.dark" display="block" fontSize="0.72rem" mb={0.5}>
                  ⚠️ Risc: Salvare doar în browser
                </Typography>
                <Stack spacing={0.3}>
                  <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                    ⚠️ Datele pot fi șterse accidental la golirea cache-ului browser-ului
                  </Typography>
                  <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                    ⚠️ Pierdere date la resetare browser
                  </Typography>
                  <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                    ⚠️ Fără backup automat
                  </Typography>
                  <Typography variant="caption" fontSize="0.65rem" color="success.main" fontWeight="600">
                    💡 Recomandare: Conectează Google Sheets pentru siguranță maximă!
                  </Typography>
                </Stack>
              </Box>
            )}

            {/* Confidențialitate și gratuit */}
            <Box sx={{ bgcolor: 'info.50', p: 1, borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
              <Typography variant="caption" fontWeight="bold" color="info.dark" display="block" fontSize="0.72rem" mb={0.5}>
                🔒 Confidențialitate & Gratuit
              </Typography>
              <Stack spacing={0.3}>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  ✅ Serviciu 100% gratuit
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  ✅ NU salvăm date pe serverele noastre
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  ✅ NU procesăm sau accesăm datele tale
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  ✅ Totul rămâne în browser-ul tău sau în Google Sheets-ul tău personal
                </Typography>
              </Stack>
            </Box>

            <Divider />

            {/* Checkbox pentru consimțământ */}
            <Box sx={{ bgcolor: saveDataConsent ? 'success.50' : 'error.50', p: 1, borderRadius: 1, border: '1px solid', borderColor: saveDataConsent ? 'success.300' : 'error.300' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={saveDataConsent}
                    onChange={onSaveDataConsentChange}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="caption" fontSize="0.7rem">
                    <strong>Sunt de acord cu salvarea datelor</strong>
                    <br />
                    <Typography component="span" variant="caption" color="text.secondary" fontSize="0.62rem">
                      Cookie criptat (90 zile) + Local Storage
                      {googleSheetsConnected && <><br /><strong style={{ color: '#2e7d32' }}>✅ + Sincronizare Google Sheets</strong></>}
                    </Typography>
                  </Typography>
                }
                sx={{ m: 0, alignItems: 'flex-start' }}
              />
            </Box>

            {/* Avertisment ștergere */}
            {!saveDataConsent && (
              <Alert severity="error" sx={{ py: 0.5, fontSize: '0.65rem' }}>
                <strong>⚠️ Atenție!</strong>
                <br />
                Debifând această opțiune, toate datele locale vor fi șterse permanent (cookie + local storage).
              </Alert>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Istoric Facturi */}
      <Accordion 
        expanded={expandedAccordion === 'history'} 
        onChange={onAccordionChange('history')}
        disableGutters
        elevation={0}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon fontSize="small" />}
          sx={{ 
            bgcolor: 'secondary.50',
            '&:hover': { bgcolor: 'secondary.100' },
            minHeight: 40,
            '& .MuiAccordionSummary-content': { my: 0.5 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <HistoryIcon color="secondary" sx={{ fontSize: 16 }} />
            <Typography variant="caption" fontWeight="bold" fontSize="0.8rem">
              Istoric Facturi
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1.5 }}>
          <Stack spacing={1.5}>
            {/* Explicație Istoric */}
            <Box sx={{ bgcolor: 'grey.50', p: 1, borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
              <Typography variant="caption" fontWeight="bold" display="block" fontSize="0.75rem" mb={0.5}>
                📋 Ce este Istoricul?
              </Typography>
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                Toate facturile generate sunt salvate automat pentru referință și reutilizare.
              </Typography>
            </Box>

            {/* Ce poți face */}
            <Box sx={{ bgcolor: 'secondary.50', p: 1, borderRadius: 1, border: '1px solid', borderColor: 'secondary.200' }}>
              <Typography variant="caption" fontWeight="bold" color="secondary.dark" display="block" fontSize="0.72rem" mb={0.5}>
                ⚡ Ce poți face?
              </Typography>
              <Stack spacing={0.3}>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  👁️ Vezi toate facturile generate
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  🔍 Caută după serie, număr, client
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  📥 Reîncarcă factura pentru editare
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  📊 Exportă din nou în PDF/Excel
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="success.main" fontWeight="600">
                  💼 Export format SAGA (software contabilitate)
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  🗑️ Șterge facturile vechi
                </Typography>
              </Stack>
            </Box>

            {/* Export SAGA */}
            <Box sx={{ bgcolor: 'success.50', p: 1, borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
              <Typography variant="caption" fontWeight="bold" color="success.dark" display="block" fontSize="0.72rem" mb={0.5}>
                💼 Export SAGA
              </Typography>
              <Stack spacing={0.3}>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  📋 Format special pentru software-ul de contabilitate SAGA
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  ✅ Import direct în SAGA (fără transcriere manuală)
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  ⚡ Economisești timp la contabilitate
                </Typography>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  🎯 Formatare automată conform cerințelor SAGA
                </Typography>
              </Stack>
            </Box>

            {/* Unde se salvează */}
            <Box sx={{ bgcolor: 'info.50', p: 1, borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
              <Typography variant="caption" fontWeight="bold" color="info.dark" display="block" fontSize="0.72rem" mb={0.5}>
                💾 Unde se salvează?
              </Typography>
              <Stack spacing={0.3}>
                <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
                  📱 Local Storage (browser)
                </Typography>
                {googleSheetsConnected && (
                  <Typography variant="caption" fontSize="0.65rem" color="success.main" fontWeight="600">
                    ☁️ + Google Sheets (backup cloud)
                  </Typography>
                )}
                {!googleSheetsConnected && (
                  <Typography variant="caption" fontSize="0.65rem" color="warning.main" fontWeight="600">
                    ⚠️ Doar local (conectează Sheets pentru backup)
                  </Typography>
                )}
              </Stack>
            </Box>

            <Divider />

            {/* Buton Deschide Istoric */}
            <Button
              size="small"
              variant="contained"
              color="secondary"
              startIcon={<HistoryIcon sx={{ fontSize: 14 }} />}
              onClick={onOpenHistory}
              fullWidth
              sx={{ fontSize: '0.75rem', py: 0.7, fontWeight: 'bold' }}
            >
              📄 Deschide Istoric Facturi
            </Button>

            {/* Notă */}
            <Box sx={{ bgcolor: 'grey.100', p: 0.8, borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" fontSize="0.6rem" fontStyle="italic" textAlign="center" display="block">
                💡 Tip: Poți accesa rapid istoricul și din tab-ul de pe dreapta!
              </Typography>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>
      </Paper>
    </>
  );
};

export default GoogleSheetsSidebar;

