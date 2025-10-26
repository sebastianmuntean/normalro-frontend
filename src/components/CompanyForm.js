import React from 'react';
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

// Lista județelor din România
const JUDETE_ROMANIA = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani',
  'Brăila', 'Brașov', 'București', 'Buzău', 'Călărași', 'Caraș-Severin',
  'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu',
  'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș',
  'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Sălaj', 'Satu Mare',
  'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vâlcea', 'Vaslui', 'Vrancea'
];

/**
 * Formular reutilizabil pentru date companie (Furnizor sau Beneficiar)
 * 
 * @param {object} data - Obiectul cu datele companiei
 * @param {function} onChange - Handler pentru modificări
 * @param {function} onSearch - Handler pentru căutare ANAF
 * @param {boolean} loading - Status loading pentru căutare ANAF
 * @param {string} type - Tipul formularului: 'supplier' sau 'client'
 * @param {boolean} showBankDetails - Afișează câmpuri bancare (IBAN, Bancă)
 * @param {boolean} showTemplateButtons - Afișează butoane pentru template-uri
 * @param {function} onTemplateSelect - Handler pentru selectare din template-uri
 * @param {function} onTemplateSave - Handler pentru salvare ca template
 * @param {function} onAddBankAccount - Handler pentru adăugare cont bancar
 * @param {function} onRemoveBankAccount - Handler pentru ștergere cont bancar
 * @param {function} onBankAccountChange - Handler pentru modificare cont bancar
 */
const CompanyForm = ({
  data,
  onChange,
  onSearch,
  loading = false,
  type = 'supplier', // 'supplier' sau 'client'
  showBankDetails = false,
  showTemplateButtons = false,
  onTemplateSelect,
  onTemplateSave,
  onAddBankAccount,
  onRemoveBankAccount,
  onBankAccountChange
}) => {
  const isSupplier = type === 'supplier';
  const prefix = isSupplier ? 'supplier' : 'client';
  
  const config = {
    supplier: {
      title: 'Furnizor',
      color: 'primary',
      bgcolor: 'primary.50',
      nameLabel: 'Nume companie *',
      cuiLabel: 'CUI *',
      cityPlaceholder: 'ex: Sibiu'
    },
    client: {
      title: 'Beneficiar',
      color: 'secondary',
      bgcolor: 'secondary.50',
      nameLabel: 'Nume companie / Persoană *',
      cuiLabel: 'CUI / CNP',
      cityPlaceholder: 'ex: București'
    }
  };

  const c = config[type];

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom color={c.color}>
          {c.title}
        </Typography>
        <Paper sx={{ p: 1, mb: 2, bgcolor: c.bgcolor, borderLeft: 3, borderColor: `${c.color}.main` }}>
          <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
            🔍 <strong>Auto-completare ANAF:</strong> Introdu CUI-ul și apasă pe 🔍 pentru date automate.
          </Typography>
        </Paper>
        <Stack spacing={1.5}>
          <TextField
            fullWidth
            size="small"
            label={c.nameLabel}
            value={data[`${prefix}Name`] || ''}
            onChange={onChange(`${prefix}Name`)}
          />
          <Grid container spacing={1}>
            <Grid size={{ xs: 2, sm: 1.5 }}>
              <Select
                fullWidth
                size="small"
                value={data[`${prefix}VatPrefix`] || '-'}
                onChange={onChange(`${prefix}VatPrefix`)}
                sx={{ 
                  '& .MuiSelect-select': { 
                    paddingLeft: 0.5,
                    paddingRight: 0.5,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'center'
                  } 
                }}
              >
                <MenuItem value="-">-</MenuItem>
                <MenuItem value="RO">RO</MenuItem>
              </Select>
            </Grid>
            <Grid size={{ xs: 10, sm: 4.5 }}>
              <TextField
                fullWidth
                size="small"
                label={c.cuiLabel}
                value={data[`${prefix}CUI`] || ''}
                onChange={onChange(`${prefix}CUI`)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={onSearch}
                        disabled={loading}
                        title="Caută în ANAF"
                      >
                        {loading ? <CircularProgress size={20} /> : <SearchIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Reg. Com."
                value={data[`${prefix}RegCom`] || ''}
                onChange={onChange(`${prefix}RegCom`)}
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            size="small"
            label="Adresă"
            value={data[`${prefix}Address`] || ''}
            onChange={onChange(`${prefix}Address`)}
          />
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Oraș"
                value={data[`${prefix}City`] || ''}
                onChange={onChange(`${prefix}City`)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Autocomplete
                freeSolo
                size="small"
                options={JUDETE_ROMANIA}
                value={data[`${prefix}County`] || ''}
                onChange={(event, newValue) => {
                  const syntheticEvent = {
                    target: { value: newValue || '' }
                  };
                  onChange(`${prefix}County`)(syntheticEvent);
                }}
                onInputChange={(event, newInputValue) => {
                  const syntheticEvent = {
                    target: { value: newInputValue }
                  };
                  onChange(`${prefix}County`)(syntheticEvent);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Județ"
                    placeholder={c.cityPlaceholder}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Țară"
                value={data[`${prefix}Country`] || ''}
                onChange={onChange(`${prefix}Country`)}
              />
            </Grid>
          </Grid>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Telefon"
                value={data[`${prefix}Phone`] || ''}
                onChange={onChange(`${prefix}Phone`)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Email"
                value={data[`${prefix}Email`] || ''}
                onChange={onChange(`${prefix}Email`)}
              />
            </Grid>
          </Grid>
          
          {showBankDetails && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                Conturi bancare
              </Typography>
              {data[`${prefix}BankAccounts`] && Array.isArray(data[`${prefix}BankAccounts`]) ? (
                // Mod dinamic - array de conturi
                <>
                  {data[`${prefix}BankAccounts`].map((account, index) => (
                    <Grid container spacing={1} key={index} sx={{ mb: 1 }}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label={`Bancă ${index + 1}`}
                          value={account.bank || ''}
                          onChange={(e) => onBankAccountChange && onBankAccountChange(index, 'bank', e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 10, sm: index === 0 ? 6 : 5.5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label={`IBAN ${index + 1}`}
                          value={account.iban || ''}
                          onChange={(e) => onBankAccountChange && onBankAccountChange(index, 'iban', e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 2, sm: index === 0 ? 2 : 1.5 }}>
                        <Select
                          fullWidth
                          size="small"
                          value={account.currency || 'RON'}
                          onChange={(e) => onBankAccountChange && onBankAccountChange(index, 'currency', e.target.value)}
                          sx={{ 
                            '& .MuiSelect-select': { 
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              textAlign: 'center',
                              paddingLeft: 0.5,
                              paddingRight: 2
                            } 
                          }}
                        >
                          <MenuItem value="RON">RON</MenuItem>
                          <MenuItem value="EUR">EUR</MenuItem>
                          <MenuItem value="USD">USD</MenuItem>
                          <MenuItem value="GBP">GBP</MenuItem>
                          <MenuItem value="CHF">CHF</MenuItem>
                        </Select>
                      </Grid>
                      {index > 0 && (
                        <Grid size={{ xs: 12, sm: 1 }} sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onRemoveBankAccount && onRemoveBankAccount(index)}
                            title="Șterge cont"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      )}
                    </Grid>
                  ))}
                  {onAddBankAccount && (
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={onAddBankAccount}
                      sx={{ mt: 1 }}
                    >
                      Adaugă cont bancar
                    </Button>
                  )}
                </>
              ) : (
                // Mod simplu - câmpuri unice pentru backward compatibility
                <>
                  <TextField
                    fullWidth
                    size="small"
                    label="Bancă"
                    value={data[`${prefix}Bank`] || ''}
                    onChange={onChange(`${prefix}Bank`)}
                    sx={{ mb: 1.5 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="IBAN"
                    value={data[`${prefix}IBAN`] || ''}
                    onChange={onChange(`${prefix}IBAN`)}
                  />
                </>
              )}
            </>
          )}

          {showTemplateButtons && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color={c.color}
                size="small"
                startIcon={<StarIcon />}
                onClick={onTemplateSelect}
                fullWidth
              >
                Beneficiari
              </Button>
              <Button
                variant="outlined"
                color="success"
                size="small"
                startIcon={<BookmarkAddIcon />}
                onClick={onTemplateSave}
                fullWidth
              >
                Salvează beneficiar
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CompanyForm;

