import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ToolLayout from '../../components/ToolLayout';
import { getCompanyDataByCUI } from '../../services/anafService';
import googleDriveService from '../../services/googleDriveService';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import CryptoJS from 'crypto-js';

const ProformaInvoiceGenerator = () => {
  const [loadingSupplier, setLoadingSupplier] = useState(false);
  const [loadingClient, setLoadingClient] = useState(false);
  const [anafError, setAnafError] = useState('');
  const [saveDataConsent, setSaveDataConsent] = useState(false);
  
  const [invoiceData, setInvoiceData] = useState({
    // Date factură proforma
    series: 'PF',
    number: '',
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: '',
    currency: 'RON',
    notes: '',
    
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
    
    // Client
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
      vatRate: '19',
      unitGrossPrice: '0.00'
    }
  ]);

  // State pentru Google Drive
  const [googleDriveReady, setGoogleDriveReady] = useState(false);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);

  // State pentru import Excel
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [excelColumns, setExcelColumns] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    product: '',
    quantity: '',
    vatRate: '',
    unitNetPrice: ''
  });
  const [previewData, setPreviewData] = useState([]);

  // Cookie management
  const ENCRYPTION_KEY = 'normalro-proforma-supplier-data-2024';
  const COOKIE_NAME = 'normalro_proforma_supplier';

  const setCookie = (name, value, days) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  };

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
  };

  const decryptData = (encryptedData) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      return null;
    }
  };

  const saveSupplierDataToCookie = () => {
    if (!saveDataConsent) return;

    const dataToSave = {
      series: invoiceData.series,
      number: invoiceData.number,
      currency: invoiceData.currency,
      supplierName: invoiceData.supplierName,
      supplierCUI: invoiceData.supplierCUI,
      supplierRegCom: invoiceData.supplierRegCom,
      supplierAddress: invoiceData.supplierAddress,
      supplierCity: invoiceData.supplierCity,
      supplierPhone: invoiceData.supplierPhone,
      supplierEmail: invoiceData.supplierEmail,
      supplierBank: invoiceData.supplierBank,
      supplierIBAN: invoiceData.supplierIBAN,
      defaultVatRate: lines[0]?.vatRate || '19'
    };

    const encrypted = encryptData(dataToSave);
    setCookie(COOKIE_NAME, encrypted, 90);
  };

  const incrementInvoiceNumber = (currentNumber) => {
    if (!currentNumber) return '001';
    
    const match = currentNumber.match(/^([A-Za-z-]*)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const number = parseInt(match[2], 10);
      const incrementedNumber = number + 1;
      const paddedNumber = incrementedNumber.toString().padStart(match[2].length, '0');
      return prefix + paddedNumber;
    }
    
    return currentNumber;
  };

  const loadSupplierDataFromCookie = () => {
    const encryptedData = getCookie(COOKIE_NAME);
    if (!encryptedData) return;

    const savedData = decryptData(encryptedData);
    if (!savedData) return;

    const newNumber = incrementInvoiceNumber(savedData.number);
    
    setInvoiceData(prev => ({
      ...prev,
      series: savedData.series || 'PF',
      number: newNumber,
      currency: savedData.currency || 'RON',
      supplierName: savedData.supplierName || '',
      supplierCUI: savedData.supplierCUI || '',
      supplierRegCom: savedData.supplierRegCom || '',
      supplierAddress: savedData.supplierAddress || '',
      supplierCity: savedData.supplierCity || '',
      supplierPhone: savedData.supplierPhone || '',
      supplierEmail: savedData.supplierEmail || '',
      supplierBank: savedData.supplierBank || '',
      supplierIBAN: savedData.supplierIBAN || ''
    }));

    if (savedData.defaultVatRate && lines[0]) {
      setLines(prevLines => {
        const newLines = [...prevLines];
        newLines[0] = { ...newLines[0], vatRate: savedData.defaultVatRate };
        return newLines;
      });
    }

    setSaveDataConsent(true);
  };

  useEffect(() => {
    loadSupplierDataFromCookie();
    
    // Inițializează Google Drive API
    const initGoogleDrive = async () => {
      try {
        await googleDriveService.initializeGapi();
        googleDriveService.initializeGis();
        
        if (googleDriveService.isConfigured()) {
          setGoogleDriveReady(true);
        } else {
          console.warn('Google Drive nu este configurat. Setează REACT_APP_GOOGLE_CLIENT_ID în .env');
        }
      } catch (error) {
        console.error('Eroare inițializare Google Drive:', error);
      }
    };

    // Așteaptă încărcarea scripturilor Google
    const checkGoogleLoaded = setInterval(() => {
      if (window.gapi && window.google) {
        clearInterval(checkGoogleLoaded);
        initGoogleDrive();
      }
    }, 100);

    // Cleanup după 10 secunde
    setTimeout(() => clearInterval(checkGoogleLoaded), 10000);

    return () => clearInterval(checkGoogleLoaded);
  }, []);

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
      
      if (result.success && result.data) {
        setInvoiceData({
          ...invoiceData,
          supplierName: result.data.name || '',
          supplierCUI: result.data.cui || invoiceData.supplierCUI,
          supplierRegCom: result.data.regCom || '',
          supplierAddress: result.data.address || '',
          supplierCity: result.data.city || ''
        });
      } else {
        setAnafError(result.error || 'Nu s-au găsit date');
      }
    } catch (error) {
      setAnafError('Eroare la căutarea în ANAF');
    } finally {
      setLoadingSupplier(false);
    }
  };

  const searchClientANAF = async () => {
    if (!invoiceData.clientCUI) {
      setAnafError('Introduceți CUI-ul clientului');
      return;
    }

    setLoadingClient(true);
    setAnafError('');

    try {
      const result = await getCompanyDataByCUI(invoiceData.clientCUI);
      
      if (result.success && result.data) {
        setInvoiceData({
          ...invoiceData,
          clientName: result.data.name || '',
          clientCUI: result.data.cui || invoiceData.clientCUI,
          clientRegCom: result.data.regCom || '',
          clientAddress: result.data.address || '',
          clientCity: result.data.city || ''
        });
      } else {
        setAnafError(result.error || 'Nu s-au găsit date');
      }
    } catch (error) {
      setAnafError('Eroare la căutarea în ANAF');
    } finally {
      setLoadingClient(false);
    }
  };

  const calculateLineTotal = (line, type = 'gross') => {
    const quantity = parseFloat(line.quantity) || 0;
    const unitNetPrice = parseFloat(line.unitNetPrice) || 0;
    const vatRate = parseFloat(line.vatRate) || 0;

    const netTotal = quantity * unitNetPrice;
    const vatAmount = netTotal * (vatRate / 100);
    const grossTotal = netTotal + vatAmount;

    if (type === 'net') return formatNumber(netTotal);
    if (type === 'vat') return formatNumber(vatAmount);
    return formatNumber(grossTotal);
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
      net: formatNumber(totalNet),
      vat: formatNumber(totalVat),
      gross: formatNumber(totalGross)
    };
  };

  const addLine = () => {
    const newLine = {
      id: Date.now(),
      product: '',
      quantity: '1',
      unitNetPrice: '0.00',
      vatRate: lines.length > 0 ? lines[0].vatRate : '19',
      unitGrossPrice: '0.00'
    };
    setLines([...lines, newLine]);
  };

  const removeLine = (id) => {
    if (lines.length > 1) {
      setLines(lines.filter(line => line.id !== id));
    }
  };

  const handleLineChange = (id, field, value) => {
    const newLines = lines.map(line => {
      if (line.id === id) {
        const updatedLine = { ...line, [field]: value };
        
        if (field === 'unitNetPrice' || field === 'vatRate') {
          const netPrice = parseFloat(updatedLine.unitNetPrice) || 0;
          const vat = parseFloat(updatedLine.vatRate) || 0;
          updatedLine.unitGrossPrice = formatNumber(netPrice * (1 + vat / 100));
        } else if (field === 'unitGrossPrice') {
          const grossPrice = parseFloat(value) || 0;
          const vat = parseFloat(updatedLine.vatRate) || 0;
          updatedLine.unitNetPrice = formatNumber(grossPrice / (1 + vat / 100));
        }
        
        return updatedLine;
      }
      return line;
    });
    setLines(newLines);
  };

  // Funcții pentru import Excel
  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (data.length < 2) {
          alert('Fișierul Excel trebuie să conțină cel puțin un rând cu header și un rând cu date.');
          return;
        }

        const headers = data[0].filter(h => h);
        setExcelColumns(headers);
        setExcelData(data.slice(1));
        setImportDialogOpen(true);
        
        setColumnMapping({
          product: '',
          quantity: '',
          vatRate: '',
          unitNetPrice: ''
        });
        setPreviewData([]);
      } catch (error) {
        alert('Eroare la citirea fișierului Excel: ' + error.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleMappingChange = (field, columnName) => {
    const newMapping = { ...columnMapping, [field]: columnName };
    setColumnMapping(newMapping);
    
    if (excelData && excelColumns.length > 0) {
      updatePreview(newMapping);
    }
  };

  const updatePreview = (mapping) => {
    if (!excelData || excelColumns.length === 0) return;

    const preview = excelData.slice(0, 5).map((row, index) => {
      const product = mapping.product ? row[excelColumns.indexOf(mapping.product)] : '';
      const quantity = mapping.quantity ? row[excelColumns.indexOf(mapping.quantity)] : '';
      const vatRate = mapping.vatRate ? row[excelColumns.indexOf(mapping.vatRate)] : '';
      const unitNetPrice = mapping.unitNetPrice ? row[excelColumns.indexOf(mapping.unitNetPrice)] : '';

      return {
        index: index + 1,
        product: product || '-',
        quantity: quantity || '-',
        vatRate: vatRate || '-',
        unitNetPrice: unitNetPrice || '-'
      };
    });

    setPreviewData(preview);
  };

  const importExcelLines = () => {
    if (!excelData || !columnMapping.product) {
      alert('Trebuie să mapezi cel puțin coloana "Denumire produs"');
      return;
    }

    const newLines = excelData
      .map((row, index) => {
        const product = columnMapping.product ? row[excelColumns.indexOf(columnMapping.product)] : '';
        const quantity = columnMapping.quantity ? row[excelColumns.indexOf(columnMapping.quantity)] : '1';
        const vatRate = columnMapping.vatRate ? row[excelColumns.indexOf(columnMapping.vatRate)] : '';
        const unitNetPrice = columnMapping.unitNetPrice ? row[excelColumns.indexOf(columnMapping.unitNetPrice)] : '0';

        if (!product && !quantity && !unitNetPrice) return null;

        const netPrice = parseFloat(unitNetPrice) || 0;
        const vat = parseFloat(vatRate) || 0; // Dacă nu are valoare, folosește 0
        const grossPrice = netPrice * (1 + vat / 100);

        return {
          id: Date.now() + index,
          product: String(product || ''),
          quantity: String(parseFloat(quantity) || 1),
          unitNetPrice: formatNumber(netPrice),
          vatRate: String(parseFloat(vatRate) || 0), // Default: 0%
          unitGrossPrice: formatNumber(grossPrice)
        };
      })
      .filter(line => line !== null);

    if (newLines.length === 0) {
      alert('Nu s-au găsit date valide în Excel');
      return;
    }

    if (lines.length === 1 && !lines[0].product && !lines[0].unitNetPrice) {
      setLines(newLines);
    } else {
      setLines([...lines, ...newLines]);
    }

    setImportDialogOpen(false);
    alert(`Au fost importate ${newLines.length} linii cu succes!`);
  };

  const saveToGoogleDrive = async (fileType = 'pdf') => {
    if (!googleDriveReady || !googleDriveService.isConfigured()) {
      alert(
        '⚠️ Google Drive nu este configurat!\n\n' +
        'Pentru a activa această funcție:\n' +
        '1. Creează un proiect în Google Cloud Console\n' +
        '2. Activează Google Drive API\n' +
        '3. Creează credențiale OAuth 2.0\n' +
        '4. Setează REACT_APP_GOOGLE_CLIENT_ID în .env\n\n' +
        `Ghid: ${googleDriveService.getConfigurationGuideUrl()}`
      );
      return;
    }

    setIsUploadingToDrive(true);
    
    try {
      // 1. Cere autorizare de la utilizator
      try {
        await googleDriveService.requestAuthorization();
      } catch (authError) {
        console.error('Eroare autorizare:', authError);
        alert(
          '❌ Autorizare refuzată!\n\n' +
          'Pentru a salva fișiere în Google Drive, trebuie să accepți permisiunile solicitate.\n\n' +
          'Apasă din nou pe buton și autorizează aplicația.'
        );
        setIsUploadingToDrive(false);
        return;
      }

      // 2. Generează fișierul
      let blob, filename, mimeType;
      
      if (fileType === 'pdf') {
        const totals = calculateTotals();
        const invoiceElement = document.createElement('div');
        invoiceElement.style.width = '800px';
        invoiceElement.style.padding = '20px';
        invoiceElement.style.backgroundColor = 'white';
        
        invoiceElement.innerHTML = `
          <div style="font-family: Arial, sans-serif; font-size: 11px;">
            <h1 style="text-align: center; font-size: 24px; margin: 0 0 5px 0; color: #e65100;">FACTURĂ PROFORMA</h1>
            <p style="text-align: center; font-size: 10px; color: #666; margin: 0 0 20px 0;">Document informativ, fără valoare fiscală</p>
            <div style="text-align: center; margin-bottom: 25px; font-size: 11px;">
              <div>Seria: ${invoiceData.series || '-'} Nr: ${invoiceData.number || '-'}</div>
              <div>Data: ${invoiceData.issueDate || '-'}</div>
              ${invoiceData.validUntil ? `<div>Valabil până: ${invoiceData.validUntil}</div>` : ''}
            </div>
            
            <table style="width: 100%; margin-bottom: 25px; border-collapse: collapse;">
              <tr>
                <td style="width: 50%; vertical-align: top; padding-right: 15px;">
                  <strong style="font-size: 12px;">FURNIZOR:</strong><br/>
                  <div style="margin-top: 5px; line-height: 1.6;">
                    ${invoiceData.supplierName || '-'}<br/>
                    ${invoiceData.supplierCUI ? `CUI: ${invoiceData.supplierCUI}` : ''}
                  </div>
                </td>
                <td style="width: 50%; vertical-align: top; padding-left: 15px;">
                  <strong style="font-size: 12px;">CLIENT:</strong><br/>
                  <div style="margin-top: 5px; line-height: 1.6;">
                    ${invoiceData.clientName || '-'}<br/>
                    ${invoiceData.clientCUI ? `CUI: ${invoiceData.clientCUI}` : ''}
                  </div>
                </td>
              </tr>
            </table>
            
            <div style="text-align: center; margin-top: 30px;">
              <strong>Total: ${totals.gross} ${invoiceData.currency}</strong>
            </div>
          </div>
        `;
        
        document.body.appendChild(invoiceElement);
        
        const canvas = await html2canvas(invoiceElement, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        blob = pdf.output('blob');
        filename = `factura_proforma_${invoiceData.series || 'PF'}_${invoiceData.number || '001'}_${invoiceData.issueDate}.pdf`;
        mimeType = 'application/pdf';
        
        document.body.removeChild(invoiceElement);
        
      } else if (fileType === 'excel') {
        const totals = calculateTotals();
        const excelData = [];
        
        excelData.push(['FACTURĂ PROFORMA']);
        excelData.push(['Document informativ, fără valoare fiscală']);
        excelData.push([]);
        excelData.push(['Seria', invoiceData.series, 'Nr', invoiceData.number]);
        excelData.push(['Data emitere', invoiceData.issueDate]);
        excelData.push([]);
        
        excelData.push(['Nr.', 'Produs/Serviciu', 'Cantitate', 'Preț net unitar', 'TVA %', 'Total net', 'Total TVA', 'Total brut']);
        
        lines.forEach((line, index) => {
          excelData.push([
            index + 1,
            line.product || '-',
            line.quantity,
            formatNumber(line.unitNetPrice),
            line.vatRate,
            calculateLineTotal(line, 'net'),
            calculateLineTotal(line, 'vat'),
            calculateLineTotal(line, 'gross')
          ]);
        });
        
        excelData.push([]);
        excelData.push(['', '', '', '', 'TOTAL', totals.net, totals.vat, totals.gross]);
        
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Factura Proforma');
        
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        filename = `factura_proforma_${invoiceData.series || 'PF'}_${invoiceData.number || '001'}_${invoiceData.issueDate}.xlsx`;
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }

      // 3. Upload direct în Google Drive
      const result = await googleDriveService.uploadFile(blob, filename, mimeType);
      
      // 4. Succes!
      const fileUrl = `https://drive.google.com/file/d/${result.id}/view`;
      
      alert(
        `✅ Succes! Fișierul a fost salvat în Google Drive!\n\n` +
        `📄 Nume: ${filename}\n` +
        `📂 ID: ${result.id}\n\n` +
        `🔗 Deschide fișierul în Google Drive?`
      );
      
      // Deschide fișierul în Google Drive
      window.open(fileUrl, '_blank');
      
      saveSupplierDataToCookie();
      
    } catch (error) {
      console.error('Eroare salvare Google Drive:', error);
      alert(
        `❌ Eroare la salvarea în Google Drive!\n\n` +
        `${error.message}\n\n` +
        `Verifică consola pentru mai multe detalii.`
      );
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const exportToPDF = async () => {
    const totals = calculateTotals();
    
    const invoiceElement = document.createElement('div');
    invoiceElement.style.width = '800px';
    invoiceElement.style.padding = '20px';
    invoiceElement.style.backgroundColor = 'white';
    
    invoiceElement.innerHTML = `
      <div style="font-family: Arial, sans-serif; font-size: 11px;">
        <h1 style="text-align: center; font-size: 24px; margin: 0 0 5px 0; color: #e65100;">FACTURĂ PROFORMA</h1>
        <p style="text-align: center; font-size: 10px; color: #666; margin: 0 0 20px 0;">Document informativ, fără valoare fiscală</p>
        <div style="text-align: center; margin-bottom: 25px; font-size: 11px;">
          <div>Seria: ${invoiceData.series || '-'} Nr: ${invoiceData.number || '-'}</div>
          <div>Data: ${invoiceData.issueDate || '-'}</div>
          ${invoiceData.validUntil ? `<div>Valabil până: ${invoiceData.validUntil}</div>` : ''}
        </div>
        
        <table style="width: 100%; margin-bottom: 25px; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 15px;">
              <strong style="font-size: 12px;">FURNIZOR:</strong><br/>
              <div style="margin-top: 5px; line-height: 1.6;">
                ${invoiceData.supplierName || '-'}<br/>
                ${invoiceData.supplierCUI ? `CUI: ${invoiceData.supplierCUI}<br/>` : ''}
                ${invoiceData.supplierRegCom ? `Reg Com: ${invoiceData.supplierRegCom}<br/>` : ''}
                ${invoiceData.supplierAddress || '-'}<br/>
                ${invoiceData.supplierCity || '-'}
              </div>
            </td>
            <td style="width: 50%; vertical-align: top; padding-left: 15px;">
              <strong style="font-size: 12px;">CLIENT:</strong><br/>
              <div style="margin-top: 5px; line-height: 1.6;">
                ${invoiceData.clientName || '-'}<br/>
                ${invoiceData.clientCUI ? `CUI: ${invoiceData.clientCUI}<br/>` : ''}
                ${invoiceData.clientRegCom ? `Reg Com: ${invoiceData.clientRegCom}<br/>` : ''}
                ${invoiceData.clientAddress || '-'}<br/>
                ${invoiceData.clientCity || '-'}
              </div>
            </td>
          </tr>
        </table>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #ff6f00; color: white;">
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">Nr.</th>
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">Produs/Serviciu</th>
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">Cant.</th>
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">Preț Net</th>
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">TVA%</th>
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">Total Net</th>
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">Total TVA</th>
              <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold;">Total Brut</th>
            </tr>
          </thead>
          <tbody>
            ${lines.map((line, index) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 6px; font-size: 10px;">${line.product || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px;">${line.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${formatNumber(line.unitNetPrice)} ${invoiceData.currency}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px;">${line.vatRate}%</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${calculateLineTotal(line, 'net')} ${invoiceData.currency}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${calculateLineTotal(line, 'vat')} ${invoiceData.currency}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${calculateLineTotal(line, 'gross')} ${invoiceData.currency}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #fff3e0; font-weight: bold;">
              <td colspan="5" style="border: 1px solid #ddd; padding: 8px; font-size: 11px; font-weight: bold;">TOTAL PROFORMA</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 11px; font-weight: bold;">${totals.net} ${invoiceData.currency}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 11px; font-weight: bold;">${totals.vat} ${invoiceData.currency}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 11px; font-weight: bold;">${totals.gross} ${invoiceData.currency}</td>
            </tr>
          </tfoot>
        </table>
        ${invoiceData.notes ? `
        <div style="margin-top: 25px; padding: 15px; background-color: #fff3e0; border-left: 4px solid #ff6f00; border-radius: 4px;">
          <strong style="font-size: 11px;">Note:</strong><br/>
          <div style="margin-top: 8px; font-size: 10px; line-height: 1.6; white-space: pre-wrap;">${invoiceData.notes}</div>
        </div>` : ''}
        <div style="margin-top: 30px; padding: 10px; background-color: #ffebee; border: 1px solid #ef5350; border-radius: 4px; text-align: center;">
          <strong style="color: #c62828; font-size: 10px;">⚠️ DOCUMENT INFORMATIV - NU ESTE FACTURĂ FISCALĂ</strong>
        </div>
      </div>
    `;
    
    document.body.appendChild(invoiceElement);
    
    try {
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`factura_proforma_${invoiceData.series || 'PF'}_${invoiceData.number || '001'}_${invoiceData.issueDate}.pdf`);
      
      saveSupplierDataToCookie();
    } catch (error) {
      console.error('Eroare generare PDF:', error);
      alert('Eroare la generarea PDF-ului');
    } finally {
      document.body.removeChild(invoiceElement);
    }
  };

  const exportToExcel = () => {
    const totals = calculateTotals();
    
    const excelData = [];
    
    excelData.push(['FACTURĂ PROFORMA']);
    excelData.push(['Document informativ, fără valoare fiscală']);
    excelData.push([]);
    excelData.push(['Seria', invoiceData.series, 'Nr', invoiceData.number]);
    excelData.push(['Data emitere', invoiceData.issueDate]);
    if (invoiceData.validUntil) {
      excelData.push(['Valabil până', invoiceData.validUntil]);
    }
    excelData.push([]);
    
    excelData.push(['FURNIZOR']);
    excelData.push(['Nume', invoiceData.supplierName]);
    excelData.push(['CUI', invoiceData.supplierCUI]);
    excelData.push(['Reg Com', invoiceData.supplierRegCom]);
    excelData.push(['Adresă', invoiceData.supplierAddress]);
    excelData.push(['Oraș', invoiceData.supplierCity]);
    excelData.push([]);
    
    excelData.push(['CLIENT']);
    excelData.push(['Nume', invoiceData.clientName]);
    excelData.push(['CUI', invoiceData.clientCUI]);
    excelData.push(['Reg Com', invoiceData.clientRegCom]);
    excelData.push(['Adresă', invoiceData.clientAddress]);
    excelData.push(['Oraș', invoiceData.clientCity]);
    excelData.push([]);
    
    excelData.push(['Nr.', 'Produs/Serviciu', 'Cantitate', 'Preț net unitar', 'TVA %', 'Total net', 'Total TVA', 'Total brut']);
    
    lines.forEach((line, index) => {
      excelData.push([
        index + 1,
        line.product || '-',
        line.quantity,
        formatNumber(line.unitNetPrice),
        line.vatRate,
        calculateLineTotal(line, 'net'),
        calculateLineTotal(line, 'vat'),
        calculateLineTotal(line, 'gross')
      ]);
    });
    
    excelData.push([]);
    excelData.push(['', '', '', '', 'TOTAL', totals.net, totals.vat, totals.gross]);
    
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Factură Proforma');
    
    XLSX.writeFile(wb, `factura_proforma_${invoiceData.series || 'PF'}_${invoiceData.number || '001'}_${invoiceData.issueDate}.xlsx`);
    
    saveSupplierDataToCookie();
  };

  const totals = calculateTotals();

  return (
    <ToolLayout 
      title="Generator Facturi Proforma" 
      description="Creează facturi proforma profesionale pentru oferte și estimări de preț"
    >
      <Stack spacing={3}>
        {/* Consimțământ salvare date */}
        <Paper sx={{ p: 2, bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.main' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={saveDataConsent}
                onChange={(e) => setSaveDataConsent(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                <strong>Salvează datele furnizorului</strong> (criptat în browser) pentru completare automată ulterioară
              </Typography>
            }
          />
        </Paper>

        {anafError && (
          <Alert severity="error" onClose={() => setAnafError('')}>
            {anafError}
          </Alert>
        )}

        {/* Date factură */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Date factură proforma
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Serie"
                  value={invoiceData.series}
                  onChange={handleInvoiceChange('series')}
                  placeholder="PF"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Număr"
                  value={invoiceData.number}
                  onChange={handleInvoiceChange('number')}
                  placeholder="001"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Valabil până (opțional)"
                  type="date"
                  value={invoiceData.validUntil}
                  onChange={handleInvoiceChange('validUntil')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Monedă</InputLabel>
                  <Select
                    value={invoiceData.currency}
                    onChange={handleInvoiceChange('currency')}
                    label="Monedă"
                  >
                    <MenuItem value="RON">RON - Leu românesc</MenuItem>
                    <MenuItem value="EUR">EUR - Euro</MenuItem>
                    <MenuItem value="USD">USD - Dolar american</MenuItem>
                    <MenuItem value="GBP">GBP - Liră sterlină</MenuItem>
                    <MenuItem value="CHF">CHF - Franc elvețian</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Furnizor și Client */}
        <Grid container spacing={2}>
          {/* Furnizor */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Furnizor
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="CUI"
                    value={invoiceData.supplierCUI}
                    onChange={handleInvoiceChange('supplierCUI')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={searchSupplierANAF} disabled={loadingSupplier} size="small">
                            {loadingSupplier ? <CircularProgress size={20} /> : <SearchIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Nume companie"
                    value={invoiceData.supplierName}
                    onChange={handleInvoiceChange('supplierName')}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Reg Com (opțional)"
                    value={invoiceData.supplierRegCom}
                    onChange={handleInvoiceChange('supplierRegCom')}
                  />
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
                  <TextField
                    fullWidth
                    size="small"
                    label="Telefon (opțional)"
                    value={invoiceData.supplierPhone}
                    onChange={handleInvoiceChange('supplierPhone')}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Email (opțional)"
                    value={invoiceData.supplierEmail}
                    onChange={handleInvoiceChange('supplierEmail')}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Client */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="secondary">
                  Client
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="CUI (opțional)"
                    value={invoiceData.clientCUI}
                    onChange={handleInvoiceChange('clientCUI')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={searchClientANAF} disabled={loadingClient} size="small">
                            {loadingClient ? <CircularProgress size={20} /> : <SearchIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Nume client"
                    value={invoiceData.clientName}
                    onChange={handleInvoiceChange('clientName')}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Reg Com (opțional)"
                    value={invoiceData.clientRegCom}
                    onChange={handleInvoiceChange('clientRegCom')}
                  />
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
                  <TextField
                    fullWidth
                    size="small"
                    label="Telefon (opțional)"
                    value={invoiceData.clientPhone}
                    onChange={handleInvoiceChange('clientPhone')}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Email (opțional)"
                    value={invoiceData.clientEmail}
                    onChange={handleInvoiceChange('clientEmail')}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Linii produse */}
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Produse / Servicii
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addLine}
                  size="small"
                >
                  Adaugă linie
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  startIcon={<UploadFileIcon />}
                  component="label"
                >
                  Importă Excel
                  <input
                    type="file"
                    hidden
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                  />
                </Button>
              </Stack>
            </Box>

            <Stack spacing={2}>
              {lines.map((line, index) => (
                <Paper key={line.id} sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Produs/Serviciu"
                        value={line.product}
                        onChange={(e) => handleLineChange(line.id, 'product', e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Cantitate"
                        type="number"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(line.id, 'quantity', e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Preț Net"
                        type="number"
                        value={line.unitNetPrice}
                        onChange={(e) => handleLineChange(line.id, 'unitNetPrice', e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">{invoiceData.currency}</InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="TVA %"
                        type="number"
                        value={line.vatRate}
                        onChange={(e) => handleLineChange(line.id, 'vatRate', e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Preț Brut"
                        type="number"
                        value={line.unitGrossPrice}
                        onChange={(e) => handleLineChange(line.id, 'unitGrossPrice', e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">{invoiceData.currency}</InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Total linie brut"
                        type="number"
                        value={calculateLineTotal(line, 'gross')}
                        onChange={(e) => {
                          const totalGross = parseFloat(e.target.value) || 0;
                          const quantity = parseFloat(line.quantity) || 1;
                          const vatRate = parseFloat(line.vatRate) || 0;
                          
                          // Calculează preț brut unitar din total
                          const unitGrossPrice = totalGross / quantity;
                          // Calculează preț net unitar
                          const unitNetPrice = unitGrossPrice / (1 + vatRate / 100);
                          
                          const newLines = lines.map(l => {
                            if (l.id === line.id) {
                              return {
                                ...l,
                                unitNetPrice: formatNumber(unitNetPrice),
                                unitGrossPrice: formatNumber(unitGrossPrice)
                              };
                            }
                            return l;
                          });
                          setLines(newLines);
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">{invoiceData.currency}</InputAdornment>
                        }}
                        sx={{ 
                          '& .MuiInputBase-input': { 
                            fontWeight: 700,
                            color: 'warning.dark'
                          } 
                        }}
                        helperText={`Net: ${calculateLineTotal(line, 'net')} + TVA: ${calculateLineTotal(line, 'vat')}`}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 0.5 }}>
                      {lines.length > 1 && (
                        <IconButton color="error" onClick={() => removeLine(line.id)} size="small">
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Dialog Import Excel */}
        <Dialog 
          open={importDialogOpen} 
          onClose={() => setImportDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Importă linii din Excel
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Mapează coloanele din Excel cu câmpurile facturii
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              {/* Mapare coloane */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Denumire produs *</InputLabel>
                    <Select
                      value={columnMapping.product}
                      onChange={(e) => handleMappingChange('product', e.target.value)}
                      label="Denumire produs *"
                    >
                      <MenuItem value="">-- Selectează coloană --</MenuItem>
                      {excelColumns.map((col, idx) => (
                        <MenuItem key={idx} value={col}>{col}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Cantitate</InputLabel>
                    <Select
                      value={columnMapping.quantity}
                      onChange={(e) => handleMappingChange('quantity', e.target.value)}
                      label="Cantitate"
                    >
                      <MenuItem value="">-- Selectează coloană --</MenuItem>
                      {excelColumns.map((col, idx) => (
                        <MenuItem key={idx} value={col}>{col}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Cotă TVA (%)</InputLabel>
                    <Select
                      value={columnMapping.vatRate}
                      onChange={(e) => handleMappingChange('vatRate', e.target.value)}
                      label="Cotă TVA (%)"
                    >
                      <MenuItem value="">-- Selectează coloană --</MenuItem>
                      {excelColumns.map((col, idx) => (
                        <MenuItem key={idx} value={col}>{col}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Preț unitar net</InputLabel>
                    <Select
                      value={columnMapping.unitNetPrice}
                      onChange={(e) => handleMappingChange('unitNetPrice', e.target.value)}
                      label="Preț unitar net"
                    >
                      <MenuItem value="">-- Selectează coloană --</MenuItem>
                      {excelColumns.map((col, idx) => (
                        <MenuItem key={idx} value={col}>{col}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Preview */}
              {previewData.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Previzualizare (primele 5 rânduri):
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Nr.</strong></TableCell>
                          <TableCell><strong>Produs</strong></TableCell>
                          <TableCell><strong>Cant.</strong></TableCell>
                          <TableCell><strong>TVA%</strong></TableCell>
                          <TableCell><strong>Preț Net</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {previewData.map((row) => (
                          <TableRow key={row.index}>
                            <TableCell>{row.index}</TableCell>
                            <TableCell>{row.product}</TableCell>
                            <TableCell>{row.quantity}</TableCell>
                            <TableCell>{row.vatRate}</TableCell>
                            <TableCell>{row.unitNetPrice}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Total rânduri în Excel: {excelData?.length || 0}
                  </Typography>
                </Box>
              )}

              {/* Instrucțiuni */}
              <Alert severity="info">
                <strong>Instrucțiuni:</strong>
                <br />
                • Maparea "Denumire produs" este obligatorie
                <br />
                • Câmpurile nemapate vor folosi: Cantitate=1, TVA=0%, Preț=0
                <br />
                • Rândurile goale din Excel vor fi ignorate automat
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImportDialogOpen(false)}>
              Anulează
            </Button>
            <Button 
              onClick={importExcelLines} 
              variant="contained"
              disabled={!columnMapping.product}
            >
              Importă {excelData?.length || 0} linii
            </Button>
          </DialogActions>
        </Dialog>

        {/* Note */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Note (opțional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              label="Note factură proforma"
              value={invoiceData.notes}
              onChange={handleInvoiceChange('notes')}
              placeholder="ex: Oferta este valabilă 30 de zile. Prețurile nu includ transportul..."
              helperText="Notele vor fi incluse în factura PDF și Excel"
            />
          </CardContent>
        </Card>

        {/* Totaluri și Export */}
        <Paper sx={{ p: 3, bgcolor: 'warning.lighter', border: '2px solid', borderColor: 'warning.main' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total net:</Typography>
                  <Typography fontWeight="700">{totals.net} {invoiceData.currency}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total TVA:</Typography>
                  <Typography fontWeight="700" color="info.main">{totals.vat} {invoiceData.currency}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total brut:</Typography>
                  <Typography variant="h5" fontWeight="800" color="warning.dark">{totals.gross} {invoiceData.currency}</Typography>
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
                
                <Divider sx={{ my: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Google Drive
                  </Typography>
                </Divider>
                
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => saveToGoogleDrive('pdf')}
                  fullWidth
                  disabled={isUploadingToDrive}
                >
                  {isUploadingToDrive ? 'Procesare...' : 'Salvează PDF în Drive'}
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => saveToGoogleDrive('excel')}
                  fullWidth
                  disabled={isUploadingToDrive}
                >
                  {isUploadingToDrive ? 'Procesare...' : 'Salvează Excel în Drive'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Info */}
        <Paper sx={{ p: 1.5, bgcolor: 'grey.50' }}>
          <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
            💡 <strong>Factură Proforma:</strong> Document informativ folosit pentru oferte și estimări de preț.
            <br />
            ⚠️ <strong>Important:</strong> Nu este document fiscal! Nu poate fi folosit pentru contabilitate sau deduceri fiscale.
            <br />
            🔍 <strong>Căutare ANAF:</strong> Introdu CUI-ul și apasă pe iconița de căutare (🔍) pentru completare automată.
            <br />
            📄 <strong>PDF:</strong> Format profesional, gata de trimis către client.
            <br />
            📊 <strong>Excel:</strong> Date editabile pentru ajustări rapide.
            <br />
            ☁️ <strong>Google Drive:</strong> Salvează rapid fișierele (PDF/Excel) în Google Drive - descarcă automat și deschide Drive pentru upload.
          </Typography>
        </Paper>
      </Stack>
    </ToolLayout>
  );
};

export default ProformaInvoiceGenerator;

