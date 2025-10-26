import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Stack,
  Grid,
  InputAdornment,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Autocomplete,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import templateService from '../services/templateService';
import CompanyForm from './CompanyForm';
import { getCompanyDataByCUI } from '../services/anafService';

// Lista județelor din România
const JUDETE_ROMANIA = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani',
  'Brăila', 'Brașov', 'București', 'Buzău', 'Călărași', 'Caraș-Severin',
  'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu',
  'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș',
  'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Sălaj', 'Satu Mare',
  'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vâlcea', 'Vaslui', 'Vrancea'
];

const ClientTemplateDialog = ({ open, onClose, onSelectClient, onOpenProfile }) => {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadingAnaf, setLoadingAnaf] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);
  
  // Form state pentru adăugare/editare client (format compatibil cu CompanyForm)
  const [newClient, setNewClient] = useState({
    clientName: '',
    clientCUI: '',
    clientRegCom: '',
    clientAddress: '',
    clientCity: '',
    clientCounty: '',
    clientCountry: 'Romania',
    clientPhone: '',
    clientEmail: '',
    clientVatPrefix: '-',
    clientBankAccounts: [{ bank: '', iban: '', currency: 'RON' }]
  });

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, search, showFavorites]);

  const loadTemplates = () => {
    const result = templateService.getClientTemplates({
      search,
      onlyFavorites: showFavorites
    });
    setTemplates(result);
  };

  const handleDelete = (id) => {
    if (window.confirm('Sigur vrei să ștergi acest client din template-uri?')) {
      templateService.deleteClientTemplate(id);
      loadTemplates();
    }
  };

  const handleToggleFavorite = (id) => {
    templateService.toggleClientFavorite(id);
    loadTemplates();
  };

  const searchClientANAF = async () => {
    if (!newClient.clientCUI) {
      alert('Introduceți CUI-ul clientului!');
      return;
    }

    setLoadingAnaf(true);

    try {
      const result = await getCompanyDataByCUI(newClient.clientCUI);

      if (result.success) {
        // Verifică dacă compania este plătitoare de TVA
        const isVatPayer = result.data.platitorTVA === true || result.data.platitorTVA === 'true';
        
        setNewClient(prev => ({
          ...prev,
          clientName: result.data.denumire,
          clientCUI: result.data.cui,
          clientRegCom: result.data.nrRegCom,
          clientAddress: result.data.adresaCompleta,
          clientCity: result.data.oras,
          clientCounty: result.data.judet || '',
          clientPhone: result.data.telefon,
          clientVatPrefix: isVatPayer ? 'RO' : '-'
        }));
      } else {
        alert(result.error || `Nu s-a găsit o companie cu codul fiscal ${newClient.clientCUI}`);
      }
    } catch (error) {
      alert(`Nu s-a găsit o companie cu codul fiscal ${newClient.clientCUI}`);
    } finally {
      setLoadingAnaf(false);
    }
  };

  const handleStartEdit = (template) => {
    // Populează formularul cu datele clientului pentru editare
    setNewClient({
      clientName: template.name || '',
      clientCUI: template.cui || '',
      clientRegCom: template.regCom || '',
      clientAddress: template.address || '',
      clientCity: template.city || '',
      clientCounty: template.county || '',
      clientCountry: template.country || 'Romania',
      clientPhone: template.phone || '',
      clientEmail: template.email || '',
      clientVatPrefix: template.vatPrefix || '-',
      clientBankAccounts: template.bankAccounts && template.bankAccounts.length > 0 
        ? template.bankAccounts.map(acc => ({
            bank: acc.bank || '',
            iban: acc.iban || '',
            currency: acc.currency || 'RON'
          }))
        : [{ bank: '', iban: '', currency: 'RON' }]
    });
    setEditingClientId(template.id);
    setEditMode(true);
    setShowAddForm(true);
  };

  const handleAddClient = () => {
    if (!newClient.clientName) {
      alert('Introdu numele clientului!');
      return;
    }

    // Convertește formatul pentru salvare
    const clientToSave = {
      name: newClient.clientName,
      cui: newClient.clientCUI,
      regCom: newClient.clientRegCom,
      address: newClient.clientAddress,
      city: newClient.clientCity,
      county: newClient.clientCounty,
      country: newClient.clientCountry,
      phone: newClient.clientPhone,
      email: newClient.clientEmail,
      vatPrefix: newClient.clientVatPrefix,
      bankAccounts: newClient.clientBankAccounts
    };

    if (editMode && editingClientId) {
      // Modifică client existent
      templateService.updateClientTemplate(editingClientId, clientToSave);
    } else {
      // Adaugă client nou
      templateService.saveClientTemplate(clientToSave);
    }

    // Reset form
    setNewClient({
      clientName: '',
      clientCUI: '',
      clientRegCom: '',
      clientAddress: '',
      clientCity: '',
      clientCounty: '',
      clientCountry: 'Romania',
      clientPhone: '',
      clientEmail: '',
      clientVatPrefix: '-',
      clientBankAccounts: [{ bank: '', iban: '', currency: 'RON' }]
    });

    setShowAddForm(false);
    setEditMode(false);
    setEditingClientId(null);
    loadTemplates();
  };

  const handleCancelEdit = () => {
    setNewClient({
      clientName: '',
      clientCUI: '',
      clientRegCom: '',
      clientAddress: '',
      clientCity: '',
      clientCounty: '',
      clientCountry: 'Romania',
      clientPhone: '',
      clientEmail: '',
      clientVatPrefix: '-',
      clientBankAccounts: [{ bank: '', iban: '', currency: 'RON' }]
    });
    setShowAddForm(false);
    setEditMode(false);
    setEditingClientId(null);
  };

  const handleAddBankAccount = () => {
    setNewClient({
      ...newClient,
      clientBankAccounts: [...newClient.clientBankAccounts, { bank: '', iban: '', currency: 'RON' }]
    });
  };

  const handleRemoveBankAccount = (index) => {
    const updatedAccounts = newClient.clientBankAccounts.filter((_, i) => i !== index);
    setNewClient({
      ...newClient,
      clientBankAccounts: updatedAccounts.length > 0 ? updatedAccounts : [{ bank: '', iban: '', currency: 'RON' }]
    });
  };

  const handleBankAccountChange = (index, field, value) => {
    const updatedAccounts = [...newClient.clientBankAccounts];
    updatedAccounts[index][field] = value;
    setNewClient({
      ...newClient,
      clientBankAccounts: updatedAccounts
    });
  };

  const handleClientChange = (field) => (event) => {
    setNewClient({
      ...newClient,
      [field]: event.target.value
    });
  };

  const handleSelectClient = (template) => {
    templateService.incrementClientUsage(template.id);
    
    if (onSelectClient) {
      const clientData = {
        clientName: template.name,
        clientCUI: template.cui,
        clientRegCom: template.regCom,
        clientAddress: template.address,
        clientCity: template.city,
        clientCounty: template.county,
        clientCountry: template.country,
        clientPhone: template.phone,
        clientEmail: template.email,
        clientVatPrefix: template.vatPrefix,
        clientBankAccounts: template.bankAccounts || []
      };
      
      // Dacă are conturi bancare, setează primul cont ca default
      if (template.bankAccounts && template.bankAccounts.length > 0) {
        clientData.clientBank = template.bankAccounts[0].bank;
        clientData.clientIBAN = template.bankAccounts[0].iban;
      }
      
      onSelectClient(clientData);
    }
    
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: '70vh' } }}
    >
      <DialogTitle>
        Clienți
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {templates.length} {templates.length === 1 ? 'client salvat' : 'clienți salvați'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} pt={2}>
          {/* Filtre și căutare */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 9 }}>
              <TextField
                fullWidth
                size="small"
                label="Căutare clienți"
                placeholder="Nume, CUI, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Button
                variant={showFavorites ? 'contained' : 'outlined'}
                color="warning"
                startIcon={<StarIcon />}
                onClick={() => setShowFavorites(!showFavorites)}
                fullWidth
                size="medium"
              >
                Favorite
              </Button>
            </Grid>
          </Grid>

          {/* Formular adăugare/editare client */}
          {showAddForm ? (
            <Box sx={{ p: 2, bgcolor: editMode ? 'warning.50' : 'grey.50', borderRadius: 1, border: editMode ? '2px solid' : 'none', borderColor: editMode ? 'warning.main' : 'transparent' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                {editMode ? '✏️ Modifică client' : 'Adaugă client nou'}
              </Typography>
              <CompanyForm
                data={newClient}
                onChange={handleClientChange}
                onSearch={searchClientANAF}
                loading={loadingAnaf}
                type="client"
                showBankDetails={true}
                showTemplateButtons={false}
                onAddBankAccount={handleAddBankAccount}
                onRemoveBankAccount={handleRemoveBankAccount}
                onBankAccountChange={handleBankAccountChange}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                <Button variant="contained" onClick={handleAddClient} color={editMode ? 'warning' : 'primary'}>
                  {editMode ? 'Actualizează' : 'Salvează'}
                </Button>
                <Button onClick={handleCancelEdit}>
                  Anulează
                </Button>
              </Stack>
            </Box>
          ) : (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowAddForm(true)}
              fullWidth
            >
              Adaugă client nou în șabloane
            </Button>
          )}

          {/* Tabel template-uri */}
          {templates.length === 0 ? (
            <Alert severity="info">
              Nu există clienți salvați. {search ? 'Încearcă să modifici căutarea.' : 'Adaugă primul client!'}
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="30"></TableCell>
                    <TableCell><strong>Client</strong></TableCell>
                    <TableCell><strong>CUI</strong></TableCell>
                    <TableCell><strong>Oraș</strong></TableCell>
                    <TableCell align="center"><strong>Acțiuni</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow 
                      key={template.id}
                      hover
                      onClick={() => handleSelectClient(template)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(template.id);
                          }}
                        >
                          {template.isFavorite ? (
                            <StarIcon fontSize="small" color="warning" />
                          ) : (
                            <StarBorderIcon fontSize="small" />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={template.isFavorite ? 600 : 400}>
                          {template.name}
                        </Typography>
                        {template.email && (
                          <Typography variant="caption" color="text.secondary">
                            {template.email}
                          </Typography>
                        )}
                        {template.usageCount > 0 && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Folosit: {template.usageCount} {template.usageCount === 1 ? 'dată' : 'dăți'}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{template.cui || '-'}</TableCell>
                      <TableCell>{template.city || '-'}</TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          {onOpenProfile && (
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenProfile(template);
                                onClose();
                              }}
                              title="Vezi fișa client cu facturi"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(template);
                            }}
                            title="Modifică client"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(template.id);
                            }}
                            title="Șterge client"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Typography variant="caption" color="text.secondary">
            💡 Click pe un client pentru a completa automat datele în factură. Steluța marchează clienții favoriți.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Închide</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientTemplateDialog;

