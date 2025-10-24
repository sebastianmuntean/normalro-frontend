import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ToolLayout from '../../components/ToolLayout';

const InvoiceCalculator = () => {
  const [lines, setLines] = useState([
    { 
      id: 1, 
      product: '', 
      quantity: '1',
      unitNetPrice: '100.00', 
      vatRate: '21', 
      unitGrossPrice: '121.00' 
    }
  ]);

  const formatNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const addLine = () => {
    const newId = Math.max(...lines.map(l => l.id)) + 1;
    setLines([...lines, { 
      id: newId,
      product: '',
      quantity: '1',
      unitNetPrice: '0.00', 
      vatRate: '21', 
      unitGrossPrice: '0.00' 
    }]);
  };

  const deleteLine = (id) => {
    if (lines.length > 1) {
      setLines(lines.filter(line => line.id !== id));
    }
  };

  const updateLine = (id, field, value) => {
    setLines(lines.map(line => {
      if (line.id !== id) return line;

      const updated = { ...line, [field]: value };

      // Calculăm doar dacă se schimbă preț sau TVA, nu și la schimbarea produsului sau cantității
      if (field === 'unitNetPrice' || field === 'vatRate') {
        const net = parseFloat(updated.unitNetPrice);
        const vat = parseFloat(updated.vatRate);
        if (!isNaN(net) && !isNaN(vat)) {
          // Calculăm cu 4 zecimale de precizie
          const vatAmount = Math.round(net * vat * 10000) / 1000000;
          const gross = net + vatAmount;
          updated.unitGrossPrice = formatNumber(gross);
        }
      } else if (field === 'unitGrossPrice') {
        const gross = parseFloat(updated.unitGrossPrice);
        const vat = parseFloat(updated.vatRate);
        if (!isNaN(gross) && !isNaN(vat)) {
          // Calculăm net cu 4 zecimale de precizie
          const net = Math.round((gross / (1 + vat / 100)) * 10000) / 10000;
          updated.unitNetPrice = formatNumber(net);
        }
      }

      return updated;
    }));
  };

  const calculateLineVat = (line) => {
    const net = parseFloat(line.unitNetPrice);
    const vat = parseFloat(line.vatRate);
    if (!isNaN(net) && !isNaN(vat)) {
      const vatAmount = Math.round(net * vat * 10000) / 1000000;
      return vatAmount.toFixed(2);
    }
    return '0.00';
  };

  const calculateLineTotal = (line, type) => {
    const qty = parseFloat(line.quantity) || 0;
    
    if (type === 'net') {
      const net = parseFloat(line.unitNetPrice) || 0;
      return (net * qty).toFixed(2);
    } else if (type === 'vat') {
      const vat = parseFloat(calculateLineVat(line)) || 0;
      return (vat * qty).toFixed(2);
    } else if (type === 'gross') {
      const gross = parseFloat(line.unitGrossPrice) || 0;
      return (gross * qty).toFixed(2);
    }
    return '0.00';
  };

  const calculateTotals = () => {
    let totalNet = 0;
    let totalVat = 0;
    let totalGross = 0;

    lines.forEach(line => {
      // Adunăm totalurile calculate pe fiecare linie
      totalNet += parseFloat(calculateLineTotal(line, 'net')) || 0;
      totalVat += parseFloat(calculateLineTotal(line, 'vat')) || 0;
      totalGross += parseFloat(calculateLineTotal(line, 'gross')) || 0;
    });

    return {
      net: totalNet.toFixed(2),
      vat: totalVat.toFixed(2),
      gross: totalGross.toFixed(2)
    };
  };

  const totals = calculateTotals();

  return (
    <ToolLayout 
      title="Calculator Facturi TVA"
      description="Calculează rapid prețuri net, TVA și brut pentru linii de factură. Adaugă multiple linii și vezi totalul automat."
      maxWidth="lg"
      seoSlug="invoice-calculator"
    >
      <Stack spacing={3}>
        {/* Lines */}
        {lines.map((line, index) => (
          <Card key={line.id} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="600">
                  Linia {index + 1}
                </Typography>
                {lines.length > 1 && (
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => deleteLine(line.id)}
                    title="Șterge linia"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={1.5} alignItems="flex-start">
                {/* Produs */}
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Produs"
                    value={line.product}
                    onChange={(e) => updateLine(line.id, 'product', e.target.value)}
                    placeholder="Descriere"
                  />
                </Grid>

                {/* Cantitate */}
                <Grid item xs={4} md={1.2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Cant."
                    type="number"
                    value={line.quantity}
                    onChange={(e) => updateLine(line.id, 'quantity', e.target.value)}
                    InputProps={{
                      inputProps: { min: 0.01, step: 0.01 }
                    }}
                  />
                </Grid>

                {/* Preț net unitar */}
                <Grid item xs={4} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Net"
                    type="number"
                    value={line.unitNetPrice}
                    onChange={(e) => updateLine(line.id, 'unitNetPrice', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><Typography variant="caption">RON</Typography></InputAdornment>,
                      inputProps: { min: 0, step: 0.01 }
                    }}
                    sx={{ bgcolor: 'grey.50' }}
                  />
                </Grid>

                {/* TVA */}
                <Grid item xs={4} md={2.8}>
                  <TextField
                    fullWidth
                    size="small"
                    label="TVA"
                    type="number"
                    value={line.vatRate}
                    onChange={(e) => updateLine(line.id, 'vatRate', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><Typography variant="caption">%</Typography></InputAdornment>,
                      inputProps: { min: 0, max: 100, step: 0.01 }
                    }}
                    sx={{ bgcolor: 'info.50' }}
                  />
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                    {[21, 11, 0].map((rate) => (
                      <Box
                        key={rate}
                        onClick={() => updateLine(line.id, 'vatRate', rate.toString())}
                        sx={{
                          px: 1,
                          py: 0.3,
                          bgcolor: line.vatRate === rate.toString() ? 'info.main' : 'grey.200',
                          color: line.vatRate === rate.toString() ? 'white' : 'text.primary',
                          borderRadius: 0.5,
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: line.vatRate === rate.toString() ? 'info.dark' : 'grey.300',
                          }
                        }}
                      >
                        {rate}%
                      </Box>
                    ))}
                  </Stack>
                </Grid>

                {/* Preț brut unitar */}
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Brut"
                    type="number"
                    value={line.unitGrossPrice}
                    onChange={(e) => updateLine(line.id, 'unitGrossPrice', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><Typography variant="caption">RON</Typography></InputAdornment>,
                      inputProps: { min: 0, step: 0.01 }
                    }}
                    sx={{ bgcolor: 'success.50' }}
                  />
                </Grid>
              </Grid>

              {/* Line totals */}
              <Box sx={{ mt: 1.5, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Stack direction="row" spacing={3} justifyContent="space-around">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total net:</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {calculateLineTotal(line, 'net')} RON
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">TVA:</Typography>
                    <Typography variant="body2" fontWeight="600" color="info.main">
                      {calculateLineTotal(line, 'vat')} RON
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total brut:</Typography>
                    <Typography variant="body2" fontWeight="600" color="success.dark">
                      {calculateLineTotal(line, 'gross')} RON
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        ))}

        {/* Add Line Button */}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addLine}
          sx={{ alignSelf: 'flex-start' }}
        >
          Adaugă linie
        </Button>

        {/* Totals */}
        {lines.length >= 1 && (
          <Paper sx={{ p: 3, bgcolor: 'primary.50', borderLeft: 4, borderColor: 'primary.main' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Total Factură
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Total net:</Typography>
                <Typography variant="h6" fontWeight="700">
                  {totals.net} RON
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Total TVA:</Typography>
                <Typography variant="h6" fontWeight="700" color="info.main">
                  {totals.vat} RON
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Total brut:</Typography>
                <Typography variant="h5" fontWeight="800" color="success.dark">
                  {totals.gross} RON
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Info */}
        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="body2" color="text.secondary">
            💡 <strong>Sfat:</strong> Modifică orice valoare (net, TVA% sau brut) și restul se actualizează automat. Totalul pe linie = Preț unitar × Cantitate.
            <br />
            <strong>Cote TVA:</strong> 21% standard, 11% redus, 0% scutit.
          </Typography>
        </Paper>
      </Stack>
    </ToolLayout>
  );
};

export default InvoiceCalculator;
