import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
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
  Card,
  CardContent,
  Grid,
  Chip,
  Pagination,
  Alert,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RestoreIcon from '@mui/icons-material/Restore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import invoiceHistoryService from '../services/invoiceHistoryService';
import * as XLSX from 'xlsx';

const InvoiceHistoryDialog = ({ open, onClose, onLoadInvoice, type = 'invoice' }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [page, setPage] = useState(1);
  const [invoices, setInvoices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statistics, setStatistics] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // State pentru export SAGA
  const [sagaDialogOpen, setSagaDialogOpen] = useState(false);
  const [sagaFilters, setSagaFilters] = useState({
    startDate: '',
    endDate: '',
    startSeries: '',
    startNumber: ''
  });
  const [selectedInvoicesForSaga, setSelectedInvoicesForSaga] = useState([]);

  // Setează tipul de facturi
  useEffect(() => {
    if (open) {
      invoiceHistoryService.setType(type);
      loadInvoices();
      loadStatistics();
    }
  }, [open, type, search, dateRange, page]);

  const loadInvoices = () => {
    const result = invoiceHistoryService.getInvoices({
      search,
      dateRange,
      page,
      perPage: 10
    });
    
    setInvoices(result.invoices);
    setTotalPages(result.totalPages);
    setTotal(result.total);
  };

  const loadStatistics = () => {
    const stats = invoiceHistoryService.getStatistics();
    setStatistics(stats);
  };

  const handleDelete = (id) => {
    if (window.confirm('Sigur vrei să ștergi această factură din istoric?')) {
      invoiceHistoryService.deleteInvoice(id);
      loadInvoices();
      loadStatistics();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('⚠️ ATENȚIE! Vei șterge TOATE facturile din istoric. Această acțiune este ireversibilă!\n\nContinui?')) {
      invoiceHistoryService.clearAllInvoices();
      loadInvoices();
      loadStatistics();
      setCurrentTab(0);
    }
  };

  const handleLoadInvoice = (invoice) => {
    if (onLoadInvoice) {
      onLoadInvoice(invoice);
      onClose();
    }
  };

  const handleExportHistory = () => {
    const excelData = invoiceHistoryService.exportHistoryToExcel();
    
    if (!excelData) {
      alert('Nu există facturi de exportat!');
      return;
    }

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Istoric');

    // Setează lățimi coloane
    ws['!cols'] = [
      { wch: 5 },  // Nr
      { wch: 10 }, // Tip
      { wch: 8 },  // Serie
      { wch: 8 },  // Număr
      { wch: 12 }, // Data
      { wch: 12 }, // Scadență
      { wch: 30 }, // Furnizor
      { wch: 12 }, // CUI Furnizor
      { wch: 30 }, // Client
      { wch: 12 }, // CUI Client
      { wch: 8 },  // Monedă
      { wch: 12 }, // Total Net
      { wch: 12 }, // Total TVA
      { wch: 12 }, // Total Brut
      { wch: 30 }  // Note
    ];

    const fileName = `istoric_facturi_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Funcții pentru export SAGA
  const openSagaExportDialog = () => {
    setSagaDialogOpen(true);
    // Încarcă toate facturile pentru filtrare
    const allInvoices = invoiceHistoryService.getAllInvoices();
    setSelectedInvoicesForSaga(allInvoices);
  };

  const filterInvoicesForSaga = () => {
    let filtered = invoiceHistoryService.getAllInvoices();

    // Filtrare după interval de date
    if (sagaFilters.startDate) {
      filtered = filtered.filter(inv => inv.issueDate >= sagaFilters.startDate);
    }
    if (sagaFilters.endDate) {
      filtered = filtered.filter(inv => inv.issueDate <= sagaFilters.endDate);
    }

    // Filtrare după serie/număr
    if (sagaFilters.startSeries) {
      filtered = filtered.filter(inv => inv.series === sagaFilters.startSeries);
    }
    if (sagaFilters.startNumber) {
      filtered = filtered.filter(inv => {
        const invNum = parseInt(inv.number, 10);
        const startNum = parseInt(sagaFilters.startNumber, 10);
        return !isNaN(invNum) && !isNaN(startNum) && invNum >= startNum;
      });
    }

    setSelectedInvoicesForSaga(filtered);
  };

  const generateSagaXML = () => {
    if (selectedInvoicesForSaga.length === 0) {
      alert('Nu există facturi selectate pentru export!');
      return;
    }

    // Helper pentru escape XML
    const escapeXML = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    // Construiește XML SAGA
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<Facturi>\n';

    selectedInvoicesForSaga.forEach(invoice => {
      xml += '  <Factura>\n';
      xml += '    <Antet>\n';
      
      // Date furnizor
      xml += `      <FurnizorNume>${escapeXML(invoice.supplier?.name || '')}</FurnizorNume>\n`;
      xml += `      <FurnizorCIF>${escapeXML(invoice.supplier?.cui || '')}</FurnizorCIF>\n`;
      xml += `      <FurnizorNrRegCom>${escapeXML(invoice.supplier?.regCom || '')}</FurnizorNrRegCom>\n`;
      xml += `      <FurnizorCapital></FurnizorCapital>\n`;
      xml += `      <FurnizorTara>${escapeXML(invoice.supplier?.country || 'RO')}</FurnizorTara>\n`;
      xml += `      <FurnizorLocalitate>${escapeXML(invoice.supplier?.city || '')}</FurnizorLocalitate>\n`;
      xml += `      <FurnizorJudet>${escapeXML(invoice.supplier?.county || '')}</FurnizorJudet>\n`;
      xml += `      <FurnizorAdresa>${escapeXML(invoice.supplier?.address || '')}</FurnizorAdresa>\n`;
      xml += `      <FurnizorTelefon>${escapeXML(invoice.supplier?.phone || '')}</FurnizorTelefon>\n`;
      xml += `      <FurnizorMail>${escapeXML(invoice.supplier?.email || '')}</FurnizorMail>\n`;
      xml += `      <FurnizorBanca>${escapeXML(invoice.supplier?.bank || '')}</FurnizorBanca>\n`;
      xml += `      <FurnizorIBAN>${escapeXML(invoice.supplier?.iban || '')}</FurnizorIBAN>\n`;
      xml += `      <FurnizorInformatiiSuplimentare></FurnizorInformatiiSuplimentare>\n`;
      
      // Date client
      xml += `      <ClientNume>${escapeXML(invoice.client?.name || '')}</ClientNume>\n`;
      xml += `      <ClientInformatiiSuplimentare></ClientInformatiiSuplimentare>\n`;
      xml += `      <ClientCIF>${escapeXML(invoice.client?.cui || '')}</ClientCIF>\n`;
      xml += `      <ClientNrRegCom>${escapeXML(invoice.client?.regCom || '')}</ClientNrRegCom>\n`;
      xml += `      <ClientJudet>${escapeXML(invoice.client?.county || '')}</ClientJudet>\n`;
      xml += `      <ClientTara>${escapeXML(invoice.client?.country || 'RO')}</ClientTara>\n`;
      xml += `      <ClientLocalitate>${escapeXML(invoice.client?.city || '')}</ClientLocalitate>\n`;
      xml += `      <ClientAdresa>${escapeXML(invoice.client?.address || '')}</ClientAdresa>\n`;
      xml += `      <ClientBanca></ClientBanca>\n`;
      xml += `      <ClientIBAN></ClientIBAN>\n`;
      xml += `      <ClientTelefon>${escapeXML(invoice.client?.phone || '')}</ClientTelefon>\n`;
      xml += `      <ClientMail>${escapeXML(invoice.client?.email || '')}</ClientMail>\n`;
      
      // Date factură
      xml += `      <FacturaNumar>${escapeXML(invoice.series || '')}${escapeXML(invoice.number || '')}</FacturaNumar>\n`;
      xml += `      <FacturaData>${escapeXML(invoice.issueDate || '')}</FacturaData>\n`;
      xml += `      <FacturaScadenta>${escapeXML(invoice.dueDate || invoice.issueDate || '')}</FacturaScadenta>\n`;
      xml += `      <FacturaTaxareInversa>Nu</FacturaTaxareInversa>\n`;
      xml += `      <FacturaTVAIncasare>Nu</FacturaTVAIncasare>\n`;
      xml += `      <FacturaTip></FacturaTip>\n`;
      xml += `      <FacturaInformatiiSuplimentare>${escapeXML(invoice.notes || '')}</FacturaInformatiiSuplimentare>\n`;
      xml += `      <FacturaMoneda>${escapeXML(invoice.currency || 'RON')}</FacturaMoneda>\n`;
      xml += `      <FacturaGreutate></FacturaGreutate>\n`;
      xml += `      <FacturaAccize></FacturaAccize>\n`;
      xml += `      <FacturaIndexSPV></FacturaIndexSPV>\n`;
      xml += `      <FacturaIndexDescarcareSPV></FacturaIndexDescarcareSPV>\n`;
      xml += `      <Cod></Cod>\n`;
      
      xml += '    </Antet>\n';
      xml += '    <Detalii>\n';
      xml += '      <Continut>\n';
      
      // Linii factură
      if (invoice.lines && invoice.lines.length > 0) {
        invoice.lines.forEach((line, index) => {
          const qty = parseFloat(line.quantity) || 0;
          const unitNetPrice = parseFloat(line.unitNetPrice) || 0;
          const vatRate = parseFloat(line.vatRate) || 0;
          const totalNet = qty * unitNetPrice;
          const totalVat = totalNet * vatRate / 100;
          
          xml += '        <Linie>\n';
          xml += `          <LinieNrCrt>${index + 1}</LinieNrCrt>\n`;
          xml += `          <Gestiune></Gestiune>\n`;
          xml += `          <Activitate></Activitate>\n`;
          xml += `          <Descriere>${escapeXML(line.product || '')}</Descriere>\n`;
          xml += `          <CodArticolFurnizor></CodArticolFurnizor>\n`;
          xml += `          <CodArticolClient></CodArticolClient>\n`;
          xml += `          <GUID_cod_articol></GUID_cod_articol>\n`;
          xml += `          <CodBare></CodBare>\n`;
          xml += `          <InformatiiSuplimentare></InformatiiSuplimentare>\n`;
          xml += `          <UM>BUC</UM>\n`;
          xml += `          <Cantitate>${qty.toFixed(2)}</Cantitate>\n`;
          xml += `          <Pret>${unitNetPrice.toFixed(2)}</Pret>\n`;
          xml += `          <Valoare>${totalNet.toFixed(2)}</Valoare>\n`;
          xml += `          <ProcTVA>${vatRate.toFixed(0)}</ProcTVA>\n`;
          xml += `          <TVA>${totalVat.toFixed(2)}</TVA>\n`;
          xml += `          <Cont></Cont>\n`;
          xml += `          <TipDeducere></TipDeducere>\n`;
          xml += `          <PretVanzare></PretVanzare>\n`;
          xml += '        </Linie>\n';
        });
      }
      
      xml += '      </Continut>\n';
      xml += '    </Detalii>\n';
      xml += `    <FacturaID>${escapeXML(invoice.id || '')}</FacturaID>\n`;
      xml += '  </Factura>\n';
    });

    xml += '</Facturi>';

    // Descarcă XML
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Nume fișier: pentru multiple facturi folosim data curentă
    // Pentru o singură factură: F_<cod-fiscal>_<numar-factura>_<data-factura>.xml
    let fileName;
    if (selectedInvoicesForSaga.length === 1) {
      const inv = selectedInvoicesForSaga[0];
      const cui = (inv.supplier?.cui || '').replace(/\s/g, '');
      const number = `${inv.series || ''}${inv.number || ''}`.replace(/\s/g, '');
      const date = (inv.issueDate || '').replace(/-/g, '');
      fileName = `F_${cui}_${number}_${date}.xml`;
    } else {
      fileName = `SAGA_Export_${new Date().toISOString().split('T')[0]}_${selectedInvoicesForSaga.length}_facturi.xml`;
    }
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    alert(`✅ Export SAGA generat cu succes!\n\nFișier: ${fileName}\nFacturi: ${selectedInvoicesForSaga.length}`);
    setSagaDialogOpen(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ro-RO');
  };

  const formatAmount = (amount, currency = 'RON') => {
    return `${amount} ${currency}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Typography variant="h5">
          Istoric Facturi {type === 'proforma' ? 'Proforma' : ''}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {total} {total === 1 ? 'factură salvată' : 'facturi salvate'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ mb: 3 }}>
          <Tab label="Istoric" />
          <Tab label="Statistici" />
          <Tab label="Export" />
        </Tabs>

        {/* TAB 1: ISTORIC */}
        {currentTab === 0 && (
          <Stack spacing={2}>
            {/* Filtre */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  size="small"
                  label="Căutare"
                  placeholder="Serie, număr, client, CUI..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Perioada</InputLabel>
                  <Select
                    value={dateRange}
                    onChange={(e) => {
                      setDateRange(e.target.value);
                      setPage(1);
                    }}
                    label="Perioada"
                  >
                    <MenuItem value="all">Toate</MenuItem>
                    <MenuItem value="7days">Ultimele 7 zile</MenuItem>
                    <MenuItem value="30days">Ultimele 30 zile</MenuItem>
                    <MenuItem value="90days">Ultimele 90 zile</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Tabel facturi */}
            {invoices.length === 0 ? (
              <Alert severity="info">
                Nu s-au găsit facturi. {search || dateRange !== 'all' ? 'Încearcă să modifici filtrele.' : 'Emite prima factură!'}
              </Alert>
            ) : (
              <>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.100' }}>
                        <TableCell><strong>Serie/Nr</strong></TableCell>
                        <TableCell><strong>Data</strong></TableCell>
                        <TableCell><strong>Client</strong></TableCell>
                        <TableCell align="right"><strong>Total</strong></TableCell>
                        <TableCell align="center"><strong>Acțiuni</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow 
                          key={invoice.id}
                          hover
                          sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {invoice.series}{invoice.number}
                            </Typography>
                            {invoice.type === 'proforma' && (
                              <Chip label="PROFORMA" size="small" color="warning" sx={{ ml: 1 }} />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(invoice.issueDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {invoice.client.name || '-'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {invoice.client.cui ? `CUI: ${invoice.client.cui}` : ''}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600} color="success.dark">
                              {formatAmount(invoice.totals.gross, invoice.currency)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <IconButton 
                                size="small" 
                                color="primary"
                                title="Vizualizează"
                                onClick={() => setSelectedInvoice(invoice)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="info"
                                title="Încarcă în formular"
                                onClick={() => handleLoadInvoice(invoice)}
                              >
                                <RestoreIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                title="Șterge"
                                onClick={() => handleDelete(invoice.id)}
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

                {/* Paginare */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(e, value) => setPage(value)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Stack>
        )}

        {/* TAB 2: STATISTICI */}
        {currentTab === 1 && statistics && (
          <Stack spacing={3}>
            {/* Cards cu statistici generale */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">
                      Total facturi
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {statistics.totalInvoices}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">
                      Total emis (RON)
                    </Typography>
                    <Typography variant="h3" color="success.dark">
                      {parseFloat(statistics.totalAmount).toLocaleString('ro-RO')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">
                      Medie per factură
                    </Typography>
                    <Typography variant="h3" color="info.dark">
                      {parseFloat(statistics.averageAmount).toLocaleString('ro-RO')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Breakdown lunar */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Evoluție lunară (ultimele 6 luni)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Lună</strong></TableCell>
                      <TableCell align="right"><strong>Număr facturi</strong></TableCell>
                      <TableCell align="right"><strong>Total (RON)</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(statistics.monthlyBreakdown)
                      .reverse()
                      .map(([month, data]) => (
                        <TableRow key={month}>
                          <TableCell>{month}</TableCell>
                          <TableCell align="right">{data.count}</TableCell>
                          <TableCell align="right">{data.amount.toFixed(2)} RON</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Top clienți */}
            {statistics.topClients.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Top 5 clienți
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Poziție</strong></TableCell>
                        <TableCell><strong>Client</strong></TableCell>
                        <TableCell><strong>CUI</strong></TableCell>
                        <TableCell align="right"><strong>Facturi</strong></TableCell>
                        <TableCell align="right"><strong>Total (RON)</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {statistics.topClients.map((client, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip 
                              label={`#${index + 1}`} 
                              size="small" 
                              color={index === 0 ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{client.name}</TableCell>
                          <TableCell>{client.cui}</TableCell>
                          <TableCell align="right">{client.count}</TableCell>
                          <TableCell align="right">{client.total.toFixed(2)} RON</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {/* Pe monedă */}
            {Object.keys(statistics.byCurrency).length > 1 && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Breakdown pe monedă
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(statistics.byCurrency).map(([currency, data]) => (
                    <Grid item xs={12} sm={6} md={4} key={currency}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="overline" color="text.secondary">
                            {currency}
                          </Typography>
                          <Typography variant="h5">
                            {data.amount.toFixed(2)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {data.count} {data.count === 1 ? 'factură' : 'facturi'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </Stack>
        )}

        {/* TAB 3: EXPORT */}
        {currentTab === 2 && (
          <Stack spacing={3}>
            <Alert severity="info">
              Exportă toate facturile din istoric într-un singur fișier Excel pentru arhivare sau analiză.
            </Alert>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6">
                  Export complet istoric
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Include toate facturile cu date complete: furnizor, client, produse, totaluri.
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleExportHistory}
                  disabled={total === 0}
                >
                  Descarcă istoric ({total} {total === 1 ? 'factură' : 'facturi'})
                </Button>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'info.50' }}>
              <Stack spacing={2}>
                <Typography variant="h6">
                  Export SAGA (Format XML)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Exportă facturi în formatul XML compatibil cu software-ul SAGA. Poți filtra facturile după interval de date sau serie/număr.
                </Typography>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<AccountBalanceIcon />}
                  onClick={openSagaExportDialog}
                  disabled={total === 0}
                >
                  Export SAGA XML
                </Button>
              </Stack>
            </Paper>

            <Divider />

            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'error.lighter' }}>
              <Stack spacing={2}>
                <Typography variant="h6" color="error">
                  Zona periculoasă
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ștergerea este permanentă și nu poate fi anulată!
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteSweepIcon />}
                  onClick={handleClearAll}
                  disabled={total === 0}
                >
                  Șterge tot istoricul
                </Button>
              </Stack>
            </Paper>
          </Stack>
        )}

        {/* Dialog vizualizare factură */}
        {selectedInvoice && (
          <Dialog
            open={Boolean(selectedInvoice)}
            onClose={() => setSelectedInvoice(null)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              Factură {selectedInvoice.series}{selectedInvoice.number}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Data emitere:</Typography>
                  <Typography variant="body1">{formatDate(selectedInvoice.issueDate)}</Typography>
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="caption" color="text.secondary">Furnizor:</Typography>
                  <Typography variant="body1">{selectedInvoice.supplier.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    CUI: {selectedInvoice.supplier.cui}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">Client:</Typography>
                  <Typography variant="body1">{selectedInvoice.client.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    CUI: {selectedInvoice.client.cui}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="caption" color="text.secondary">Produse:</Typography>
                  {selectedInvoice.lines.map((line, idx) => (
                    <Typography key={idx} variant="body2">
                      {idx + 1}. {line.product} - {line.quantity} × {line.unitNetPrice} {selectedInvoice.currency}
                    </Typography>
                  ))}
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="h6" color="success.dark">
                    Total: {formatAmount(selectedInvoice.totals.gross, selectedInvoice.currency)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    (Net: {selectedInvoice.totals.net} + TVA: {selectedInvoice.totals.vat})
                  </Typography>
                </Box>

                {selectedInvoice.notes && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Note:</Typography>
                      <Typography variant="body2">{selectedInvoice.notes}</Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedInvoice(null)}>Închide</Button>
              <Button 
                variant="contained"
                onClick={() => {
                  handleLoadInvoice(selectedInvoice);
                  setSelectedInvoice(null);
                }}
              >
                Încarcă în formular
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Dialog Export SAGA */}
        <Dialog
          open={sagaDialogOpen}
          onClose={() => setSagaDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Export SAGA - Filtrare facturi
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Selectează facturile pe care dorești să le exporți în formatul XML SAGA
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              {/* Filtre */}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Filtre
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="Data început"
                      value={sagaFilters.startDate}
                      onChange={(e) => setSagaFilters({ ...sagaFilters, startDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="Data sfârșit"
                      value={sagaFilters.endDate}
                      onChange={(e) => setSagaFilters({ ...sagaFilters, endDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Serie factură"
                      placeholder="ex: FAC"
                      value={sagaFilters.startSeries}
                      onChange={(e) => setSagaFilters({ ...sagaFilters, startSeries: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Număr factură (de la)"
                      placeholder="ex: 100"
                      type="number"
                      value={sagaFilters.startNumber}
                      onChange={(e) => setSagaFilters({ ...sagaFilters, startNumber: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      onClick={filterInvoicesForSaga}
                      fullWidth
                    >
                      Aplică filtre
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {/* Previzualizare facturi selectate */}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Facturi selectate ({selectedInvoicesForSaga.length})
                </Typography>
                
                {selectedInvoicesForSaga.length === 0 ? (
                  <Alert severity="warning">
                    Nu există facturi care să corespundă filtrelor aplicate.
                  </Alert>
                ) : (
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                          <TableCell><strong>Serie/Nr</strong></TableCell>
                          <TableCell><strong>Data</strong></TableCell>
                          <TableCell><strong>Client</strong></TableCell>
                          <TableCell align="right"><strong>Total</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedInvoicesForSaga.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {invoice.series}{invoice.number}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(invoice.issueDate)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                {invoice.client.name || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600}>
                                {formatAmount(invoice.totals.gross, invoice.currency)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>

              {/* Info despre format */}
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Format fișier:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • Pentru o singură factură: F_&lt;cod-fiscal&gt;_&lt;numar-factura&gt;_&lt;data-factura&gt;.xml
                  <br />
                  • Pentru mai multe facturi: SAGA_Export_&lt;data&gt;_&lt;numar-facturi&gt;_facturi.xml
                  <br />
                  <br />
                  Facturile vor fi exportate în formatul XML compatibil cu SAGA, inclusiv toate detaliile:
                  furnizor, client, produse, totaluri.
                </Typography>
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSagaDialogOpen(false)}>
              Anulează
            </Button>
            <Button
              variant="contained"
              color="info"
              startIcon={<FileDownloadIcon />}
              onClick={generateSagaXML}
              disabled={selectedInvoicesForSaga.length === 0}
            >
              Generează XML ({selectedInvoicesForSaga.length} {selectedInvoicesForSaga.length === 1 ? 'factură' : 'facturi'})
            </Button>
          </DialogActions>
        </Dialog>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Închide</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceHistoryDialog;

