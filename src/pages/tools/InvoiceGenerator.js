import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
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
import CodeIcon from '@mui/icons-material/Code';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
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

const InvoiceGenerator = () => {
  const [loadingSupplier, setLoadingSupplier] = useState(false);
  const [loadingClient, setLoadingClient] = useState(false);
  const [anafError, setAnafError] = useState('');
  const [saveDataConsent, setSaveDataConsent] = useState(false);
  
  const [invoiceData, setInvoiceData] = useState({
    // Date factură
    series: '',
    number: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
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
    
    // Beneficiar
    clientName: '',
    clientCUI: '',
    clientRegCom: '',
    clientAddress: '',
    clientCity: '',
    clientPhone: '',
    clientEmail: ''
  });

  const [attachedFiles, setAttachedFiles] = useState([]);
  const [fileError, setFileError] = useState('');

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

  // Constantă pentru criptare/decriptare și numele cookie-ului
  const ENCRYPTION_KEY = 'normalro-invoice-supplier-data-2024';
  const COOKIE_NAME = 'normalro_invoice_supplier';

  // Funcții pentru gestionarea cookie-urilor
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
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Eroare la decriptarea datelor:', error);
      return null;
    }
  };

  const saveSupplierDataToCookie = () => {
    if (!saveDataConsent) return;

    // Extrage cota de TVA din prima linie (dacă există)
    const defaultVatRate = lines.length > 0 ? lines[0].vatRate : '21';

    const dataToSave = {
      series: invoiceData.series,
      number: invoiceData.number,
      currency: invoiceData.currency,
      defaultVatRate: defaultVatRate,
      supplierName: invoiceData.supplierName,
      supplierCUI: invoiceData.supplierCUI,
      supplierRegCom: invoiceData.supplierRegCom,
      supplierAddress: invoiceData.supplierAddress,
      supplierCity: invoiceData.supplierCity,
      supplierPhone: invoiceData.supplierPhone,
      supplierEmail: invoiceData.supplierEmail,
      supplierBank: invoiceData.supplierBank,
      supplierIBAN: invoiceData.supplierIBAN
    };

    const encryptedData = encryptData(dataToSave);
    setCookie(COOKIE_NAME, encryptedData, 90); // 90 zile
  };

  const incrementInvoiceNumber = (numberStr) => {
    if (!numberStr) return '1';
    
    // Încearcă să parseze numărul
    const parsed = parseInt(numberStr, 10);
    if (!isNaN(parsed)) {
      // Dacă e număr simplu, incrementează
      const incremented = parsed + 1;
      // Păstrează numărul de zerouri din față (ex: 001 -> 002)
      return incremented.toString().padStart(numberStr.length, '0');
    }
    
    // Dacă numărul conține caractere non-numerice, încearcă să găsești partea numerică la final
    const match = numberStr.match(/^(.*?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const numPart = match[2];
      const incremented = parseInt(numPart, 10) + 1;
      return prefix + incremented.toString().padStart(numPart.length, '0');
    }
    
    // Dacă nu găsește niciun număr, returnează string-ul original + '1'
    return numberStr + '1';
  };

  const loadSupplierDataFromCookie = () => {
    const encryptedData = getCookie(COOKIE_NAME);
    if (!encryptedData) return;

    const data = decryptData(encryptedData);
    if (data) {
      setInvoiceData(prev => ({
        ...prev,
        series: data.series || '',
        number: incrementInvoiceNumber(data.number), // Incrementează numărul automat
        currency: data.currency || 'RON',
        supplierName: data.supplierName || '',
        supplierCUI: data.supplierCUI || '',
        supplierRegCom: data.supplierRegCom || '',
        supplierAddress: data.supplierAddress || '',
        supplierCity: data.supplierCity || '',
        supplierPhone: data.supplierPhone || '',
        supplierEmail: data.supplierEmail || '',
        supplierBank: data.supplierBank || '',
        supplierIBAN: data.supplierIBAN || ''
      }));
      
      // Restaurează cota de TVA din cookie
      const savedVatRate = data.defaultVatRate || '21';
      setLines(prevLines => 
        prevLines.map((line, index) => 
          index === 0 
            ? { ...line, vatRate: savedVatRate }
            : line
        )
      );
      
      setSaveDataConsent(true); // Bifează automat checkbox-ul dacă există date salvate
    }
  };

  // Încarcă datele la mount
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

  const handleFileAttachment = async (e) => {
    const files = Array.from(e.target.files || []);
    setFileError('');
    
    // Constante conform ANAF
    // IMPORTANT: Fișierele în Base64 cresc cu ~37% (factor 1.37)
    // Plus overhead XML (~5%), deci folosim factor de siguranță 1.45
    const BASE64_OVERHEAD = 1.45; // Fișierele devin cu 45% mai mari în Base64 + XML
    const MAX_TOTAL_SIZE_ANAF = 5 * 1024 * 1024; // 5 MB limita ANAF
    const MAX_TOTAL_SIZE = MAX_TOTAL_SIZE_ANAF / BASE64_OVERHEAD; // ~3.45 MB în fișiere originale
    const MAX_FILE_SIZE = MAX_TOTAL_SIZE; // Același limit per fișier
    
    // Verifică dimensiunea fiecărui fișier (înainte de Base64)
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      const fileSizeMB = (oversizedFiles[0].size / 1024 / 1024).toFixed(2);
      const estimatedBase64MB = (oversizedFiles[0].size * BASE64_OVERHEAD / 1024 / 1024).toFixed(2);
      setFileError(
        `Fișierul "${oversizedFiles[0].name}" este prea mare (${fileSizeMB} MB, ~${estimatedBase64MB} MB în XML). ` +
        `Dimensiunea maximă permisă: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)} MB per fișier (pentru a respecta limita ANAF de 5 MB în XML).`
      );
      e.target.value = ''; // Reset input
      return;
    }
    
    // Calculează dimensiunea curentă totală (fișiere originale)
    const currentTotalSize = attachedFiles.reduce((sum, file) => sum + file.size, 0);
    const newFilesSize = files.reduce((sum, file) => sum + file.size, 0);
    const totalSize = currentTotalSize + newFilesSize;
    
    // Verifică dimensiunea totală (cu estimare Base64)
    if (totalSize > MAX_TOTAL_SIZE) {
      const remainingSpace = MAX_TOTAL_SIZE - currentTotalSize;
      const currentMB = (currentTotalSize / 1024 / 1024).toFixed(2);
      const remainingMB = (remainingSpace / 1024 / 1024).toFixed(2);
      const newMB = (newFilesSize / 1024 / 1024).toFixed(2);
      const estimatedXmlMB = (totalSize * BASE64_OVERHEAD / 1024 / 1024).toFixed(2);
      
      setFileError(
        `Depășești limita pentru fișiere atașate! ` +
        `Dimensiune curentă: ${currentMB} MB (~${(currentTotalSize * BASE64_OVERHEAD / 1024 / 1024).toFixed(2)} MB în XML). ` +
        `Spațiu disponibil: ${remainingMB} MB. ` +
        `Încerci să adaugi: ${newMB} MB. ` +
        `Dimensiunea estimată în XML ar fi: ${estimatedXmlMB} MB (limita ANAF: 5 MB).`
      );
      e.target.value = ''; // Reset input
      return;
    }
    
    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result.split(',')[1];
          resolve({
            id: Date.now() + Math.random(),
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size, // Păstrăm dimensiunea originală
            base64Size: base64.length, // Dimensiunea reală în Base64
            base64: base64
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const loadedFiles = await Promise.all(filePromises);
    
    // Verificare finală cu dimensiunea Base64 reală
    const currentBase64Size = attachedFiles.reduce((sum, file) => sum + (file.base64Size || file.base64.length), 0);
    const newBase64Size = loadedFiles.reduce((sum, file) => sum + file.base64Size, 0);
    const totalBase64Size = currentBase64Size + newBase64Size;
    
    // Adăugăm 10% overhead pentru structura XML
    const estimatedXmlSize = totalBase64Size * 1.1;
    
    if (estimatedXmlSize > MAX_TOTAL_SIZE_ANAF) {
      setFileError(
        `Dimensiunea finală în XML (${(estimatedXmlSize / 1024 / 1024).toFixed(2)} MB) depășește limita ANAF de 5 MB! ` +
        `Te rugăm să ștergi sau să comprimi fișierele.`
      );
      e.target.value = ''; // Reset input
      return;
    }
    
    setAttachedFiles(prev => [...prev, ...loadedFiles]);
    e.target.value = ''; // Reset input pentru a permite re-upload același fișier
  };

  const removeAttachedFile = (id) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== id));
    setFileError(''); // Reset error când se șterge un fișier
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

        // Prima linie este header-ul
        const headers = data[0].filter(h => h); // Remove empty headers
        setExcelColumns(headers);
        setExcelData(data.slice(1)); // Restul sunt datele
        setImportDialogOpen(true);
        
        // Reset mapare
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
    e.target.value = ''; // Reset input
  };

  const handleMappingChange = (field, columnName) => {
    const newMapping = { ...columnMapping, [field]: columnName };
    setColumnMapping(newMapping);
    
    // Actualizează preview
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

        // Skip rânduri goale
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

    // Adaugă liniile importate la cele existente (sau înlocuiește dacă prima linie e goală)
    if (lines.length === 1 && !lines[0].product && !lines[0].unitNetPrice) {
      setLines(newLines);
    } else {
      setLines([...lines, ...newLines]);
    }

    setImportDialogOpen(false);
    alert(`Au fost importate ${newLines.length} linii cu succes!`);
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
        setAnafError(result.error || `Nu s-a găsit o companie cu codul fiscal ${invoiceData.supplierCUI}`);
      }
    } catch (error) {
      setAnafError(`Nu s-a găsit o companie cu codul fiscal ${invoiceData.supplierCUI}`);
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
        setAnafError(result.error || `Nu s-a găsit o companie cu codul fiscal ${invoiceData.clientCUI}`);
      }
    } catch (error) {
      setAnafError(`Nu s-a găsit o companie cu codul fiscal ${invoiceData.clientCUI}`);
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
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${line.unitNetPrice} ${invoiceData.currency}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 9px;">${line.vatRate}%</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${calculateLineVat(line)} ${invoiceData.currency}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${line.unitGrossPrice} ${invoiceData.currency}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${calculateLineTotal(line, 'net')} ${invoiceData.currency}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${calculateLineTotal(line, 'vat')} ${invoiceData.currency}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${calculateLineTotal(line, 'gross')} ${invoiceData.currency}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f5f5f5; font-weight: bold;">
              <td colspan="7" style="border: 1px solid #ddd; padding: 8px; font-size: 11px; font-weight: bold;">TOTAL FACTURĂ</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 11px; font-weight: bold;">${totals.net} ${invoiceData.currency}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 11px; font-weight: bold;">${totals.vat} ${invoiceData.currency}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 11px; font-weight: bold;">${totals.gross} ${invoiceData.currency}</td>
            </tr>
          </tfoot>
        </table>
        ${invoiceData.notes ? `
        <div style="margin-top: 25px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #2196F3; border-radius: 4px;">
          <strong style="font-size: 11px;">Note:</strong><br/>
          <div style="margin-top: 8px; font-size: 10px; line-height: 1.6; white-space: pre-wrap;">${invoiceData.notes}</div>
        </div>` : ''}
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
      
      // Salvează datele în cookie dacă este consimțământ
      saveSupplierDataToCookie();
      
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
    
    // Salvează datele în cookie dacă este consimțământ
    saveSupplierDataToCookie();
  };

  const validateOnANAF = () => {
    // Generează și descarcă XML-ul
    exportToXML();
    
    // Deschide validatorul ANAF într-un tab nou
    setTimeout(() => {
      window.open('https://www.anaf.ro/uploadxmi/', '_blank');
      
      // Afișează instrucțiuni
      alert(
        '📋 Validare XML pe ANAF:\n\n' +
        '1. Fișierul XML a fost descărcat automat\n' +
        '2. S-a deschis validatorul ANAF într-un tab nou (anaf.ro/uploadxmi)\n' +
        '3. Pe pagina ANAF, apasă "Alegeți un fișier..."\n' +
        '4. Selectează XML-ul descărcat\n' +
        '5. Asigură-te că standardul "FACT1" este selectat\n' +
        '6. Apasă "Validare fisier"\n' +
        '7. Verifică rezultatele validării\n\n' +
        '✅ Dacă validarea este OK, XML-ul este gata de încărcat pe RoE-Factura!'
      );
    }, 500);
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
        // Generează PDF folosind funcția existentă exportToPDF
        // Refolosim logica dar generăm blob în loc de download
        const totals = calculateTotals();
        const invoiceElement = document.createElement('div');
        invoiceElement.style.width = '800px';
        invoiceElement.style.padding = '20px';
        invoiceElement.style.backgroundColor = 'white';
        
        // Folosește același HTML ca la exportToPDF (versiune completă)
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
                    CUI: ${invoiceData.supplierCUI || '-'}
                  </div>
                </td>
                <td style="width: 50%; vertical-align: top; padding-left: 15px;">
                  <strong style="font-size: 12px;">BENEFICIAR:</strong><br/>
                  <div style="margin-top: 5px; line-height: 1.6;">
                    ${invoiceData.clientName || '-'}<br/>
                    CUI: ${invoiceData.clientCUI || '-'}
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
        filename = `factura_${invoiceData.series || 'FAC'}_${invoiceData.number || '001'}_${invoiceData.issueDate}.pdf`;
        mimeType = 'application/pdf';
        
        document.body.removeChild(invoiceElement);
        
      } else if (fileType === 'excel') {
        // Generează Excel ca blob (versiune completă)
        const totals = calculateTotals();
        const excelData = [];
        
        excelData.push(['FACTURĂ']);
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
        XLSX.utils.book_append_sheet(wb, ws, 'Factura');
        
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        filename = `factura_${invoiceData.series || 'FAC'}_${invoiceData.number || '001'}_${invoiceData.issueDate}.xlsx`;
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

  const exportToXML = () => {
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

    // Helper pentru a deduce codul județului din oraș și adresă (ISO 3166-2:RO)
    const getCountyCode = (city, address) => {
      const searchText = `${city || ''} ${address || ''}`.toLowerCase();
      if (!searchText.trim()) return '';
      
      // Mapare orașelor principale către coduri județ
      const cityToCounty = {
        'bucuresti': 'RO-B',
        'bucharest': 'RO-B',
        'sector': 'RO-B',
        'alba iulia': 'RO-AB',
        'alba': 'RO-AB',
        'pitesti': 'RO-AG',
        'arges': 'RO-AG',
        'arad': 'RO-AR',
        'bacau': 'RO-BC',
        'oradea': 'RO-BH',
        'bihor': 'RO-BH',
        'bistrita': 'RO-BN',
        'braila': 'RO-BR',
        'botosani': 'RO-BT',
        'brasov': 'RO-BV',
        'buzau': 'RO-BZ',
        'cluj': 'RO-CJ',
        'cluj-napoca': 'RO-CJ',
        'napoca': 'RO-CJ',
        'calarasi': 'RO-CL',
        'resita': 'RO-CS',
        'caras': 'RO-CS',
        'constanta': 'RO-CT',
        'covasna': 'RO-CV',
        'targoviste': 'RO-DB',
        'dambovita': 'RO-DB',
        'craiova': 'RO-DJ',
        'dolj': 'RO-DJ',
        'targu jiu': 'RO-GJ',
        'gorj': 'RO-GJ',
        'galati': 'RO-GL',
        'giurgiu': 'RO-GR',
        'deva': 'RO-HD',
        'hunedoara': 'RO-HD',
        'miercurea': 'RO-HR',
        'harghita': 'RO-HR',
        'ilfov': 'RO-IF',
        'slobozia': 'RO-IL',
        'ialomita': 'RO-IL',
        'iasi': 'RO-IS',
        'iași': 'RO-IS',
        'drobeta': 'RO-MH',
        'mehedinti': 'RO-MH',
        'baia mare': 'RO-MM',
        'maramures': 'RO-MM',
        'targu mures': 'RO-MS',
        'mures': 'RO-MS',
        'piatra neamt': 'RO-NT',
        'neamt': 'RO-NT',
        'slatina': 'RO-OT',
        'olt': 'RO-OT',
        'ploiesti': 'RO-PH',
        'prahova': 'RO-PH',
        'sibiu': 'RO-SB',
        'satu mare': 'RO-SM',
        'zalau': 'RO-SJ',
        'salaj': 'RO-SJ',
        'suceava': 'RO-SV',
        'alexandria': 'RO-TR',
        'teleorman': 'RO-TR',
        'timisoara': 'RO-TM',
        'timis': 'RO-TM',
        'tulcea': 'RO-TL',
        'vaslui': 'RO-VS',
        'ramnicu valcea': 'RO-VL',
        'valcea': 'RO-VL',
        'focsani': 'RO-VN',
        'vrancea': 'RO-VN'
      };

      // Caută în mapare (caută în oraș + adresă combinat)
      for (const [key, code] of Object.entries(cityToCounty)) {
        if (searchText.includes(key)) {
          return code;
        }
      }

      return ''; // Dacă nu găsește, returnează gol
    };

    // Format data pentru XML e-Factura (UBL 2.1 pentru România)
    const invoiceNumber = `${invoiceData.series || 'FAC'}${invoiceData.number || '001'}`;
    const issueDate = invoiceData.issueDate || new Date().toISOString().split('T')[0];
    const currencyCode = invoiceData.currency || 'RON';
    
    const supplierCountyCode = getCountyCode(invoiceData.supplierCity, invoiceData.supplierAddress);
    const clientCountyCode = getCountyCode(invoiceData.clientCity, invoiceData.clientAddress);

    // Calculează grupuri TVA
    const vatGroups = {};
    lines.forEach(line => {
      const vatRate = parseFloat(line.vatRate) || 0;
      const taxableAmount = parseFloat(calculateLineTotal(line, 'net')) || 0;
      const taxAmount = parseFloat(calculateLineTotal(line, 'vat')) || 0;
      
      if (!vatGroups[vatRate]) {
        vatGroups[vatRate] = { taxableAmount: 0, taxAmount: 0 };
      }
      vatGroups[vatRate].taxableAmount += taxableAmount;
      vatGroups[vatRate].taxAmount += taxAmount;
    });

    // Construiește XML manual
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.1</cbc:CustomizationID>
  <cbc:ID>${escapeXML(invoiceNumber)}</cbc:ID>
  <cbc:IssueDate>${escapeXML(issueDate)}</cbc:IssueDate>
  <cbc:DueDate>${escapeXML(invoiceData.dueDate || issueDate)}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>${invoiceData.notes ? `
  <cbc:Note>${escapeXML(invoiceData.notes)}</cbc:Note>` : ''}
  <cbc:DocumentCurrencyCode>${escapeXML(currencyCode)}</cbc:DocumentCurrencyCode>
  ${attachedFiles.length > 0 ? attachedFiles.map((file, index) => `
  <!-- Document atașat ${index + 1} -->
  <cac:AdditionalDocumentReference>
    <cbc:ID>${escapeXML(file.name)}</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="${escapeXML(file.mimeType)}" filename="${escapeXML(file.name)}">${file.base64}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>`).join('') : ''}
  
  <!-- Furnizor -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escapeXML(invoiceData.supplierName)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXML(invoiceData.supplierAddress)}</cbc:StreetName>
        <cbc:CityName>${escapeXML(invoiceData.supplierCity)}</cbc:CityName>${supplierCountyCode ? `
        <cbc:CountrySubentity>${supplierCountyCode}</cbc:CountrySubentity>` : ''}
        <cac:Country>
          <cbc:IdentificationCode>RO</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>RO${escapeXML(invoiceData.supplierCUI)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXML(invoiceData.supplierName)}</cbc:RegistrationName>
        <cbc:CompanyID>${escapeXML(invoiceData.supplierRegCom)}</cbc:CompanyID>
      </cac:PartyLegalEntity>
      <cac:Contact>
        <cbc:Telephone>${escapeXML(invoiceData.supplierPhone)}</cbc:Telephone>
        <cbc:ElectronicMail>${escapeXML(invoiceData.supplierEmail)}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <!-- Beneficiar -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escapeXML(invoiceData.clientName)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXML(invoiceData.clientAddress)}</cbc:StreetName>
        <cbc:CityName>${escapeXML(invoiceData.clientCity)}</cbc:CityName>${clientCountyCode ? `
        <cbc:CountrySubentity>${clientCountyCode}</cbc:CountrySubentity>` : ''}
        <cac:Country>
          <cbc:IdentificationCode>RO</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>RO${escapeXML(invoiceData.clientCUI)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXML(invoiceData.clientName)}</cbc:RegistrationName>
        <cbc:CompanyID>${escapeXML(invoiceData.clientRegCom)}</cbc:CompanyID>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  ${invoiceData.supplierIBAN ? `
  <!-- Modalitate de plată -->
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>
    <cac:PayeeFinancialAccount>
      <cbc:ID>${escapeXML(invoiceData.supplierIBAN)}</cbc:ID>${invoiceData.supplierBank ? `
      <cbc:Name>${escapeXML(invoiceData.supplierBank)}</cbc:Name>` : ''}
    </cac:PayeeFinancialAccount>
  </cac:PaymentMeans>` : ''}
  
  <!-- Total TVA -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${escapeXML(currencyCode)}">${totals.vat}</cbc:TaxAmount>`;

    // Adaugă TaxSubtotal pentru fiecare cotă de TVA
    Object.entries(vatGroups).forEach(([rate, amounts]) => {
      xml += `
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${escapeXML(currencyCode)}">${amounts.taxableAmount.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${escapeXML(currencyCode)}">${amounts.taxAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>${rate}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>`;
    });

    xml += `
  </cac:TaxTotal>
  
  <!-- Totaluri monetare -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${escapeXML(currencyCode)}">${totals.net}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${escapeXML(currencyCode)}">${totals.net}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${escapeXML(currencyCode)}">${totals.gross}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${escapeXML(currencyCode)}">${totals.gross}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  `;

    // Adaugă linii factura
    lines.forEach((line, index) => {
      const lineNet = parseFloat(calculateLineTotal(line, 'net')) || 0;
      const qty = parseFloat(line.quantity) || 0;
      const unitPrice = parseFloat(line.unitNetPrice) || 0;
      const vatRate = parseFloat(line.vatRate) || 0;

      xml += `
  <!-- Linia ${index + 1} -->
  <cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="EA">${qty}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${escapeXML(currencyCode)}">${lineNet.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${escapeXML(line.product || 'Produs/Serviciu')}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>${vatRate}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${escapeXML(currencyCode)}">${unitPrice.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`;
    });

    xml += `
</Invoice>`;

    // Creează blob și descarcă
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `efactura_${invoiceData.series || 'FAC'}_${invoiceData.number || '001'}_${issueDate}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Salvează datele în cookie dacă este consimțământ
    saveSupplierDataToCookie();
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

        {/* Checkbox pentru salvarea datelor */}
        <Paper sx={{ p: 2, bgcolor: 'info.50', borderLeft: 4, borderColor: 'info.main' }}>
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
                🔒 <strong>Sunt de acord cu salvarea datelor mele într-un cookie criptat, pentru folosire ulterioară.</strong>
                <br />
                <Typography component="span" variant="caption" color="text.secondary" fontSize="0.75rem">
                  Dacă bifezi această opțiune, datele furnizorului (nume, CUI, adresă, etc.), seria, numărul, moneda și cota de TVA vor fi salvate automat în browser-ul tău (criptate) pentru 90 de zile, la apăsarea butonului de descărcare. La următoarea vizită, acestea vor fi pre-completate automat, iar numărul facturii va fi incrementat automat.
                </Typography>
              </Typography>
            }
          />
        </Paper>

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
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                    <MenuItem value="JPY">JPY - Yen japonez</MenuItem>
                  </Select>
                </FormControl>
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
                        endAdornment: <InputAdornment position="end">{invoiceData.currency}</InputAdornment>,
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
                          color: 'success.dark'
                        } 
                      }}
                      helperText={`${calculateLineTotal(line, 'net')} + ${calculateLineTotal(line, 'vat')} TVA`}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={addLine}
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
                Importă din Excel
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                />
              </Button>
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
                  <Typography fontWeight="700">{totals.net} {invoiceData.currency}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total TVA:</Typography>
                  <Typography fontWeight="700" color="info.main">{totals.vat} {invoiceData.currency}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total brut:</Typography>
                  <Typography variant="h5" fontWeight="800" color="success.dark">{totals.gross} {invoiceData.currency}</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Note și Atașamente */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Note și Atașamente
            </Typography>
            
            <Stack spacing={2}>
              {/* Câmp Note */}
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                label="Note factură (opțional)"
                value={invoiceData.notes}
                onChange={handleInvoiceChange('notes')}
                placeholder="ex: Plata în termen de 15 zile de la emitere..."
                helperText="Notele vor fi incluse în factura PDF și XML (e-Factura)"
              />

              {/* Upload Fișiere */}
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  size="small"
                >
                  Atașează fișiere (opțional)
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleFileAttachment}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  />
                </Button>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                  Fișierele vor fi incluse în XML (e-Factura) ca documente atașate. Format: PDF, JPG, PNG, DOC, XLS
                  <br />
                  <strong>Limită ANAF: 5 MB total în XML</strong> (fișiere originale + conversie Base64 + overhead XML)
                  {attachedFiles.length > 0 && (() => {
                    // Calculează dimensiunea Base64 reală
                    const totalBase64Size = attachedFiles.reduce((sum, file) => sum + (file.base64Size || file.base64?.length || 0), 0);
                    const estimatedXmlSize = totalBase64Size * 1.1; // +10% pentru structura XML
                    const totalOriginalSize = attachedFiles.reduce((sum, file) => sum + file.size, 0);
                    
                    const originalMB = (totalOriginalSize / 1024 / 1024).toFixed(2);
                    const xmlMB = (estimatedXmlSize / 1024 / 1024).toFixed(2);
                    const percentage = (estimatedXmlSize / (5 * 1024 * 1024) * 100).toFixed(0);
                    const color = percentage > 80 ? '#d32f2f' : percentage > 60 ? '#ed6c02' : '#2e7d32';
                    
                    return (
                      <span style={{ color: color, fontWeight: 'bold' }}>
                        <br />
                        📊 Fișiere originale: {originalMB} MB | Estimat în XML: {xmlMB} MB / 5 MB ({percentage}%)
                      </span>
                    );
                  })()}
                </Typography>
              </Box>

              {/* Eroare upload */}
              {fileError && (
                <Alert severity="error" onClose={() => setFileError('')}>
                  {fileError}
                </Alert>
              )}

              {/* Listă fișiere atașate */}
              {attachedFiles.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Fișiere atașate ({attachedFiles.length}):
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {attachedFiles.map((file) => (
                      <Chip
                        key={file.id}
                        label={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                        onDelete={() => removeAttachedFile(file.id)}
                        deleteIcon={<CloseIcon />}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Butoane Export */}
        <Grid container spacing={2}>
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
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<CodeIcon />}
                  onClick={exportToXML}
                  fullWidth
                >
                  Descarcă XML (e-Factura)
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={validateOnANAF}
                  fullWidth
                >
                  Validează XML pe ANAF
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

        {/* Info */}
        <Paper sx={{ p: 1.5, bgcolor: 'grey.50' }}>
          <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
            💡 <strong>Sfat:</strong> Completează toate detaliile și apasă pe unul din butoanele de descărcare pentru a genera factura.
            <br />
            🔍 <strong>Căutare ANAF:</strong> Introdu CUI-ul și apasă pe iconița de căutare (🔍) pentru a completa automat datele companiei din registrul ANAF.
            <br />
            📝 <strong>Note și Atașamente:</strong> Poți adăuga note explicative și atașa fișiere (PDF, imagini, documente) care vor fi incluse în XML.
            <br />
            📄 <strong>PDF:</strong> Factură formatată profesional cu toate detaliile și notele, gata de printat.
            <br />
            📊 <strong>Excel:</strong> Date tabelate, editabile în Excel/Calc pentru evidență contabilă.
            <br />
            📋 <strong>XML (e-Factura):</strong> Format UBL 2.1 cu note și fișiere atașate (embedded), compatibil cu RoE-Factura (ANAF).
            <br />
            ✅ <strong>Validează XML:</strong> Butonul "Validează XML pe ANAF" descarcă XML-ul și deschide validatorul oficial ANAF pentru verificare înainte de încărcare.
            <br />
            ☁️ <strong>Google Drive:</strong> Salvează rapid fișierele (PDF/Excel) în Google Drive - descarcă automat și deschide Drive pentru upload.
          </Typography>
        </Paper>
      </Stack>
    </ToolLayout>
  );
};

export default InvoiceGenerator;

