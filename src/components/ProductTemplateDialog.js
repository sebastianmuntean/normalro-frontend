import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Box,
  Chip,
  InputAdornment,
  Alert,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import templateService from '../services/templateService';

const ProductTemplateDialog = ({ 
  open, 
  onClose, 
  onSelectProduct,
  categories = [],
  selectedCategory: propSelectedCategory = 'all',
  onCategoryChange
}) => {
  // Citește cota TVA implicită din .env (default: 21)
  const DEFAULT_VAT_RATE = process.env.REACT_APP_DEFAULT_TVA || '21';
  
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(propSelectedCategory);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  
  // Form state pentru adăugare produs
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: categories.length > 0 ? categories[0].id : null,
    purchasePrice: '',
    markup: '',
    unitNetPrice: '',
    vatRate: DEFAULT_VAT_RATE,
    description: '',
    defaultQuantity: '1'
  });

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, search, selectedCategory, showFavorites]);

  useEffect(() => {
    setSelectedCategory(propSelectedCategory);
  }, [propSelectedCategory]);

  const loadTemplates = () => {
    let result = templateService.getProductTemplates();
    
    // Filtrare după categorie
    if (selectedCategory !== 'all') {
      result = result.filter(t => t.category === selectedCategory);
    }
    
    // Filtrare după search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(t => 
        t.name?.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrare după favorite
    if (showFavorites) {
      result = result.filter(t => t.isFavorite);
    }
    
    setTemplates(result);
  };

  const handleDelete = (id) => {
    if (window.confirm('Sigur vrei să ștergi acest template?')) {
      templateService.deleteProductTemplate(id);
      loadTemplates();
    }
  };

  const handleToggleFavorite = (id) => {
    templateService.toggleProductFavorite(id);
    loadTemplates();
  };

  const handleStartEdit = (template) => {
    setNewProduct({
      name: template.name || '',
      category: template.category || (categories.length > 0 ? categories[0].id : null),
      purchasePrice: template.purchasePrice || '',
      markup: template.markup || '',
      unitNetPrice: template.unitNetPrice || '',
      vatRate: template.vatRate || DEFAULT_VAT_RATE,
      description: template.description || '',
      defaultQuantity: template.defaultQuantity || '1'
    });
    setEditingProductId(template.id);
    setEditMode(true);
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setNewProduct({
      name: '',
      category: categories.length > 0 ? categories[0].id : null,
      purchasePrice: '',
      markup: '',
      unitNetPrice: '',
      vatRate: DEFAULT_VAT_RATE,
      description: '',
      defaultQuantity: '1'
    });
    setShowAddForm(false);
    setEditMode(false);
    setEditingProductId(null);
  };

  const handleAddProduct = () => {
    if (!newProduct.name) {
      alert('Introdu denumirea produsului!');
      return;
    }

    const netPrice = parseFloat(newProduct.unitNetPrice) || 0;
    const vat = parseFloat(newProduct.vatRate) || 0;
    const grossPrice = netPrice * (1 + vat / 100);

    const productToSave = {
      ...newProduct,
      purchasePrice: newProduct.purchasePrice || '0.00',
      markup: newProduct.markup || '0.00',
      unitGrossPrice: grossPrice.toFixed(2)
    };

    if (editMode && editingProductId) {
      // Modifică produs existent
      templateService.updateProductTemplate(editingProductId, productToSave);
    } else {
      // Adaugă produs nou
      templateService.saveProductTemplate(productToSave);
    }

    // Reset form
    setNewProduct({
      name: '',
      category: categories.length > 0 ? categories[0].id : null,
      purchasePrice: '',
      markup: '',
      unitNetPrice: '',
      vatRate: DEFAULT_VAT_RATE,
      description: '',
      defaultQuantity: '1'
    });

    setShowAddForm(false);
    setEditMode(false);
    setEditingProductId(null);
    loadTemplates();
  };

  const handleSelectProduct = (template) => {
    templateService.incrementProductUsage(template.id);
    
    if (onSelectProduct) {
      onSelectProduct({
        product: template.name,
        quantity: template.defaultQuantity || '1',
        purchasePrice: template.purchasePrice || '0.00',
        markup: template.markup || '0.00',
        unitNetPrice: template.unitNetPrice,
        vatRate: template.vatRate,
        unitGrossPrice: template.unitGrossPrice
      });
    }
    
    onClose();
  };

  const handleExportTemplates = () => {
    const data = templateService.exportAllTemplates();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template-uri_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImportTemplates = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (window.confirm('Importul va înlocui template-urile existente. Continui?')) {
          templateService.importTemplates(data);
          loadTemplates();
          alert('Template-uri importate cu succes!');
        }
      } catch (error) {
        alert('Eroare la citirea fișierului: ' + error.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    if (onCategoryChange) {
      onCategoryChange(newCategory);
    }
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
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>Produse/Servicii</Box>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportTemplates}
            >
              Export
            </Button>
            <Button
              size="small"
              component="label"
              startIcon={<FileUploadIcon />}
            >
              Import
              <input
                type="file"
                hidden
                accept=".json"
                onChange={handleImportTemplates}
              />
            </Button>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} pt={2}>
          {/* Filtre și căutare */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Căutare"
                placeholder="Nume, descriere..."
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
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Categorie</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  label="Categorie"
                >
                  <MenuItem value="all">Toate categoriile</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
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

          {/* Formular adăugare produs */}
          {showAddForm ? (
            <Paper sx={{ p: 2, bgcolor: editMode ? 'warning.50' : 'success.lighter', border: editMode ? '2px solid' : 'none', borderColor: editMode ? 'warning.main' : 'transparent' }}>
              <Typography variant="h6" gutterBottom>
                {editMode ? '✏️ Modifică produs/serviciu' : 'Adaugă produs/serviciu nou'}
              </Typography>
              <Grid container spacing={2} sx={{ pt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Denumire *"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Categorie</InputLabel>
                    <Select
                      value={newProduct.category || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      label="Categorie"
                    >
                      {categories.length === 0 ? (
                        <MenuItem value="" disabled>
                          Creează mai întâi o categorie
                        </MenuItem>
                      ) : (
                        categories.map(cat => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Preț intrare"
                    type="number"
                    value={newProduct.purchasePrice}
                    onChange={(e) => {
                      const purchasePrice = e.target.value;
                      const markup = parseFloat(newProduct.markup) || 0;
                      let unitNetPrice = newProduct.unitNetPrice;
                      
                      // Calculează automat prețul net dacă există preț intrare și adaos
                      if (parseFloat(purchasePrice) > 0 && markup >= 0) {
                        unitNetPrice = (parseFloat(purchasePrice) * (1 + markup / 100)).toFixed(2);
                      }
                      
                      setNewProduct({ 
                        ...newProduct, 
                        purchasePrice,
                        unitNetPrice 
                      });
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">💰</InputAdornment>
                    }}
                    helperText="Cost achiziție"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Adaos %"
                    type="number"
                    value={newProduct.markup}
                    onChange={(e) => {
                      const markup = e.target.value;
                      const purchasePrice = parseFloat(newProduct.purchasePrice) || 0;
                      let unitNetPrice = newProduct.unitNetPrice;
                      
                      // Calculează automat prețul net dacă există preț intrare și adaos
                      if (purchasePrice > 0 && parseFloat(markup) >= 0) {
                        unitNetPrice = (purchasePrice * (1 + parseFloat(markup) / 100)).toFixed(2);
                      }
                      
                      setNewProduct({ 
                        ...newProduct, 
                        markup,
                        unitNetPrice 
                      });
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                    helperText="Marjă profit"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Preț net"
                    type="number"
                    value={newProduct.unitNetPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, unitNetPrice: e.target.value })}
                    helperText={
                      parseFloat(newProduct.purchasePrice) > 0 && parseFloat(newProduct.markup) > 0
                        ? `Auto: ${newProduct.purchasePrice} + ${newProduct.markup}%`
                        : 'Preț vânzare'
                    }
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="TVA %"
                    type="number"
                    value={newProduct.vatRate}
                    onChange={(e) => setNewProduct({ ...newProduct, vatRate: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Cant. implicită"
                    type="number"
                    value={newProduct.defaultQuantity}
                    onChange={(e) => setNewProduct({ ...newProduct, defaultQuantity: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={9}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Descriere (opțional)"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" onClick={handleAddProduct} color={editMode ? 'warning' : 'primary'}>
                      {editMode ? 'Actualizează' : 'Salvează'}
                    </Button>
                    <Button onClick={handleCancelEdit}>
                      Anulează
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          ) : (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowAddForm(true)}
              fullWidth
            >
              Adaugă produs/serviciu
            </Button>
          )}

          {/* Tabel template-uri */}
          {templates.length === 0 ? (
            <Alert severity="info">
              Nu există produse/servicii salvate. {search || selectedCategory !== 'all' ? 'Încearcă să modifici filtrele.' : 'Adaugă primul produs/serviciu!'}
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="30"></TableCell>
                    <TableCell><strong>Produs/Serviciu</strong></TableCell>
                    <TableCell><strong>Categorie</strong></TableCell>
                    <TableCell align="right"><strong>Preț Intrare</strong></TableCell>
                    <TableCell align="right"><strong>Adaos%</strong></TableCell>
                    <TableCell align="right"><strong>Preț Net</strong></TableCell>
                    <TableCell align="right"><strong>TVA%</strong></TableCell>
                    <TableCell align="right"><strong>Preț Brut</strong></TableCell>
                    <TableCell align="center"><strong>Acțiuni</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow 
                      key={template.id}
                      hover
                      onClick={() => handleSelectProduct(template)}
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
                        {template.description && (
                          <Typography variant="caption" color="text.secondary">
                            {template.description}
                          </Typography>
                        )}
                        {template.usageCount > 0 && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Folosit: {template.usageCount} {template.usageCount === 1 ? 'dată' : 'dăți'}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const category = categories.find(c => c.id === template.category);
                          if (category) {
                            return (
                              <Chip 
                                label={`${category.icon} ${category.name}`} 
                                size="small" 
                                sx={{ 
                                  bgcolor: category.color + '20',
                                  color: category.color,
                                  borderColor: category.color
                                }}
                                variant="outlined" 
                              />
                            );
                          }
                          return <Chip label="Fără categorie" size="small" variant="outlined" />;
                        })()}
                      </TableCell>
                      <TableCell align="right">
                        {template.purchasePrice && parseFloat(template.purchasePrice) > 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            {template.purchasePrice}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {template.markup && parseFloat(template.markup) > 0 ? (
                          <Chip 
                            label={`${template.markup}%`} 
                            size="small" 
                            color="info" 
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="caption" color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">{template.unitNetPrice}</TableCell>
                      <TableCell align="right">{template.vatRate}%</TableCell>
                      <TableCell align="right">{template.unitGrossPrice}</TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(template);
                            }}
                            title="Modifică produs"
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
                            title="Șterge produs"
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
            💡 Click pe un produs/serviciu pentru a-l adăuga în factură. Steluța marchează produsele favorite.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Închide</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductTemplateDialog;

