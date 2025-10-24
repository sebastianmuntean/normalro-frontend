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
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ToolLayout from '../../components/ToolLayout';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
  const [editingTotal, setEditingTotal] = useState(false);
  const [customTotal, setCustomTotal] = useState('');

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

      if (field === 'unitNetPrice' || field === 'vatRate') {
        const net = parseFloat(updated.unitNetPrice);
        const vat = parseFloat(updated.vatRate);
        if (!isNaN(net) && !isNaN(vat)) {
          const vatAmount = Math.round(net * vat * 10000) / 1000000;
          const gross = net + vatAmount;
          updated.unitGrossPrice = formatNumber(gross);
        }
      } else if (field === 'unitGrossPrice') {
        const gross = parseFloat(updated.unitGrossPrice);
        const vat = parseFloat(updated.vatRate);
        if (!isNaN(gross) && !isNaN(vat)) {
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

  const handleTotalEdit = () => {
    setEditingTotal(true);
    setCustomTotal(totals.gross);
  };

  const handleTotalChange = (e) => {
    setCustomTotal(e.target.value);
  };

  const applyCustomTotal = () => {
    const newTotal = parseFloat(customTotal);
    const currentTotal = parseFloat(totals.gross);
    
    if (isNaN(newTotal) || newTotal <= 0 || lines.length === 0) {
      setEditingTotal(false);
      return;
    }

    // Calculează diferența care trebuie distribuită
    const difference = newTotal - currentTotal;
    
    // Distribuie proporțional pe fiecare linie bazat pe totalul brut al liniei
    const updatedLines = lines.map(line => {
      const lineGross = parseFloat(calculateLineTotal(line, 'gross'));
      const lineProportion = lineGross / currentTotal;
      const lineAdjustment = difference * lineProportion;
      
      // Noul total brut al liniei
      const newLineGross = lineGross + lineAdjustment;
      
      // Calculează noul preț unitar brut
      const qty = parseFloat(line.quantity) || 1;
      const newUnitGross = newLineGross / qty;
      
      // Recalculează prețul net din noul preț brut
      const vat = parseFloat(line.vatRate);
      const newUnitNet = Math.round((newUnitGross / (1 + vat / 100)) * 10000) / 10000;
      
      return {
        ...line,
        unitNetPrice: formatNumber(newUnitNet),
        unitGrossPrice: formatNumber(newUnitGross)
      };
    });

    setLines(updatedLines);
    setEditingTotal(false);
    setCustomTotal('');
  };

  const cancelTotalEdit = () => {
    setEditingTotal(false);
    setCustomTotal('');
  };

  const exportToExcel = () => {
    // Pregătește datele pentru Excel
    const data = lines.map((line, index) => ({
      'Nr.': index + 1,
      'Produs': line.product || '-',
      'Cantitate': line.quantity,
      'Preț net': line.unitNetPrice,
      'TVA %': line.vatRate,
      'Suma TVA': calculateLineVat(line),
      'Preț brut': line.unitGrossPrice,
      'Total net': calculateLineTotal(line, 'net'),
      'Total TVA': calculateLineTotal(line, 'vat'),
      'Total brut': calculateLineTotal(line, 'gross')
    }));

    // Adaugă rând de total
    data.push({
      'Nr.': '',
      'Produs': 'TOTAL FACTURĂ',
      'Cantitate': '',
      'Preț net': '',
      'TVA %': '',
      'Suma TVA': '',
      'Preț brut': '',
      'Total net': totals.net,
      'Total TVA': totals.vat,
      'Total brut': totals.gross
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Factură');

    // Setează lățimile coloanelor
    worksheet['!cols'] = [
      { wch: 5 },  // Nr
      { wch: 25 }, // Produs
      { wch: 10 }, // Cantitate
      { wch: 12 }, // Preț net
      { wch: 8 },  // TVA %
      { wch: 12 }, // Suma TVA
      { wch: 12 }, // Preț brut
      { wch: 12 }, // Total net
      { wch: 12 }, // Total TVA
      { wch: 12 }  // Total brut
    ];

    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `factura_${date}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text('Factură - Detalii Linii', 14, 20);
    
    doc.setFontSize(10);
    const date = new Date().toLocaleDateString('ro-RO');
    doc.text(`Data: ${date}`, 14, 28);

    // Prepare table data
    const tableData = lines.map((line, index) => [
      index + 1,
      line.product || '-',
      line.quantity,
      line.unitNetPrice,
      `${line.vatRate}%`,
      calculateLineVat(line),
      line.unitGrossPrice,
      calculateLineTotal(line, 'net'),
      calculateLineTotal(line, 'vat'),
      calculateLineTotal(line, 'gross')
    ]);

    // Add table
    doc.autoTable({
      startY: 35,
      head: [['Nr.', 'Produs', 'Cant.', 'Net', 'TVA%', 'Suma TVA', 'Brut', 'Total Net', 'Total TVA', 'Total Brut']],
      body: tableData,
      foot: [['', 'TOTAL', '', '', '', '', '', totals.net, totals.vat, totals.gross]],
      theme: 'grid',
      headStyles: { fillColor: [33, 150, 243] },
      footStyles: { fillColor: [200, 200, 200], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 35 },
        2: { cellWidth: 15 },
        3: { cellWidth: 18 },
        4: { cellWidth: 12 },
        5: { cellWidth: 18 },
        6: { cellWidth: 18 },
        7: { cellWidth: 20 },
        8: { cellWidth: 20 },
        9: { cellWidth: 20 }
      }
    });

    doc.save(`factura_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <ToolLayout 
      title="Calculator Facturi TVA"
      description="Calculează rapid prețuri net, TVA și brut pentru linii de factură. Adaugă multiple linii și vezi totalul automat."
      maxWidth="lg"
      seoSlug="invoice-calculator"
    >
      <Stack spacing={2}>
        {/* Lines */}
        {lines.map((line, index) => (
          <Card key={line.id} variant="outlined">
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
                  Linia {index + 1}
                </Typography>
                {lines.length > 1 && (
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => deleteLine(line.id)}
                    title="Șterge linia"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={1} alignItems="flex-start">
                {/* Produs */}
                <Grid size={{ xs: 12, md: 4.3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Produs / Serviciu"
                    value={line.product}
                    onChange={(e) => updateLine(line.id, 'product', e.target.value)}
                    placeholder="Descriere"
                  />
                </Grid>

                {/* Cantitate */}
                <Grid size={{ xs: 12, md: 0.8 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Cantitate"
                    type="number"
                    value={line.quantity}
                    onChange={(e) => updateLine(line.id, 'quantity', e.target.value)}
                    InputProps={{
                      inputProps: { min: 0.01, step: 0.01 }
                    }}
                  />
                </Grid>

                {/* Preț net unitar */}
                <Grid size={{ xs: 12, md: 1.7 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Preț net unitar"
                    type="number"
                    value={line.unitNetPrice}
                    onChange={(e) => updateLine(line.id, 'unitNetPrice', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><Typography variant="caption" fontSize="0.7rem">RON</Typography></InputAdornment>,
                      inputProps: { min: 0, step: 0.01 }
                    }}
                    sx={{ bgcolor: 'grey.50' }}
                  />
                </Grid>

                {/* TVA % */}
                <Grid size={{ xs: 12, md: 1.0 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="TVA %"
                    type="number"
                    value={line.vatRate}
                    onChange={(e) => updateLine(line.id, 'vatRate', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><Typography variant="caption" fontSize="0.7rem">%</Typography></InputAdornment>,
                      inputProps: { min: 0, max: 100, step: 0.01 }
                    }}
                    sx={{ bgcolor: 'info.50' }}
                  />
                  <Stack direction="row" spacing={0.3} sx={{ mt: 0.5 }}>
                    {[21, 11, 0].map((rate) => (
                      <Box
                        key={rate}
                        onClick={() => updateLine(line.id, 'vatRate', rate.toString())}
                        sx={{
                          px: 0.7,
                          py: 0.2,
                          bgcolor: line.vatRate === rate.toString() ? 'info.main' : 'grey.200',
                          color: line.vatRate === rate.toString() ? 'white' : 'text.primary',
                          borderRadius: 0.5,
                          cursor: 'pointer',
                          fontSize: '0.65rem',
                          fontWeight: 500,
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

                {/* Suma TVA calculată */}
                <Grid size={{ xs: 12, md: 1.4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Suma TVA"
                    value={calculateLineVat(line)}
                    disabled
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><Typography variant="caption" fontSize="0.7rem">RON</Typography></InputAdornment>
                    }}
                    sx={{ 
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: '#1976d2',
                        fontWeight: 600
                      }
                    }}
                  />
                </Grid>

                {/* Preț brut unitar */}
                <Grid size={{ xs: 12, md: 2.8 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Preț brut unitar"
                    type="number"
                    value={line.unitGrossPrice}
                    onChange={(e) => updateLine(line.id, 'unitGrossPrice', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><Typography variant="caption" fontSize="0.7rem">RON</Typography></InputAdornment>,
                      inputProps: { min: 0, step: 0.01 }
                    }}
                    sx={{ bgcolor: 'success.50' }}
                  />
                </Grid>

                {/* Total linie - afișare compactă */}
                {parseFloat(line.quantity) > 1 && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ mt: 0.5, p: 0.8, bgcolor: 'grey.50', borderRadius: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        Total linie (× {line.quantity}): <strong>{calculateLineTotal(line, 'net')}</strong> + <strong style={{color: '#1976d2'}}>{calculateLineTotal(line, 'vat')}</strong> = <strong style={{color: '#2e7d32'}}>{calculateLineTotal(line, 'gross')} RON</strong>
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        ))}

        {/* Add Line Button */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={addLine}
          >
            Adaugă linie
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<PictureAsPdfIcon />}
            onClick={exportToPDF}
          >
            Export PDF
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<DescriptionIcon />}
            onClick={exportToExcel}
          >
            Export Excel
          </Button>
        </Stack>

        {/* Totals */}
        {lines.length >= 1 && (
          <Paper sx={{ p: 2.5, bgcolor: 'primary.50', borderLeft: 4, borderColor: 'primary.main' }}>
            <Typography variant="h6" gutterBottom color="primary" fontSize="1.1rem">
              Total Factură
            </Typography>
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <Typography variant="caption" color="text.secondary">Total net:</Typography>
                <Typography variant="h6" fontWeight="700">
                  {totals.net} RON
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography variant="caption" color="text.secondary">Total TVA:</Typography>
                <Typography variant="h6" fontWeight="700" color="info.main">
                  {totals.vat} RON
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography variant="caption" color="text.secondary">Total brut:</Typography>
                {editingTotal ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      size="small"
                      type="number"
                      value={customTotal}
                      onChange={handleTotalChange}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">RON</InputAdornment>,
                        inputProps: { min: 0, step: 0.01 }
                      }}
                      sx={{ maxWidth: 150 }}
                      autoFocus
                    />
                    <Button size="small" variant="contained" onClick={applyCustomTotal}>
                      OK
                    </Button>
                    <Button size="small" variant="text" onClick={cancelTotalEdit}>
                      ✕
                    </Button>
                  </Stack>
                ) : (
                  <Box>
                    <Typography 
                      variant="h5" 
                      fontWeight="800" 
                      color="success.dark"
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                      onClick={handleTotalEdit}
                      title="Click pentru a rotunji totalul"
                    >
                      {totals.gross} RON
                    </Typography>
                    <Typography variant="caption" color="text.disabled" fontSize="0.65rem">
                      (click pentru rotunjire)
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Info */}
        <Paper sx={{ p: 1.5, bgcolor: 'grey.50' }}>
          <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
            💡 <strong>Sfat:</strong> Modifică orice valoare (net, TVA% sau brut) și restul se actualizează automat.
            <br />
            📊 <strong>Rotunjire total:</strong> Click pe totalul brut pentru a-l rotunji. Diferența se distribuie proporțional pe toate liniile.
            <br />
            <strong>Cote TVA:</strong> 21% standard, 11% redus, 0% scutit.
          </Typography>
        </Paper>
      </Stack>
    </ToolLayout>
  );
};

export default InvoiceCalculator;
