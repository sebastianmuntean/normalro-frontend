import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
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
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import ToolLayout from '../../components/ToolLayout';
import { getCompanyDataByCUI } from '../../services/anafService';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

const InvoiceGenerator = () => {
  const [loadingSupplier, setLoadingSupplier] = useState(false);
  const [loadingClient, setLoadingClient] = useState(false);
  const [anafError, setAnafError] = useState('');
  
  const [invoiceData, setInvoiceData] = useState({
    // Date factură
    series: '',
    number: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    
    // Furnizor
    supplierName: '',
    supplierCUI: '',
    supplierRegCom: '',
    supplierAddress: '',
    supplierCity: '',
    supplierPhone: '',
    supplierEmail: '',
    supplierBank: '',
    supplierIBAN: '',
    
    // Beneficiar
    clientName: '',
    clientCUI: '',
    clientRegCom: '',
    clientAddress: '',
    clientCity: '',
    clientPhone: '',
    clientEmail: ''
  });

  const [lines, setLines] = useState([
    {
      id: 1,
      product: '',
      quantity: '1',
      unitNetPrice: '0.00',
      vatRate: '21',
      unitGrossPrice: '0.00'
    }
  ]);

  const formatNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const handleInvoiceChange = (field) => (e) => {
    setInvoiceData({ ...invoiceData, [field]: e.target.value });
    setAnafError('');
  };

  const searchSupplierANAF = async () => {
    if (!invoiceData.supplierCUI) {
      setAnafError('Introduceți CUI-ul furnizorului');
      return;
    }

    setLoadingSupplier(true);
    setAnafError('');

    try {
      const result = await getCompanyDataByCUI(invoiceData.supplierCUI);

      if (result.success) {
        setInvoiceData(prev => ({
          ...prev,
          supplierName: result.data.denumire,
          supplierCUI: result.data.cui,
          supplierRegCom: result.data.nrRegCom,
          supplierAddress: result.data.adresaCompleta,
          supplierCity: result.data.oras,
          supplierPhone: result.data.telefon
        }));
      } else {
        setAnafError(result.error || 'Nu s-au găsit date ANAF');
      }
    } catch (error) {
      setAnafError('Eroare la apelarea serviciului ANAF');
    } finally {
      setLoadingSupplier(false);
    }
  };

  const searchClientANAF = async () => {
    if (!invoiceData.clientCUI) {
      setAnafError('Introduceți CUI-ul beneficiarului');
      return;
    }

    setLoadingClient(true);
    setAnafError('');

    try {
      const result = await getCompanyDataByCUI(invoiceData.clientCUI);

      if (result.success) {
        setInvoiceData(prev => ({
          ...prev,
          clientName: result.data.denumire,
          clientCUI: result.data.cui,
          clientRegCom: result.data.nrRegCom,
          clientAddress: result.data.adresaCompleta,
          clientCity: result.data.oras,
          clientPhone: result.data.telefon
        }));
      } else {
        setAnafError(result.error || 'Nu s-au găsit date ANAF');
      }
    } catch (error) {
      setAnafError('Eroare la apelarea serviciului ANAF');
    } finally {
      setLoadingClient(false);
    }
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
      } else if (field === 'lineTotalGross') {
        // Când se editează totalul brut per linie
        const totalGross = parseFloat(value);
        const quantity = parseFloat(updated.quantity);
        const vat = parseFloat(updated.vatRate);
        
        if (!isNaN(totalGross) && !isNaN(quantity) && quantity > 0 && !isNaN(vat)) {
          // Calculează preț brut unitar = Total Brut / Cantitate
          const unitGross = totalGross / quantity;
          updated.unitGrossPrice = formatNumber(unitGross);
          
          // Recalculează preț net unitar
          const unitNet = Math.round((unitGross / (1 + vat / 100)) * 10000) / 10000;
          updated.unitNetPrice = formatNumber(unitNet);
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

  const exportToPDF = async () => {
    // Creează un element temporar cu factura HTML (cu diacritice corecte!)
    const invoiceElement = document.createElement('div');
    invoiceElement.style.position = 'absolute';
    invoiceElement.style.left = '-9999px';
    invoiceElement.style.width = '800px';
    invoiceElement.style.padding = '40px';
    invoiceElement.style.backgroundColor = 'white';
    invoiceElement.style.fontFamily = 'Arial, sans-serif';

    // Construiește HTML-ul facturii
    invoiceElement.innerHTML = `
      <div style="font-family: Arial, sans-serif; font-size: 11px;">
        <h1 style="text-align: center; font-size: 24px; margin: 0 0 15px 0;">FACTURĂ</h1>
        <div style="text-align: center; margin-bottom: 25px; font-size: 11px;">
          <div>Seria: ${invoiceData.series || '-'} Nr: ${invoiceData.number || '-'}</div>
          <div>Data: ${invoiceData.issueDate || '-'}</div>
          ${invoiceData.dueDate ? `<div>Scadență: ${invoiceData.dueDate}</div>` : ''}
        </div>
        
        <table style="width: 100%; margin-bottom: 25px; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 15px;">
              <strong style="font-size: 12px;">FURNIZOR:</strong><br/>
              <div style="margin-top: 5px; line-height: 1.6;">
                ${invoiceData.supplierName || '-'}<br/>
                CUI: ${invoiceData.supplierCUI || '-'}<br/>
                ${invoiceData.supplierRegCom ? `Reg Com: ${invoiceData.supplierRegCom}<br/>` : ''}
                ${invoiceData.supplierAddress || '-'}<br/>
                ${invoiceData.supplierCity || '-'}
              </div>
            </td>
            <td style="width: 50%; vertical-align: top; padding-left: 15px;">
              <strong style="font-size: 12px;">BENEFICIAR:</strong><br/>
              <div style="margin-top: 5px; line-height: 1.6;">
                ${invoiceData.clientName || '-'}<br/>
                CUI: ${invoiceData.clientCUI || '-'}<br/>
                ${invoiceData.clientRegCom ? `Reg Com: ${invoiceData.clientRegCom}<br/>` : ''}
                ${invoiceData.clientAddress || '-'}<br/>
                ${invoiceData.clientCity || '-'}
              </div>
            </td>
          </tr>
        </table>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #2196F3; color: white;">
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">Nr.</th>
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">Produs/Serviciu</th>
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">Cant.</th>
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">Preț Net</th>
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">TVA%</th>
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">Suma TVA</th>
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">Preț Brut</th>
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">Total Net</th>
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">Total TVA</th>
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">Total Brut</th>
            </tr>
          </thead>
          <tbody>
            ${lines.map((line, index) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 9px;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 6px; font-size: 9px;">${line.product || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 9px;">${line.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${line.unitNetPrice} RON</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 9px;">${line.vatRate}%</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${calculateLineVat(line)} RON</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${line.unitGrossPrice} RON</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${calculateLineTotal(line, 'net')} RON</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${calculateLineTotal(line, 'vat')} RON</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${calculateLineTotal(line, 'gross')} RON</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f5f5f5; font-weight: bold;">
              <td colspan="7" style="border: 1px solid #ddd; padding: 8px; font-size: 11px; font-weight: bold;">TOTAL FACTURĂ</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 11px; font-weight: bold;">${totals.net} RON</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 11px; font-weight: bold;">${totals.vat} RON</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 11px; font-weight: bold;">${totals.gross} RON</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
    
    document.body.appendChild(invoiceElement);
    
    try {
      // Convertește HTML-ul la canvas/imagine
      const canvas = await html2canvas(invoiceElement, {
        scale: 2, // Calitate mai bună (2x resolution)
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Creează PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 72 / 96; // Adjust for DPI
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Salvează PDF
      pdf.save(`factura_${invoiceData.series || 'X'}_${invoiceData.number || '000'}_${invoiceData.issueDate}.pdf`);
      
    } finally {
      // Șterge elementul temporar
      document.body.removeChild(invoiceElement);
    }
  };

  const exportToExcel = () => {
    const data = lines.map((line, index) => ({
      'Nr.': index + 1,
      'Produs/Serviciu': line.product || '-',
      'Cantitate': line.quantity,
      'Preț net unitar': line.unitNetPrice,
      'TVA %': line.vatRate,
      'Suma TVA': calculateLineVat(line),
      'Preț brut unitar': line.unitGrossPrice,
      'Total net': calculateLineTotal(line, 'net'),
      'Total TVA': calculateLineTotal(line, 'vat'),
      'Total brut': calculateLineTotal(line, 'gross')
    }));

    data.push({
      'Nr.': '',
      'Produs/Serviciu': 'TOTAL FACTURĂ',
      'Cantitate': '',
      'Preț net unitar': '',
      'TVA %': '',
      'Suma TVA': '',
      'Preț brut unitar': '',
      'Total net': totals.net,
      'Total TVA': totals.vat,
      'Total brut': totals.gross
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Factură');

    worksheet['!cols'] = [
      { wch: 5 }, { wch: 30 }, { wch: 10 }, { wch: 15 }, { wch: 8 },
      { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];

    XLSX.writeFile(workbook, `factura_${invoiceData.series || 'X'}_${invoiceData.number || '000'}_${invoiceData.issueDate}.xlsx`);
  };

  return (
    <ToolLayout
      title="Generator Factură Completă"
      description="Creează facturi complete cu detalii furnizor, beneficiar și linii de produse. Exportă în PDF sau Excel."
      maxWidth="xl"
      seoSlug="invoice-generator"
    >
      <Stack spacing={3}>
        {/* Eroare ANAF */}
        {anafError && (
          <Alert severity="error" onClose={() => setAnafError('')}>
            {anafError}
          </Alert>
        )}

        {/* Date factură */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Date factură
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Serie"
                  value={invoiceData.series}
                  onChange={handleInvoiceChange('series')}
                  placeholder="ex: FAC"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Număr"
                  value={invoiceData.number}
                  onChange={handleInvoiceChange('number')}
                  placeholder="ex: 001"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Data emiterii"
                  type="date"
                  value={invoiceData.issueDate}
                  onChange={handleInvoiceChange('issueDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Data scadenței"
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={handleInvoiceChange('dueDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Furnizor și Beneficiar */}
        <Grid container spacing={2}>
          {/* Furnizor */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Furnizor
                </Typography>
                <Paper sx={{ p: 1, mb: 2, bgcolor: 'info.50', borderLeft: 3, borderColor: 'info.main' }}>
                  <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                    🔍 <strong>Auto-completare ANAF:</strong> Introdu CUI-ul și apasă pe 🔍 pentru a prelua automat datele companiei din registrul ANAF.
                  </Typography>
                </Paper>
                <Stack spacing={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nume companie *"
                    value={invoiceData.supplierName}
                    onChange={handleInvoiceChange('supplierName')}
                  />
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="CUI *"
                        value={invoiceData.supplierCUI}
                        onChange={handleInvoiceChange('supplierCUI')}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                onClick={searchSupplierANAF}
                                disabled={loadingSupplier}
                                title="Caută în ANAF"
                              >
                                {loadingSupplier ? <CircularProgress size={20} /> : <SearchIcon />}
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
                        value={invoiceData.supplierRegCom}
                        onChange={handleInvoiceChange('supplierRegCom')}
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    fullWidth
                    size="small"
                    label="Adresă"
                    value={invoiceData.supplierAddress}
                    onChange={handleInvoiceChange('supplierAddress')}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Oraș"
                    value={invoiceData.supplierCity}
                    onChange={handleInvoiceChange('supplierCity')}
                  />
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Telefon"
                        value={invoiceData.supplierPhone}
                        onChange={handleInvoiceChange('supplierPhone')}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Email"
                        value={invoiceData.supplierEmail}
                        onChange={handleInvoiceChange('supplierEmail')}
                      />
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 1 }} />
                  <TextField
                    fullWidth
                    size="small"
                    label="Bancă"
                    value={invoiceData.supplierBank}
                    onChange={handleInvoiceChange('supplierBank')}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="IBAN"
                    value={invoiceData.supplierIBAN}
                    onChange={handleInvoiceChange('supplierIBAN')}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Beneficiar */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="secondary">
                  Beneficiar
                </Typography>
                <Paper sx={{ p: 1, mb: 2, bgcolor: 'secondary.50', borderLeft: 3, borderColor: 'secondary.main' }}>
                  <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                    🔍 <strong>Auto-completare ANAF:</strong> Introdu CUI-ul și apasă pe 🔍 pentru date automate.
                  </Typography>
                </Paper>
                <Stack spacing={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nume companie / Persoană *"
                    value={invoiceData.clientName}
                    onChange={handleInvoiceChange('clientName')}
                  />
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="CUI / CNP"
                        value={invoiceData.clientCUI}
                        onChange={handleInvoiceChange('clientCUI')}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                onClick={searchClientANAF}
                                disabled={loadingClient}
                                title="Caută în ANAF"
                              >
                                {loadingClient ? <CircularProgress size={20} /> : <SearchIcon />}
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
                        value={invoiceData.clientRegCom}
                        onChange={handleInvoiceChange('clientRegCom')}
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    fullWidth
                    size="small"
                    label="Adresă"
                    value={invoiceData.clientAddress}
                    onChange={handleInvoiceChange('clientAddress')}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Oraș"
                    value={invoiceData.clientCity}
                    onChange={handleInvoiceChange('clientCity')}
                  />
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Telefon"
                        value={invoiceData.clientPhone}
                        onChange={handleInvoiceChange('clientPhone')}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Email"
                        value={invoiceData.clientEmail}
                        onChange={handleInvoiceChange('clientEmail')}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Linii factură */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Linii factură
            </Typography>

            {lines.map((line, index) => (
              <Box key={line.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight="600">
                    Linia {index + 1}
                  </Typography>
                  {lines.length > 1 && (
                    <IconButton size="small" color="error" onClick={() => deleteLine(line.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, md: 3.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Produs / Serviciu"
                      value={line.product}
                      onChange={(e) => updateLine(line.id, 'product', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4, md: 1.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Cantitate"
                      type="number"
                      value={line.quantity}
                      onChange={(e) => updateLine(line.id, 'quantity', e.target.value)}
                      InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Preț net"
                      type="number"
                      value={line.unitNetPrice}
                      onChange={(e) => updateLine(line.id, 'unitNetPrice', e.target.value)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">RON</InputAdornment>,
                        inputProps: { min: 0, step: 0.01 }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4, md: 1.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="TVA"
                      type="number"
                      value={line.vatRate}
                      onChange={(e) => updateLine(line.id, 'vatRate', e.target.value)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        inputProps: { min: 0, max: 100, step: 0.01 }
                      }}
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
                            transition: 'all 0.2s'
                          }}
                        >
                          {rate}%
                        </Box>
                      ))}
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 3.5 }}>
                    <Typography variant="caption" color="text.secondary">Total linie:</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {calculateLineTotal(line, 'net')} + {calculateLineTotal(line, 'vat')} = <span style={{ color: '#2e7d32' }}>{calculateLineTotal(line, 'gross')} RON</span>
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={addLine}
            >
              Adaugă linie
            </Button>
          </CardContent>
        </Card>

        {/* Totaluri și Export */}
        <Paper sx={{ p: 3, bgcolor: 'primary.50', borderLeft: 4, borderColor: 'primary.main' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Factură
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total net:</Typography>
                  <Typography fontWeight="700">{totals.net} RON</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total TVA:</Typography>
                  <Typography fontWeight="700" color="info.main">{totals.vat} RON</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total brut:</Typography>
                  <Typography variant="h5" fontWeight="800" color="success.dark">{totals.gross} RON</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={exportToPDF}
                  fullWidth
                >
                  Descarcă PDF
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<DescriptionIcon />}
                  onClick={exportToExcel}
                  fullWidth
                >
                  Descarcă Excel
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Info */}
        <Paper sx={{ p: 1.5, bgcolor: 'grey.50' }}>
          <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
            💡 <strong>Sfat:</strong> Completează toate detaliile și apasă pe unul din butoanele de descărcare pentru a genera factura.
            <br />
            🔍 <strong>Căutare ANAF:</strong> Introdu CUI-ul și apasă pe iconița de căutare (🔍) pentru a completa automat datele companiei din registrul ANAF.
            <br />
            📄 <strong>PDF:</strong> Factură formatată profesional cu toate detaliile, gata de printat.
            <br />
            📊 <strong>Excel:</strong> Date tabelate, editabile în Excel/Calc pentru evidență contabilă.
          </Typography>
        </Paper>
      </Stack>
    </ToolLayout>
  );
};

export default InvoiceGenerator;

