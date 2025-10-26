import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import HistoryIcon from '@mui/icons-material/History';
import StarIcon from '@mui/icons-material/Star';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import DownloadIcon from '@mui/icons-material/Download';
import ToolLayout from '../../components/ToolLayout';
import InvoiceHistoryDialog from '../../components/InvoiceHistoryDialog';
import ProductTemplateDialog from '../../components/ProductTemplateDialog';
import ClientTemplateDialog from '../../components/ClientTemplateDialog';
import CompanyForm from '../../components/CompanyForm';
import GoogleSheetsSidebar from '../../components/GoogleSheetsSidebar';
import GoogleSheetsPromptDialog from '../../components/GoogleSheetsPromptDialog';
import ClearDataConfirmDialog from '../../components/ClearDataConfirmDialog';
import { getCompanyDataByCUI } from '../../services/anafService';
import googleDriveService from '../../services/googleDriveService';
import googleSheetsService from '../../services/googleSheetsService';
import invoiceHistoryService from '../../services/invoiceHistoryService';
import templateService from '../../services/templateService';
import bnrService from '../../services/bnrService';
import paymentService from '../../services/paymentService';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import CryptoJS from 'crypto-js';

const InvoiceGenerator = () => {
  // Citește cota TVA implicită din .env (default: 21)
  const DEFAULT_VAT_RATE = process.env.REACT_APP_DEFAULT_TVA || '21';
  
  const [loadingSupplier, setLoadingSupplier] = useState(false);
  const [loadingClient, setLoadingClient] = useState(false);
  const [anafError, setAnafError] = useState('');
  const [saveDataConsent, setSaveDataConsent] = useState(true);
  const [clearDataDialogOpen, setClearDataDialogOpen] = useState(false);
  const [dataSummary, setDataSummary] = useState({});
  
  // State pentru Accordion-uri Sidebar
  const [expandedAccordion, setExpandedAccordion] = useState('why-sheets'); // Prima secțiune deschisă
  
  // State pentru popup sugestie Google Sheets
  const [showSheetsPrompt, setShowSheetsPrompt] = useState(false);
  
  const [invoiceData, setInvoiceData] = useState({
    // Identificare unică
    guid: '',
    
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
    supplierCounty: '',
    supplierCountry: 'Romania',
    supplierPhone: '',
    supplierEmail: '',
    supplierBankAccounts: [{ bank: '', iban: '' }],
    supplierVatPrefix: '-',
    
    // Beneficiar
    clientName: '',
    clientCUI: '',
    clientRegCom: '',
    clientAddress: '',
    clientCity: '',
    clientCounty: '',
    clientCountry: 'Romania',
    clientPhone: '',
    clientEmail: '',
    clientBankAccounts: [{ bank: '', iban: '' }],
    clientVatPrefix: '-'
  });

  const [attachedFiles, setAttachedFiles] = useState([]);
  const [fileError, setFileError] = useState('');

  // State pentru Google Drive
  const [googleDriveReady, setGoogleDriveReady] = useState(false);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);

  // State pentru Google Sheets
  const [googleSheetsReady, setGoogleSheetsReady] = useState(false);
  const [googleSheetsConnected, setGoogleSheetsConnected] = useState(false);
  const [googleSheetsId, setGoogleSheetsId] = useState('');
  const [sheetsDialogOpen, setSheetsDialogOpen] = useState(false);
  const [isSyncingToSheets, setIsSyncingToSheets] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // State pentru istoric facturi
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  // State pentru template-uri
  const [productTemplateDialogOpen, setProductTemplateDialogOpen] = useState(false);
  const [clientTemplateDialogOpen, setClientTemplateDialogOpen] = useState(false);

  // State pentru funcționalități RO specifice
  const [bnrRates, setBnrRates] = useState(null);
  const [bnrLoading, setBnrLoading] = useState(false);
  const [bnrError, setBnrError] = useState('');
  const [workingDaysCalculator, setWorkingDaysCalculator] = useState({
    days: 30,
    showDetails: false
  });
  const [qrCodeDialog, setQrCodeDialog] = useState({
    open: false,
    qrDataUrl: '',
    loading: false
  });

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
      vatRate: DEFAULT_VAT_RATE,
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

    // Extrage cota de TVA din prima linie (dacă există, altfel folosește .env)
    const defaultVatRate = lines.length > 0 ? lines[0].vatRate : DEFAULT_VAT_RATE;

    // Salvează toate datele curente ale furnizorului + setări factură
    const dataToSave = {
      // Setări factură
      series: invoiceData.series,
      number: invoiceData.number,
      currency: invoiceData.currency,
      defaultVatRate: defaultVatRate,
      
      // Date furnizor (complete)
      supplierName: invoiceData.supplierName,
      supplierCUI: invoiceData.supplierCUI,
      supplierRegCom: invoiceData.supplierRegCom,
      supplierAddress: invoiceData.supplierAddress,
      supplierCity: invoiceData.supplierCity,
      supplierCounty: invoiceData.supplierCounty,
      supplierCountry: invoiceData.supplierCountry,
      supplierPhone: invoiceData.supplierPhone,
      supplierEmail: invoiceData.supplierEmail,
      supplierVatPrefix: invoiceData.supplierVatPrefix,
      supplierBankAccounts: invoiceData.supplierBankAccounts,
      
      // Timestamp pentru urmărire
      lastSaved: new Date().toISOString()
    };

    const encryptedData = encryptData(dataToSave);
    setCookie(COOKIE_NAME, encryptedData, 90); // Resetează la 90 zile de fiecare dată
    
    console.log('✅ Date furnizor salvate în cookie (expirare resetată la 90 zile)');
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
        // Setări factură
        series: data.series || '',
        number: incrementInvoiceNumber(data.number), // Incrementează numărul automat
        currency: data.currency || 'RON',
        
        // Date furnizor (complete)
        supplierName: data.supplierName || '',
        supplierCUI: data.supplierCUI || '',
        supplierRegCom: data.supplierRegCom || '',
        supplierAddress: data.supplierAddress || '',
        supplierCity: data.supplierCity || '',
        supplierCounty: data.supplierCounty || '',
        supplierCountry: data.supplierCountry || 'Romania',
        supplierPhone: data.supplierPhone || '',
        supplierEmail: data.supplierEmail || '',
        supplierVatPrefix: data.supplierVatPrefix || '-',
        supplierBankAccounts: data.supplierBankAccounts || [{ bank: '', iban: '' }]
      }));
      
      // Log pentru debugging
      if (data.lastSaved) {
        console.log(`✅ Date furnizor încărcate din cookie (ultima salvare: ${new Date(data.lastSaved).toLocaleDateString('ro-RO')})`);
      }
      
      // Restaurează cota de TVA din cookie (fallback la .env)
      const savedVatRate = data.defaultVatRate || DEFAULT_VAT_RATE;
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
    loadBNRRates(); // Încarcă cursurile BNR la inițializare
    
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

    // Inițializează Google Sheets API
    const initGoogleSheets = async () => {
      try {
        await googleSheetsService.initializeGapi();
        googleSheetsService.initializeGis();
        
        if (googleSheetsService.isConfigured()) {
          setGoogleSheetsReady(true);
          
          // Încarcă Spreadsheet ID salvat
          const savedId = googleSheetsService.loadSpreadsheetId();
          if (savedId) {
            setGoogleSheetsId(savedId);
            setGoogleSheetsConnected(true);
            console.log('✅ Google Sheets conectat:', savedId);
            
            // Sincronizare automată în background (fără UI blocking)
            syncInBackground();
          }
        } else {
          console.warn('Google Sheets nu este configurat. Setează REACT_APP_GOOGLE_CLIENT_ID și REACT_APP_GOOGLE_API_KEY în .env');
        }
      } catch (error) {
        console.error('Eroare inițializare Google Sheets:', error);
      }
    };

    // Așteaptă încărcarea scripturilor Google
    const checkGoogleLoaded = setInterval(() => {
      if (window.gapi && window.google) {
        clearInterval(checkGoogleLoaded);
        initGoogleDrive();
        initGoogleSheets();
      }
    }, 100);

    // Cleanup după 10 secunde
    setTimeout(() => clearInterval(checkGoogleLoaded), 10000);

    return () => clearInterval(checkGoogleLoaded);
  }, []);

  // Sincronizare periodică în background (la fiecare 5 minute)
  useEffect(() => {
    if (!googleSheetsConnected) return;

    const intervalId = setInterval(async () => {
      try {
        console.log('⏰ Sincronizare periodică în background...');
        await syncInBackground();
        setLastSyncTime(new Date().toLocaleTimeString('ro-RO'));
      } catch (error) {
        console.log('ℹ️ Sincronizare periodică eșuată:', error.message);
      }
    }, 5 * 60 * 1000); // 5 minute

    return () => clearInterval(intervalId);
  }, [googleSheetsConnected]);

  // Verifică dacă să afișeze popup-ul de sugestie Google Sheets
  useEffect(() => {
    // Așteaptă să se inițializeze Google Sheets API
    if (!googleSheetsReady) return;

    // Verifică cookie-ul "nu îmi mai aminti"
    const dontShowAgain = getCookie('normalro_dont_show_sheets_prompt');
    if (dontShowAgain === 'true') {
      console.log('⏭️ Nu afișez popup Google Sheets (utilizatorul a ales "Nu îmi mai aminti")');
      return;
    }

    // Dacă nu e conectat la Google Sheets, afișează popup-ul după 2 secunde
    if (!googleSheetsConnected) {
      const timer = setTimeout(() => {
        setShowSheetsPrompt(true);
        console.log('💡 Afișez popup sugestie Google Sheets');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [googleSheetsReady, googleSheetsConnected]);

  const formatNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const handleInvoiceChange = (field) => (e) => {
    setInvoiceData({ ...invoiceData, [field]: e.target.value });
    setAnafError('');
  };

  // Handlers pentru conturi bancare Furnizor
  const handleAddSupplierBankAccount = () => {
    setInvoiceData({
      ...invoiceData,
      supplierBankAccounts: [...invoiceData.supplierBankAccounts, { bank: '', iban: '' }]
    });
  };

  const handleRemoveSupplierBankAccount = (index) => {
    const updatedAccounts = invoiceData.supplierBankAccounts.filter((_, i) => i !== index);
    setInvoiceData({
      ...invoiceData,
      supplierBankAccounts: updatedAccounts.length > 0 ? updatedAccounts : [{ bank: '', iban: '' }]
    });
  };

  const handleSupplierBankAccountChange = (index, field, value) => {
    const updatedAccounts = [...invoiceData.supplierBankAccounts];
    updatedAccounts[index][field] = value;
    setInvoiceData({
      ...invoiceData,
      supplierBankAccounts: updatedAccounts
    });
  };

  // Handlers pentru conturi bancare Client
  const handleAddClientBankAccount = () => {
    setInvoiceData({
      ...invoiceData,
      clientBankAccounts: [...invoiceData.clientBankAccounts, { bank: '', iban: '' }]
    });
  };

  const handleRemoveClientBankAccount = (index) => {
    const updatedAccounts = invoiceData.clientBankAccounts.filter((_, i) => i !== index);
    setInvoiceData({
      ...invoiceData,
      clientBankAccounts: updatedAccounts.length > 0 ? updatedAccounts : [{ bank: '', iban: '' }]
    });
  };

  const handleClientBankAccountChange = (index, field, value) => {
    const updatedAccounts = [...invoiceData.clientBankAccounts];
    updatedAccounts[index][field] = value;
    setInvoiceData({
      ...invoiceData,
      clientBankAccounts: updatedAccounts
    });
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
        const vat = parseFloat(vatRate) || parseFloat(DEFAULT_VAT_RATE); // Fallback la .env
        const grossPrice = netPrice * (1 + vat / 100);

        return {
          id: Date.now() + index,
          product: String(product || ''),
          quantity: String(parseFloat(quantity) || 1),
          unitNetPrice: formatNumber(netPrice),
          vatRate: String(parseFloat(vatRate) || parseFloat(DEFAULT_VAT_RATE)), // Fallback la .env
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
        // Verifică dacă compania este plătitoare de TVA
        const isVatPayer = result.data.platitorTVA === true || result.data.platitorTVA === 'true';
        
        setInvoiceData(prev => ({
          ...prev,
          supplierName: result.data.denumire,
          supplierCUI: result.data.cui,
          supplierRegCom: result.data.nrRegCom,
          supplierAddress: result.data.adresaCompleta,
          supplierCity: result.data.oras,
          supplierCounty: result.data.judet || '',
          supplierPhone: result.data.telefon,
          supplierVatPrefix: isVatPayer ? 'RO' : '-'
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
        // Verifică dacă compania este plătitoare de TVA
        const isVatPayer = result.data.platitorTVA === true || result.data.platitorTVA === 'true';
        
        setInvoiceData(prev => ({
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
      vatRate: DEFAULT_VAT_RATE,
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

  // Selectează un produs din template și adaugă-l ca linie nouă
  const selectProductFromTemplate = (product) => {
    const newLine = {
      id: Date.now(),
      product: product.product || '',
      quantity: product.quantity || '1',
      unitNetPrice: product.unitNetPrice || '0.00',
      vatRate: product.vatRate || DEFAULT_VAT_RATE,
      unitGrossPrice: product.unitGrossPrice || '0.00'
    };
    
    setLines([...lines, newLine]);
  };

  // Selectează un client din template și completează datele
  const selectClientFromTemplate = (client) => {
    setInvoiceData({
      ...invoiceData,
      clientName: client.clientName || '',
      clientCUI: client.clientCUI || '',
      clientRegCom: client.clientRegCom || '',
      clientAddress: client.clientAddress || '',
      clientCity: client.clientCity || '',
      clientCounty: client.clientCounty || '',
      clientCountry: client.clientCountry || 'Romania',
      clientPhone: client.clientPhone || '',
      clientEmail: client.clientEmail || '',
      clientVatPrefix: client.clientVatPrefix || 'RO'
    });
  };

  // Salvează clientul curent ca template
  const saveCurrentClientAsTemplate = () => {
    if (!invoiceData.clientName) {
      alert('Introdu mai întâi numele clientului!');
      return;
    }

    templateService.saveClientTemplate({
      name: invoiceData.clientName,
      cui: invoiceData.clientCUI,
      regCom: invoiceData.clientRegCom,
      address: invoiceData.clientAddress,
      city: invoiceData.clientCity,
      county: invoiceData.clientCounty,
      country: invoiceData.clientCountry,
      phone: invoiceData.clientPhone,
      email: invoiceData.clientEmail,
      vatPrefix: invoiceData.clientVatPrefix
    });

    alert(`✅ Client "${invoiceData.clientName}" salvat în template-uri!`);
  };

  // Încarcă o factură din istoric în formular
  const loadInvoiceFromHistory = (invoice) => {
    // Încarcă date factură
    setInvoiceData({
      series: invoice.series || '',
      number: invoice.number || '',
      issueDate: invoice.issueDate || new Date().toISOString().split('T')[0],
      dueDate: invoice.dueDate || '',
      currency: invoice.currency || 'RON',
      notes: invoice.notes || '',
      
      // Furnizor
      supplierName: invoice.supplier.name || '',
      supplierCUI: invoice.supplier.cui || '',
      supplierRegCom: invoice.supplier.regCom || '',
      supplierAddress: invoice.supplier.address || '',
      supplierCity: invoice.supplier.city || '',
      supplierCounty: invoice.supplier.county || '',
      supplierCountry: invoice.supplier.country || 'Romania',
      supplierPhone: invoice.supplier.phone || '',
      supplierEmail: invoice.supplier.email || '',
      supplierBank: invoice.supplier.bank || '',
      supplierIBAN: invoice.supplier.iban || '',
      supplierVatPrefix: invoice.supplier.vatPrefix || 'RO',
      
      // Client
      clientName: invoice.client.name || '',
      clientCUI: invoice.client.cui || '',
      clientRegCom: invoice.client.regCom || '',
      clientAddress: invoice.client.address || '',
      clientCity: invoice.client.city || '',
      clientCounty: invoice.client.county || '',
      clientCountry: invoice.client.country || 'Romania',
      clientPhone: invoice.client.phone || '',
      clientEmail: invoice.client.email || '',
      clientVatPrefix: invoice.client.vatPrefix || 'RO'
    });

    // Încarcă linii produse
    if (invoice.lines && invoice.lines.length > 0) {
      setLines(invoice.lines.map((line, index) => ({
        id: Date.now() + index,
        product: line.product || '',
        quantity: line.quantity || '1',
        unitNetPrice: line.unitNetPrice || '0.00',
        vatRate: line.vatRate || '0',
        unitGrossPrice: line.unitGrossPrice || '0.00'
      })));
    }

    // Scroll la top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ===== Funcții Popup Sugestie Google Sheets =====
  
  /**
   * Gestionează "Mai târziu" - închide popup-ul
   */
  const handleSheetsPromptLater = () => {
    setShowSheetsPrompt(false);
    console.log('⏰ Utilizatorul a ales "Mai târziu"');
  };

  /**
   * Gestionează "Conectează-te acum" - deschide creare spreadsheet
   */
  const handleSheetsPromptConnect = async () => {
    setShowSheetsPrompt(false);
    console.log('✅ Utilizatorul a ales "Conectează-te acum"');
    await createNewSpreadsheet();
  };

  /**
   * Gestionează "Nu îmi mai aminti" - salvează cookie și închide
   */
  const handleSheetsPromptNever = () => {
    // Salvează cookie pentru 365 zile
    const expires = new Date();
    expires.setDate(expires.getDate() + 365);
    document.cookie = `normalro_dont_show_sheets_prompt=true; expires=${expires.toUTCString()}; path=/`;
    
    setShowSheetsPrompt(false);
    console.log('🚫 Utilizatorul a ales "Nu îmi mai aminti" - cookie salvat');
  };

  // ===== Funcții Gestionare Date Salvate =====
  
  /**
   * Calculează sumarul datelor salvate în localStorage și cookie
   */
  const calculateDataSummary = () => {
    const summary = {
      cookie: {
        hasData: false,
        supplierName: '',
        series: '',
        number: '',
        savedDate: ''
      },
      templates: {
        products: 0,
        clients: 0
      },
      invoices: 0,
      googleSheets: {
        connected: googleSheetsConnected,
        spreadsheetId: googleSheetsId
      }
    };

    // Verifică cookie
    const cookieData = document.cookie.split('; ').find(row => row.startsWith('normalro_supplier_data='));
    if (cookieData) {
      try {
        const data = JSON.parse(decodeURIComponent(cookieData.split('=')[1]));
        summary.cookie.hasData = true;
        summary.cookie.supplierName = data.supplierName || '';
        summary.cookie.series = data.series || '';
        summary.cookie.number = data.number || '';
        summary.cookie.savedDate = data.savedDate || '';
      } catch (e) {
        console.error('Eroare citire cookie:', e);
      }
    }

    // Verifică template-uri
    summary.templates.products = templateService.getProductTemplates().length;
    summary.templates.clients = templateService.getClientTemplates().length;

    // Verifică istoric facturi
    summary.invoices = invoiceHistoryService.getAllInvoices().length;

    return summary;
  };

  /**
   * Gestionează modificarea checkbox-ului de salvare date
   */
  const handleSaveDataConsentChange = (event) => {
    const newValue = event.target.checked;

    // Dacă utilizatorul debifează checkbox-ul
    if (!newValue && saveDataConsent) {
      // Calculează sumarul datelor
      const summary = calculateDataSummary();
      setDataSummary(summary);
      
      // Afișează dialogul de confirmare
      setClearDataDialogOpen(true);
    } else {
      // Dacă utilizatorul bifează checkbox-ul, permite direct
      setSaveDataConsent(newValue);
    }
  };

  /**
   * Confirmă și șterge toate datele salvate
   */
  const confirmClearData = () => {
    try {
      // Șterge cookie
      document.cookie = 'normalro_supplier_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      console.log('🗑️ Cookie șters');

      // Șterge template-uri
      templateService.clearAllTemplates();
      console.log('🗑️ Template-uri șterse');

      // Șterge istoric facturi
      invoiceHistoryService.clearAllInvoices();
      console.log('🗑️ Istoric facturi șters');

      // Actualizează state
      setSaveDataConsent(false);
      setClearDataDialogOpen(false);

      alert(
        '✅ Toate datele au fost șterse cu succes!\n\n' +
        '• Cookie-ul cu datele furnizorului a fost șters\n' +
        '• Template-urile de produse au fost șterse\n' +
        '• Template-urile de clienți au fost șterse\n' +
        '• Istoricul facturilor a fost șters\n\n' +
        'Datele din Google Sheets rămân neschimbate.'
      );

    } catch (error) {
      console.error('Eroare ștergere date:', error);
      alert(
        '❌ Eroare la ștergerea datelor!\n\n' +
        error.message
      );
    }
  };

  /**
   * Anulează ștergerea datelor
   */
  const cancelClearData = () => {
    setClearDataDialogOpen(false);
    // Checkbox-ul rămâne bifat
  };

  // ===== Funcții Google Sheets =====
  
  /**
   * Sincronizare automată în background (fără UI blocking)
   */
  const syncInBackground = async () => {
    try {
      console.log('🔄 Sincronizare automată în background...');
      
      // Verifică dacă există token valid (fără să forțeze autorizarea)
      const token = window.gapi.client.getToken();
      if (!token || !token.access_token) {
        console.log('⏭️ Nu există token valid, sări peste sincronizare automată');
        return;
      }
      
      // Sincronizează doar date furnizor (nu toate datele pentru a fi mai rapid)
      await saveSupplierDataToSheets();
      console.log('✅ Sincronizare automată completă (date furnizor)');
      
    } catch (error) {
      // Nu afișa erori pentru sincronizarea automată (nu vrem să deranjăm utilizatorul)
      console.log('ℹ️ Sincronizare automată eșuată (normal dacă nu e autorizat):', error.message);
    }
  };
  
  /**
   * Creează un nou Google Spreadsheet pentru Invoice Generator
   */
  const createNewSpreadsheet = async () => {
    if (!googleSheetsReady) {
      alert('Google Sheets API nu este inițializat încă. Te rugăm să aștepți câteva secunde.');
      return;
    }

    setIsSyncingToSheets(true);
    setSyncStatus('Creare spreadsheet nou...');

    try {
      // Solicită autorizare
      await googleSheetsService.requestAuthorization();
      
      // Creează spreadsheet-ul
      const result = await googleSheetsService.createInvoiceSpreadsheet();
      
      setGoogleSheetsId(result.id);
      setGoogleSheetsConnected(true);
      setSyncStatus('');
      
      alert(
        `✅ Spreadsheet creat cu succes!\n\n` +
        `📄 ID: ${result.id}\n\n` +
        `Spreadsheet-ul a fost creat cu 4 sheet-uri:\n` +
        `• Date Furnizor\n` +
        `• Template Produse\n` +
        `• Template Clienți\n` +
        `• Istoric Facturi\n\n` +
        `Vrei să deschizi spreadsheet-ul în Google Sheets?`
      );
      
      window.open(result.url, '_blank');
      
    } catch (error) {
      console.error('Eroare creare spreadsheet:', error);
      setSyncStatus('');
      alert(
        `❌ Eroare la crearea spreadsheet-ului!\n\n` +
        `${error.message}\n\n` +
        `Verifică dacă ai autorizat aplicația.`
      );
    } finally {
      setIsSyncingToSheets(false);
    }
  };

  /**
   * Conectează un spreadsheet existent
   */
  const connectExistingSpreadsheet = async (spreadsheetId) => {
    if (!googleSheetsReady) {
      alert('Google Sheets API nu este inițializat încă.');
      return;
    }

    setIsSyncingToSheets(true);
    setSyncStatus('Verificare spreadsheet...');

    try {
      // Solicită autorizare
      await googleSheetsService.requestAuthorization();
      
      // Validează spreadsheet-ul
      const isValid = await googleSheetsService.validateSpreadsheet(spreadsheetId);
      
      if (!isValid) {
        throw new Error('Spreadsheet-ul nu este valid sau nu ai acces la el.');
      }
      
      googleSheetsService.setSpreadsheetId(spreadsheetId);
      setGoogleSheetsId(spreadsheetId);
      setGoogleSheetsConnected(true);
      setSyncStatus('');
      
      alert(
        `✅ Conectat cu succes!\n\n` +
        `📄 Spreadsheet ID: ${spreadsheetId}\n\n` +
        `Acum poți sincroniza datele cu acest spreadsheet.`
      );
      
    } catch (error) {
      console.error('Eroare conectare spreadsheet:', error);
      setSyncStatus('');
      alert(
        `❌ Eroare la conectare!\n\n` +
        `${error.message}`
      );
    } finally {
      setIsSyncingToSheets(false);
    }
  };

  /**
   * Deconectează spreadsheet-ul
   */
  const disconnectSpreadsheet = () => {
    googleSheetsService.setSpreadsheetId(null);
    localStorage.removeItem('normalro_sheets_id');
    setGoogleSheetsId('');
    setGoogleSheetsConnected(false);
    alert('✅ Spreadsheet deconectat!');
  };

  /**
   * Salvează datele furnizorului în Google Sheets
   */
  const saveSupplierDataToSheets = async () => {
    if (!googleSheetsConnected) return;

    try {
      await googleSheetsService.requestAuthorization();
      
      const dataToSave = {
        guid: invoiceData.guid, // Include GUID existent dacă există
        series: invoiceData.series,
        number: invoiceData.number,
        currency: invoiceData.currency,
        defaultVatRate: lines.length > 0 ? lines[0].vatRate : DEFAULT_VAT_RATE,
        supplierName: invoiceData.supplierName,
        supplierCUI: invoiceData.supplierCUI,
        supplierRegCom: invoiceData.supplierRegCom,
        supplierAddress: invoiceData.supplierAddress,
        supplierCity: invoiceData.supplierCity,
        supplierCounty: invoiceData.supplierCounty,
        supplierCountry: invoiceData.supplierCountry,
        supplierPhone: invoiceData.supplierPhone,
        supplierEmail: invoiceData.supplierEmail,
        supplierVatPrefix: invoiceData.supplierVatPrefix,
        supplierBankAccounts: invoiceData.supplierBankAccounts
      };

      const savedGuid = await googleSheetsService.saveSupplierData(dataToSave);
      
      // Salvează GUID-ul în invoiceData pentru următoarele salvari
      if (savedGuid && !invoiceData.guid) {
        setInvoiceData(prev => ({ ...prev, guid: savedGuid }));
        console.log('🆔 GUID salvat în invoiceData:', savedGuid);
      }
      
      console.log('✅ Date furnizor salvate în Google Sheets');
      
    } catch (error) {
      console.error('Eroare salvare date furnizor în Sheets:', error);
    }
  };

  /**
   * Încarcă datele furnizorului din Google Sheets
   */
  const loadSupplierDataFromSheets = async () => {
    if (!googleSheetsConnected) return;

    try {
      await googleSheetsService.requestAuthorization();
      
      const data = await googleSheetsService.loadSupplierData();
      
      if (data) {
        setInvoiceData(prev => ({
          ...prev,
          guid: data.guid || '', // Încarcă GUID-ul
          series: data.series || '',
          number: incrementInvoiceNumber(data.number),
          currency: data.currency || 'RON',
          supplierName: data.supplierName || '',
          supplierCUI: data.supplierCUI || '',
          supplierRegCom: data.supplierRegCom || '',
          supplierAddress: data.supplierAddress || '',
          supplierCity: data.supplierCity || '',
          supplierCounty: data.supplierCounty || '',
          supplierCountry: data.supplierCountry || 'Romania',
          supplierPhone: data.supplierPhone || '',
          supplierEmail: data.supplierEmail || '',
          supplierVatPrefix: data.supplierVatPrefix || 'RO',
          supplierBankAccounts: data.supplierBankAccounts || [{ bank: '', iban: '' }]
        }));

        const savedVatRate = data.defaultVatRate || DEFAULT_VAT_RATE;
        setLines(prevLines => 
          prevLines.map((line, index) => 
            index === 0 
              ? { ...line, vatRate: savedVatRate }
              : line
          )
        );

        console.log('✅ Date furnizor încărcate din Google Sheets');
      }
    } catch (error) {
      console.error('Eroare încărcare date furnizor din Sheets:', error);
    }
  };

  /**
   * Sincronizează manual toate datele din localStorage către Google Sheets
   */
  const syncAllDataToSheets = async () => {
    if (!googleSheetsConnected) {
      alert('Nu ești conectat la niciun spreadsheet Google Sheets!');
      return;
    }

    setIsSyncingToSheets(true);
    setSyncStatus('Sincronizare date...');
    console.log('🔄 Începe sincronizarea...');

    try {
      console.log('🔑 Solicit autorizare...');
      await googleSheetsService.requestAuthorization();
      console.log('✅ Autorizare obținută');
      
      let stats = {
        supplier: false,
        products: 0,
        clients: 0,
        invoices: 0
      };
      
      // 1. Salvează date furnizor
      console.log('💾 Salvez date furnizor...');
      setSyncStatus('Salvare date furnizor...');
      await saveSupplierDataToSheets();
      stats.supplier = true;
      console.log('✅ Date furnizor salvate');
      
      // 2. Sincronizează template-uri produse
      console.log('📦 Sincronizare template-uri produse...');
      setSyncStatus('Sincronizare template-uri produse...');
      const products = templateService.getProductTemplates();
      console.log(`📦 Am găsit ${products.length} produse în localStorage`);
      
      for (const product of products) {
        console.log(`📦 Salvez produs: ${product.name || product.product}`);
        const savedGuid = await googleSheetsService.saveProductTemplate(product);
        
        // Salvează GUID-ul înapoi în localStorage
        if (savedGuid && !product.guid) {
          templateService.updateProductGuid(product.id, savedGuid);
          console.log(`🆔 GUID salvat în localStorage pentru produs ${product.id}: ${savedGuid}`);
        }
        
        stats.products++;
      }
      console.log(`✅ ${stats.products} produse salvate`);
      
      // 3. Sincronizează template-uri clienți
      console.log('👥 Sincronizare template-uri clienți...');
      setSyncStatus('Sincronizare template-uri clienți...');
      const clients = templateService.getClientTemplates();
      console.log(`👥 Am găsit ${clients.length} clienți în localStorage`);
      
      for (const client of clients) {
        console.log(`👥 Salvez client: ${client.clientName || client.name}`);
        const savedGuid = await googleSheetsService.saveClientTemplate(client);
        
        // Salvează GUID-ul înapoi în localStorage
        if (savedGuid && !client.guid) {
          templateService.updateClientGuid(client.id, savedGuid);
          console.log(`🆔 GUID salvat în localStorage pentru client ${client.id}: ${savedGuid}`);
        }
        
        stats.clients++;
      }
      console.log(`✅ ${stats.clients} clienți salvați`);
      
      // 4. Sincronizează istoric facturi
      console.log('📄 Sincronizare istoric facturi...');
      setSyncStatus('Sincronizare istoric facturi...');
      const invoices = invoiceHistoryService.getAllInvoices();
      console.log(`📄 Am găsit ${invoices.length} facturi în localStorage`);
      
      for (const invoice of invoices) {
        console.log(`📄 Salvez factură: ${invoice.series} ${invoice.number}`);
        
        // Convertește formatul din localStorage la formatul Google Sheets
        const invoiceForSheets = {
          guid: invoice.guid, // Include GUID-ul existent
          series: invoice.series,
          number: invoice.number,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          currency: invoice.currency,
          supplierName: invoice.supplier?.name || '',
          supplierCUI: invoice.supplier?.cui || '',
          clientName: invoice.client?.name || '',
          clientCUI: invoice.client?.cui || ''
        };
        
        const totalsForSheets = {
          net: invoice.totals?.net || '0.00',
          vat: invoice.totals?.vat || '0.00',
          gross: invoice.totals?.gross || '0.00'
        };
        
        const savedGuid = await googleSheetsService.saveInvoiceToHistory(
          invoiceForSheets, 
          invoice.lines || [], 
          totalsForSheets, 
          invoice.notes || '', 
          []
        );
        
        // Salvează GUID-ul înapoi în localStorage
        if (savedGuid && !invoice.guid) {
          invoiceHistoryService.updateInvoiceGuid(invoice.id, savedGuid);
          console.log(`🆔 GUID salvat în localStorage pentru factură ${invoice.id}: ${savedGuid}`);
        }
        
        stats.invoices++;
      }
      console.log(`✅ ${stats.invoices} facturi salvate`);
      
           setSyncStatus('');
           setLastSyncTime(new Date().toLocaleTimeString('ro-RO'));
           console.log('🎉 Sincronizare completă!', stats);
           
           alert(
             `✅ Sincronizare completă!\n\n` +
             `• Date furnizor: ${stats.supplier ? 'salvate ✓' : 'nesalvate ✗'}\n` +
             `• Template produse: ${stats.products} salvate\n` +
             `• Template clienți: ${stats.clients} salvate\n` +
             `• Istoric facturi: ${stats.invoices} salvate\n\n` +
             `Toate datele au fost sincronizate cu Google Sheets.\n` +
             `Deschide spreadsheet-ul pentru a verifica!`
           );
      
    } catch (error) {
      console.error('❌ Eroare sincronizare:', error);
      console.error('Error details:', error);
      setSyncStatus('');
      alert(
        `❌ Eroare la sincronizare!\n\n` +
        `${error.message}\n\n` +
        `Verifică consola browser-ului pentru detalii.`
      );
    } finally {
      setIsSyncingToSheets(false);
      console.log('🏁 Sincronizare finalizată (finally)');
    }
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
    // Generează QR Code dacă există IBAN
    let qrCodeImg = '';
    if (invoiceData.supplierBankAccounts[0]?.iban && invoiceData.supplierName) {
      try {
        const qrDataUrl = await paymentService.generatePaymentQR({
          iban: invoiceData.supplierBankAccounts[0].iban,
          amount: parseFloat(totals.gross),
          currency: invoiceData.currency,
          beneficiary: invoiceData.supplierName,
          reference: `Factura ${invoiceData.series || ''}${invoiceData.number || ''}`,
          bic: ''
        });
        qrCodeImg = `<img src="${qrDataUrl}" style="width: 150px; height: 150px; display: block; margin: 0 auto;" />`;
      } catch (error) {
        console.warn('Nu s-a putut genera QR Code pentru PDF:', error);
      }
    }

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
        
        ${qrCodeImg ? `
        <div style="margin-top: 30px; padding: 20px; background-color: #f5f5f5; border-radius: 8px; text-align: center;">
          <strong style="font-size: 12px; color: #1976d2;">💳 PLATĂ RAPIDĂ CU COD QR</strong><br/>
          <div style="margin-top: 10px;">
            ${qrCodeImg}
          </div>
          <div style="margin-top: 10px; font-size: 10px; color: #666;">
            Scanează codul QR cu aplicația de banking<br/>
            pentru a plăti factura instant!
          </div>
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
      
      // Salvează în Google Sheets dacă este conectat
      if (googleSheetsConnected) {
        saveSupplierDataToSheets();
        try {
          await googleSheetsService.requestAuthorization();
          await googleSheetsService.saveInvoiceToHistory(invoiceData, lines, totals, invoiceData.notes, attachedFiles);
        } catch (err) {
          console.error('Eroare salvare factură în Sheets:', err);
        }
      }
      
      // Salvează în istoric
      invoiceHistoryService.setType('invoice');
      invoiceHistoryService.saveInvoice(invoiceData, lines, totals, invoiceData.notes, attachedFiles);
      
    } finally {
      // Șterge elementul temporar
      document.body.removeChild(invoiceElement);
    }
  };

  const exportToExcel = async () => {
    const excelData = [];
    
    // Header factură
    excelData.push(['FACTURĂ']);
    excelData.push([]);
    excelData.push(['Serie', invoiceData.series || '-', '', 'Număr', invoiceData.number || '-']);
    excelData.push(['Data emitere', invoiceData.issueDate || '-', '', 'Data scadență', invoiceData.dueDate || '-']);
    excelData.push(['Monedă', invoiceData.currency || 'RON']);
    excelData.push([]);
    
    // Date furnizor
    excelData.push(['FURNIZOR']);
    excelData.push(['Nume', invoiceData.supplierName || '-']);
    excelData.push(['CUI', invoiceData.supplierCUI || '-']);
    excelData.push(['Reg Com', invoiceData.supplierRegCom || '-']);
    excelData.push(['Adresă', invoiceData.supplierAddress || '-']);
    excelData.push(['Oraș', invoiceData.supplierCity || '-']);
    excelData.push(['Telefon', invoiceData.supplierPhone || '-']);
    excelData.push(['Email', invoiceData.supplierEmail || '-']);
    excelData.push(['Bancă', invoiceData.supplierBank || '-']);
    excelData.push(['IBAN', invoiceData.supplierIBAN || '-']);
    excelData.push([]);
    
    // Date client
    excelData.push(['BENEFICIAR']);
    excelData.push(['Nume', invoiceData.clientName || '-']);
    excelData.push(['CUI', invoiceData.clientCUI || '-']);
    excelData.push(['Reg Com', invoiceData.clientRegCom || '-']);
    excelData.push(['Adresă', invoiceData.clientAddress || '-']);
    excelData.push(['Oraș', invoiceData.clientCity || '-']);
    excelData.push(['Telefon', invoiceData.clientPhone || '-']);
    excelData.push(['Email', invoiceData.clientEmail || '-']);
    excelData.push([]);
    
    // Linii produse - Header
    excelData.push(['PRODUSE ȘI SERVICII']);
    excelData.push(['Nr.', 'Denumire produs/serviciu', 'Cantitate', 'Preț net unitar', 'TVA %', 'Suma TVA', 'Preț brut unitar', 'Total net', 'Total TVA', 'Total brut']);
    
    // Linii produse - Date
    lines.forEach((line, index) => {
      excelData.push([
        index + 1,
        line.product || '-',
        line.quantity,
        formatNumber(line.unitNetPrice),
        line.vatRate,
        calculateLineVat(line),
        formatNumber(line.unitGrossPrice),
        calculateLineTotal(line, 'net'),
        calculateLineTotal(line, 'vat'),
        calculateLineTotal(line, 'gross')
      ]);
    });
    
    // Totaluri
    excelData.push([]);
    excelData.push(['', 'TOTAL FACTURĂ', '', '', '', '', '', totals.net, totals.vat, totals.gross]);
    excelData.push([]);
    
    // Note (dacă există)
    if (invoiceData.notes) {
      excelData.push(['NOTE']);
      excelData.push([invoiceData.notes]);
      excelData.push([]);
    }
    
    // Fișiere atașate (dacă există)
    if (attachedFiles.length > 0) {
      excelData.push(['FIȘIERE ATAȘATE']);
      attachedFiles.forEach((file, index) => {
        excelData.push([
          `${index + 1}. ${file.name}`,
          `${(file.size / 1024).toFixed(2)} KB`,
          file.mimeType
        ]);
      });
    }
    
    // Creează worksheet principal
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Factură');

    // Setează lățimi coloane
    worksheet['!cols'] = [
      { wch: 8 },   // Nr.
      { wch: 35 },  // Produs/Serviciu
      { wch: 10 },  // Cantitate
      { wch: 15 },  // Preț net unitar
      { wch: 8 },   // TVA %
      { wch: 12 },  // Suma TVA
      { wch: 15 },  // Preț brut unitar
      { wch: 15 },  // Total net
      { wch: 15 },  // Total TVA
      { wch: 15 }   // Total brut
    ];

    // Dacă există IBAN, adaugă QR Code într-un sheet separat
    if (invoiceData.supplierBankAccounts[0]?.iban && invoiceData.supplierName) {
      try {
        const qrDataUrl = await paymentService.generatePaymentQR({
          iban: invoiceData.supplierBankAccounts[0].iban,
          amount: parseFloat(totals.gross),
          currency: invoiceData.currency,
          beneficiary: invoiceData.supplierName,
          reference: `Factura ${invoiceData.series || ''}${invoiceData.number || ''}`,
          bic: ''
        });

        // Notă pentru utilizator
        const qrNote = [
          ['COD QR PLATĂ'],
          [],
          ['Beneficiar:', invoiceData.supplierName],
          ['IBAN:', paymentService.formatIBAN(invoiceData.supplierBankAccounts[0].iban)],
          ['Sumă:', `${totals.gross} ${invoiceData.currency}`],
          ['Referință:', `Factura ${invoiceData.series || ''}${invoiceData.number || ''}`],
          [],
          ['Scanează codul QR de mai jos cu aplicația de banking pentru a plăti factura instant!'],
          [],
          ['NOTA: Codul QR este inclus în PDF și poate fi escanat din acela.'],
          ['În Excel, acest sheet conține datele pentru generare manuală a QR-ului.']
        ];

        const qrWorksheet = XLSX.utils.aoa_to_sheet(qrNote);
        XLSX.utils.book_append_sheet(workbook, qrWorksheet, 'Cod QR Plată');
        
        console.log('✅ Sheet "Cod QR Plată" adăugat în Excel');
      } catch (error) {
        console.warn('Nu s-a putut genera QR Code pentru Excel:', error);
      }
    }

    XLSX.writeFile(workbook, `factura_${invoiceData.series || 'FAC'}_${invoiceData.number || '001'}_${invoiceData.issueDate}.xlsx`);
    
    // Salvează datele în cookie dacă este consimțământ
    saveSupplierDataToCookie();
    
    // Salvează în Google Sheets dacă este conectat
    if (googleSheetsConnected) {
      saveSupplierDataToSheets();
      googleSheetsService.requestAuthorization()
        .then(() => googleSheetsService.saveInvoiceToHistory(invoiceData, lines, totals, invoiceData.notes, attachedFiles))
        .catch(err => console.error('Eroare salvare factură în Sheets:', err));
    }
    
    // Salvează în istoric
    invoiceHistoryService.setType('invoice');
    invoiceHistoryService.saveInvoice(invoiceData, lines, totals, invoiceData.notes, attachedFiles);
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
  ${invoiceData.supplierBankAccounts[0]?.iban ? `
  <!-- Modalitate de plată -->
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>
    <cac:PayeeFinancialAccount>
      <cbc:ID>${escapeXML(invoiceData.supplierBankAccounts[0]?.iban || '')}</cbc:ID>${invoiceData.supplierBankAccounts[0]?.bank ? `
      <cbc:Name>${escapeXML(invoiceData.supplierBankAccounts[0].bank)}</cbc:Name>` : ''}
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
    
    // Salvează în Google Sheets dacă este conectat
    if (googleSheetsConnected) {
      saveSupplierDataToSheets();
      googleSheetsService.requestAuthorization()
        .then(() => googleSheetsService.saveInvoiceToHistory(invoiceData, lines, totals, invoiceData.notes, attachedFiles))
        .catch(err => console.error('Eroare salvare factură în Sheets:', err));
    }
    
    // Salvează în istoric
    invoiceHistoryService.setType('invoice');
    invoiceHistoryService.saveInvoice(invoiceData, lines, totals, invoiceData.notes, attachedFiles);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  // ===== Funcții BNR (Cursuri Valutare) =====

  /**
   * Încarcă cursurile valutare de la BNR
   */
  const loadBNRRates = async () => {
    setBnrLoading(true);
    setBnrError('');
    
    try {
      const data = await bnrService.getExchangeRates();
      setBnrRates(data);
      
      if (data.fallback) {
        setBnrError('⚠️ Folosesc cursuri statice (eroare conectare BNR)');
      } else if (data.cached) {
        console.log('✅ Cursuri BNR din cache');
      } else {
        console.log('✅ Cursuri BNR actualizate');
      }
    } catch (error) {
      setBnrError(`Eroare preluare cursuri BNR: ${error.message}`);
      console.error('Eroare BNR:', error);
    } finally {
      setBnrLoading(false);
    }
  };

  /**
   * Reîmprospătează cursurile BNR (golește cache-ul și reîncarcă)
   */
  const refreshBNRRates = async () => {
    bnrService.clearCache();
    await loadBNRRates();
  };

  /**
   * Convertește suma totală în altă monedă folosind cursul BNR
   */
  const convertTotalToCurrency = async (targetCurrency) => {
    if (!bnrRates || !bnrRates.rates[targetCurrency]) {
      alert(`Moneda ${targetCurrency} nu este disponibilă în cursurile BNR`);
      return;
    }

    try {
      const totalInRON = await bnrService.convertCurrency(
        parseFloat(totals.gross),
        invoiceData.currency,
        targetCurrency
      );

      alert(
        `💱 Conversie BNR (${bnrRates.date}):\n\n` +
        `${totals.gross} ${invoiceData.currency} = ${totalInRON.toFixed(2)} ${targetCurrency}\n\n` +
        `Curs ${invoiceData.currency}: ${bnrRates.rates[invoiceData.currency]}\n` +
        `Curs ${targetCurrency}: ${bnrRates.rates[targetCurrency]}`
      );
    } catch (error) {
      alert(`Eroare conversie: ${error.message}`);
    }
  };

  // ===== Funcții Calculator Zile Lucrătoare =====

  /**
   * Calculează data scadenței bazată pe zile lucrătoare
   */
  const calculateDueDateByWorkingDays = (days) => {
    const startDate = new Date(invoiceData.issueDate);
    const dueDate = paymentService.addWorkingDays(startDate, days);
    
    setInvoiceData({
      ...invoiceData,
      dueDate: dueDate.toISOString().split('T')[0]
    });

    // Afișează detalii
    const skippedDays = [];
    let tempDate = new Date(startDate);
    tempDate.setDate(tempDate.getDate() + 1);
    
    while (tempDate <= dueDate) {
      if (!paymentService.isWorkingDay(tempDate)) {
        const holidayName = paymentService.getHolidayName(tempDate);
        const reason = holidayName || (paymentService.isWeekend(tempDate) ? 'Weekend' : 'Sărbătoare');
        skippedDays.push({
          date: tempDate.toLocaleDateString('ro-RO'),
          reason: reason,
          isHoliday: !!holidayName,
          isWeekend: paymentService.isWeekend(tempDate)
        });
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // Setează detaliile pentru afișare (mereu, chiar dacă nu sunt zile sărite)
    setWorkingDaysCalculator({
      days,
      showDetails: true,
      skippedDays,
      dueDate: dueDate.toLocaleDateString('ro-RO'),
      startDate: startDate.toLocaleDateString('ro-RO')
    });

    // Afișează notificare rapidă
    const holidaysCount = skippedDays.filter(d => d.isHoliday).length;
    const weekendsCount = skippedDays.filter(d => d.isWeekend && !d.isHoliday).length;
    
    if (skippedDays.length > 0) {
      console.log(
        `✅ Scadență: ${dueDate.toLocaleDateString('ro-RO')} | ` +
        `Sărite: ${skippedDays.length} zile (${holidaysCount} sărbători + ${weekendsCount} weekend-uri)`
      );
    } else {
      console.log(
        `✅ Scadență: ${dueDate.toLocaleDateString('ro-RO')} | ` +
        `Nu există zile sărite în interval`
      );
    }
  };

  /**
   * Afișează detaliile calculului zilelor lucrătoare
   */
  const showWorkingDaysDetails = () => {
    if (!workingDaysCalculator.showDetails || !workingDaysCalculator.skippedDays) {
      return null;
    }

    const { skippedDays, dueDate, days } = workingDaysCalculator;
    
    // Separă sărbătorile de weekend-uri
    const holidays = skippedDays.filter(day => day.reason !== 'Weekend');
    const weekends = skippedDays.filter(day => day.reason === 'Weekend');
    
    // Obține toate sărbătorile din interval (inclusiv cele în weekend)
    const startDate = new Date(invoiceData.issueDate);
    const endDate = new Date(dueDate.split('.').reverse().join('-')); // Convert "DD.MM.YYYY" to Date
    const allHolidays = paymentService.getHolidaysInRange(startDate, endDate);
    
    let message = `📅 CALCULUL ZILELOR LUCRĂTOARE\n`;
    message += `${'='.repeat(50)}\n\n`;
    message += `📍 Perioada: ${startDate.toLocaleDateString('ro-RO')} → ${dueDate}\n`;
    message += `🎯 Scadență: ${dueDate}\n`;
    message += `📆 Zile lucrătoare solicitate: ${days} zile\n`;
    message += `⏭️ Total zile sărite: ${skippedDays.length} zile\n`;
    message += `   └─ Weekend-uri: ${weekends.length} zile\n`;
    message += `   └─ Sărbători legale: ${holidays.length} zile\n\n`;
    
    // Afișează toate sărbătorile legale din interval
    if (allHolidays.length > 0) {
      message += `🎊 SĂRBĂTORI LEGALE ÎN INTERVAL (${allHolidays.length}):\n`;
      message += `${'-'.repeat(50)}\n`;
      
      allHolidays.forEach(holiday => {
        const date = new Date(holiday.date);
        const dayName = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'][date.getDay()];
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const emoji = isWeekend ? '📅' : '🎉';
        const suffix = isWeekend ? ' (în weekend)' : '';
        
        message += `${emoji} ${holiday.formatted} (${dayName}) - ${holiday.name}${suffix}\n`;
      });
      message += `\n`;
    }
    
    // Afișează detalii weekend-uri (grupat)
    if (weekends.length > 0) {
      message += `📆 WEEKEND-URI SĂRITE (${weekends.length} zile):\n`;
      message += `${'-'.repeat(50)}\n`;
      
      // Grupează weekend-urile consecutive
      let currentWeekend = [];
      const weekendGroups = [];
      
      weekends.forEach((day, index) => {
        currentWeekend.push(day.date);
        
        // Verifică dacă e ultimul sau dacă următorul nu e consecutiv
        if (index === weekends.length - 1 || 
            new Date(weekends[index + 1].date.split('.').reverse().join('-')).getTime() - 
            new Date(day.date.split('.').reverse().join('-')).getTime() > 86400000 * 2) {
          weekendGroups.push([...currentWeekend]);
          currentWeekend = [];
        }
      });
      
      weekendGroups.forEach((group, index) => {
        if (group.length === 1) {
          message += `• ${group[0]}\n`;
        } else if (group.length === 2) {
          message += `• ${group[0]} & ${group[1]}\n`;
        } else {
          message += `• ${group[0]} → ${group[group.length - 1]} (${group.length} zile)\n`;
        }
      });
      message += `\n`;
    }
    
    // Footer informativ
    message += `${'-'.repeat(50)}\n`;
    message += `ℹ️ Conform legislației române (Codul Muncii)\n`;
    message += `📚 Surse: Legea 53/2003, Legea 202/2008, BOR Calendar\n`;
    
    alert(message);
  };

  // ===== Funcții Generator Cod QR Plată =====

  /**
   * Generează cod QR pentru plată
   */
  const generatePaymentQRCode = async () => {
    // Validări
    if (!invoiceData.supplierBankAccounts[0]?.iban) {
      alert('❌ Introdu IBAN-ul furnizorului pentru a genera codul QR de plată!');
      return;
    }

    if (!invoiceData.supplierName) {
      alert('❌ Introdu numele furnizorului pentru a genera codul QR de plată!');
      return;
    }

    setQrCodeDialog({ ...qrCodeDialog, loading: true, open: true });

    try {
      const qrDataUrl = await paymentService.generatePaymentQR({
        iban: invoiceData.supplierBankAccounts[0].iban,
        amount: parseFloat(totals.gross),
        currency: invoiceData.currency,
        beneficiary: invoiceData.supplierName,
        reference: `Factura ${invoiceData.series || ''}${invoiceData.number || ''}`,
        bic: '' // Opțional
      });

      setQrCodeDialog({
        open: true,
        qrDataUrl: qrDataUrl,
        loading: false
      });

    } catch (error) {
      alert(`❌ Eroare generare cod QR:\n\n${error.message}`);
      setQrCodeDialog({ open: false, qrDataUrl: '', loading: false });
    }
  };

  /**
   * Descarcă codul QR ca imagine
   */
  const downloadPaymentQR = () => {
    if (!qrCodeDialog.qrDataUrl) return;
    
    const filename = `payment-qr_${invoiceData.series || 'FAC'}_${invoiceData.number || '001'}.png`;
    paymentService.downloadQRCode(qrCodeDialog.qrDataUrl, filename);
  };

  /**
   * Închide dialogul QR
   */
  const closeQRDialog = () => {
    setQrCodeDialog({ open: false, qrDataUrl: '', loading: false });
  };

  return (
    <ToolLayout
      title="Generator Factură Completă"
      description="Creează facturi complete cu detalii furnizor, beneficiar și linii de produse. Exportă în PDF sau Excel."
      maxWidth="xl"
      seoSlug="invoice-generator"
    >
      {/* Eroare ANAF */}
      {anafError && (
        <Alert severity="error" onClose={() => setAnafError('')} sx={{ mb: 3 }}>
          {anafError}
        </Alert>
      )}

      {/* Sidebar Fixed Menu - Floating pe dreapta */}
      <GoogleSheetsSidebar
        googleSheetsReady={googleSheetsReady}
        googleSheetsConnected={googleSheetsConnected}
        googleSheetsId={googleSheetsId}
        isSyncingToSheets={isSyncingToSheets}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        expandedAccordion={expandedAccordion}
        saveDataConsent={saveDataConsent}
        onAccordionChange={handleAccordionChange}
        onCreateSpreadsheet={createNewSpreadsheet}
        onConnectSpreadsheet={() => setSheetsDialogOpen(true)}
        onSyncManual={syncAllDataToSheets}
        onDisconnect={disconnectSpreadsheet}
        onOpenSpreadsheet={() => window.open(`https://docs.google.com/spreadsheets/d/${googleSheetsId}/edit`, '_blank')}
        onOpenHistory={() => setHistoryDialogOpen(true)}
        onSaveDataConsentChange={handleSaveDataConsentChange}
      />

      {/* Main Content - Full width */}
      <Stack spacing={3}>
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
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                  <FormControl 
                    size="small" 
                    variant="standard"
                    sx={{ minWidth: 90 }}
                  >
                    <Select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          calculateDueDateByWorkingDays(parseInt(e.target.value));
                        }
                      }}
                      displayEmpty
                      sx={{
                        fontSize: '0.75rem',
                        '& .MuiSelect-select': {
                          py: 0.5,
                          pr: 3
                        }
                      }}
                    >
                      <MenuItem value="" disabled sx={{ fontSize: '0.8rem' }}>
                        <em>Zile lucr.</em>
                      </MenuItem>
                      <MenuItem value="7" sx={{ fontSize: '0.8rem' }}>7 zile</MenuItem>
                      <MenuItem value="10" sx={{ fontSize: '0.8rem' }}>10 zile</MenuItem>
                      <MenuItem value="15" sx={{ fontSize: '0.8rem' }}>15 zile</MenuItem>
                      <MenuItem value="20" sx={{ fontSize: '0.8rem' }}>20 zile</MenuItem>
                      <MenuItem value="30" sx={{ fontSize: '0.8rem' }}>30 zile</MenuItem>
                      <MenuItem value="45" sx={{ fontSize: '0.8rem' }}>45 zile</MenuItem>
                      <MenuItem value="60" sx={{ fontSize: '0.8rem' }}>60 zile</MenuItem>
                      <MenuItem value="90" sx={{ fontSize: '0.8rem' }}>90 zile</MenuItem>
                    </Select>
                  </FormControl>
                  {workingDaysCalculator.showDetails && (
                    <Button
                      size="small"
                      variant="text"
                      color="info"
                      onClick={showWorkingDaysDetails}
                      sx={{ 
                        fontSize: '0.7rem',
                        px: 1,
                        py: 0.3,
                        minWidth: 'auto',
                        textTransform: 'none'
                      }}
                    >
                      Detalii
                    </Button>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    (exclude weekend + sărbători)
                  </Typography>
                </Stack>
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

        {/* Cursuri Valutare BNR - Widget Informativ */}
        {bnrRates && (
          <Card variant="outlined" sx={{ bgcolor: 'info.50', borderColor: 'info.main' }}>
            <CardContent sx={{ py: 1.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="subtitle2" color="info.main" fontWeight="600">
                    💱 Cursuri Valutare BNR ({bnrRates.date})
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                    {['EUR', 'USD', 'GBP'].map(currency => (
                      bnrRates.rates[currency] && (
                        <Chip
                          key={currency}
                          label={`${currency}: ${bnrRates.rates[currency]} RON`}
                          size="small"
                          color="info"
                          variant="outlined"
                          onClick={() => convertTotalToCurrency(currency)}
                          sx={{ cursor: 'pointer', fontWeight: 500 }}
                        />
                      )
                    ))}
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1}>
                  {invoiceData.currency !== 'RON' && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="info"
                      onClick={() => convertTotalToCurrency('RON')}
                      disabled={bnrLoading}
                    >
                      Conversie → RON
                    </Button>
                  )}
                  <IconButton 
                    size="small" 
                    color="info" 
                    onClick={refreshBNRRates}
                    disabled={bnrLoading}
                    title="Reîmprospătează cursurile BNR"
                  >
                    {bnrLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
                  </IconButton>
                </Stack>
              </Stack>
              {bnrError && (
                <Alert severity="warning" sx={{ mt: 1, py: 0.5 }}>
                  {bnrError}
                </Alert>
              )}
              {bnrRates.cached && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  ℹ️ Cursuri din cache (actualizare automată la 6 ore)
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* Furnizor și Beneficiar */}
        <Grid container spacing={2}>
          {/* Furnizor */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CompanyForm
              data={invoiceData}
              onChange={handleInvoiceChange}
              onSearch={searchSupplierANAF}
              loading={loadingSupplier}
              type="supplier"
              showBankDetails={true}
              onAddBankAccount={handleAddSupplierBankAccount}
              onRemoveBankAccount={handleRemoveSupplierBankAccount}
              onBankAccountChange={handleSupplierBankAccountChange}
            />
          </Grid>

          {/* Beneficiar */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CompanyForm
              data={invoiceData}
              onChange={handleInvoiceChange}
              onSearch={searchClientANAF}
              loading={loadingClient}
              type="client"
              showBankDetails={true}
              showTemplateButtons={true}
              onTemplateSelect={() => setClientTemplateDialogOpen(true)}
              onTemplateSave={saveCurrentClientAsTemplate}
              onAddBankAccount={handleAddClientBankAccount}
              onRemoveBankAccount={handleRemoveClientBankAccount}
              onBankAccountChange={handleClientBankAccountChange}
            />
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
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<StarIcon />}
                onClick={() => setProductTemplateDialogOpen(true)}
              >
                Produse
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
        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom textAlign="center" color="primary">
            Export & Descărcare
          </Typography>
          
          {/* Butoane principale de export - pătrate pe un rând */}
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{ mb: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                color="error"
                onClick={exportToPDF}
                sx={{
                  minWidth: 100,
                  minHeight: 100,
                  width: 100,
                  height: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 1.5
                }}
              >
                <PictureAsPdfIcon sx={{ fontSize: 40, mb: 0.5 }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1.2, fontWeight: 600 }}>
                  Descarcă PDF
                </Typography>
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                color="success"
                onClick={exportToExcel}
                sx={{
                  minWidth: 100,
                  minHeight: 100,
                  width: 100,
                  height: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 1.5
                }}
              >
                <DescriptionIcon sx={{ fontSize: 40, mb: 0.5 }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1.2, fontWeight: 600 }}>
                  Descarcă Excel
                </Typography>
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                color="info"
                onClick={exportToXML}
                sx={{
                  minWidth: 100,
                  minHeight: 100,
                  width: 100,
                  height: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 1.5
                }}
              >
                <CodeIcon sx={{ fontSize: 40, mb: 0.5 }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1.2, fontWeight: 600 }}>
                  Descarcă XML
                </Typography>
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                color="warning"
                onClick={validateOnANAF}
                sx={{
                  minWidth: 100,
                  minHeight: 100,
                  width: 100,
                  height: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 1.5,
                  bgcolor: 'background.paper'
                }}
              >
                <CheckCircleOutlineIcon sx={{ fontSize: 40, mb: 0.5 }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1.2, fontWeight: 600 }}>
                  Validează ANAF
                </Typography>
              </Button>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Acțiuni rapide
            </Typography>
          </Divider>

          {/* Butoane secundare - Google Drive + QR */}
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => saveToGoogleDrive('pdf')}
                disabled={isUploadingToDrive}
                sx={{
                  minWidth: 90,
                  minHeight: 90,
                  width: 90,
                  height: 90,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 1
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 36, mb: 0.5 }} />
                <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
                  PDF Drive
                </Typography>
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() => saveToGoogleDrive('excel')}
                disabled={isUploadingToDrive}
                sx={{
                  minWidth: 90,
                  minHeight: 90,
                  width: 90,
                  height: 90,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 1
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 36, mb: 0.5 }} />
                <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
                  Excel Drive
                </Typography>
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={generatePaymentQRCode}
                disabled={!invoiceData.supplierBankAccounts[0]?.iban}
                sx={{
                  minWidth: 90,
                  minHeight: 90,
                  width: 90,
                  height: 90,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 1
                }}
              >
                <QrCode2Icon sx={{ fontSize: 36, mb: 0.5 }} />
                <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
                  Cod QR Plată
                </Typography>
              </Button>
              {!invoiceData.supplierBankAccounts[0]?.iban && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5, fontSize: '0.65rem' }}>
                  Lipsește IBAN
                </Typography>
              )}
            </Box>
          </Stack>

          {isUploadingToDrive && (
            <Typography variant="caption" color="primary" display="block" textAlign="center" sx={{ mt: 2 }}>
              Procesare...
            </Typography>
          )}
        </Paper>

        {/* Eliminăm secțiunea duplicată de mai jos */}
        <Box sx={{ display: 'none' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1.5}>
              </Stack>
            </Grid>
          </Grid>
        </Box>

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
            <br />
            📊 <strong>Google Sheets:</strong> Conectează-te la Google Sheets pentru sincronizare automată în cloud! Datele furnizorului, template-urile produse/clienți și istoricul facturilor sunt salvate automat în spreadsheet la fiecare export. Poți crea un spreadsheet nou sau conecta unul existent.
            <br />
            📚 <strong>Istoric:</strong> Toate facturile exportate sunt salvate automat în browser (localStorage) și opțional în Google Sheets. Click pe "Istoric Facturi" pentru a vedea, căuta și încărca facturi anterioare.
            <br />
            ⭐ <strong>Template-uri:</strong> Salvează produse și clienți frecvenți pentru completare rapidă. Click pe "Produse" pentru template-uri produse sau "Beneficiari" pentru clienți salvați. Template-urile sunt sincronizate automat cu Google Sheets dacă ești conectat.
            <br />
            🏢 <strong>Export SAGA:</strong> Din "Istoric Facturi" poți exporta facturi în formatul XML compatibil cu software-ul contabil SAGA. Filtrează facturile după interval de date sau serie/număr, apoi generează XML-ul pentru import în SAGA.
          </Typography>
        </Paper>

        {/* Dialog Istoric Facturi */}
        <InvoiceHistoryDialog
          open={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
          onLoadInvoice={loadInvoiceFromHistory}
          type="invoice"
        />

        {/* Dialog Template-uri Produse */}
        <ProductTemplateDialog
          open={productTemplateDialogOpen}
          onClose={() => setProductTemplateDialogOpen(false)}
          onSelectProduct={selectProductFromTemplate}
        />

        {/* Dialog Template-uri Clienți */}
        <ClientTemplateDialog
          open={clientTemplateDialogOpen}
          onClose={() => setClientTemplateDialogOpen(false)}
          onSelectClient={selectClientFromTemplate}
        />

        {/* Dialog Conectare Google Sheets */}
        <Dialog
          open={sheetsDialogOpen}
          onClose={() => setSheetsDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Conectează Spreadsheet Existent
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Ai deja un spreadsheet Google Sheets creat manual? Conectează-l aici.
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Alert severity="warning">
                <strong>⚠️ Această opțiune este pentru spreadsheet-uri create manual</strong>
                <br />
                <br />
                Dacă vrei să creezi un spreadsheet NOU automat cu toate sheet-urile necesare, 
                închide acest dialog și apasă butonul <strong>"+ CREAZĂ"</strong>.
              </Alert>

              <TextField
                fullWidth
                label="Spreadsheet ID"
                placeholder="ex: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                value={googleSheetsId}
                onChange={(e) => setGoogleSheetsId(e.target.value)}
                helperText="Găsești ID-ul în URL-ul spreadsheet-ului: docs.google.com/spreadsheets/d/[ID]/edit"
              />
              <Alert severity="info">
                <strong>Cum găsești Spreadsheet ID?</strong>
                <br />
                1. Deschide spreadsheet-ul în Google Sheets
                <br />
                2. Copiază ID-ul din URL (partea dintre /d/ și /edit)
                <br />
                3. Lipește ID-ul în câmpul de mai sus
                <br />
                <br />
                <strong>Exemplu URL:</strong>
                <br />
                <code style={{ fontSize: '0.75rem' }}>
                  https://docs.google.com/spreadsheets/d/<strong>[ID]</strong>/edit
                </code>
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSheetsDialogOpen(false)}>
              Anulează
            </Button>
            <Button
              onClick={() => {
                connectExistingSpreadsheet(googleSheetsId);
                setSheetsDialogOpen(false);
              }}
              variant="contained"
              disabled={!googleSheetsId || isSyncingToSheets}
            >
              Conectează
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Confirmare Ștergere Date */}
        <ClearDataConfirmDialog
          open={clearDataDialogOpen}
          onClose={cancelClearData}
          onConfirm={confirmClearData}
          dataSummary={dataSummary}
        />

        {/* Dialog Sugestie Google Sheets */}
        <GoogleSheetsPromptDialog
          open={showSheetsPrompt}
          onClose={handleSheetsPromptLater}
          onConnect={handleSheetsPromptConnect}
          onNever={handleSheetsPromptNever}
        />

        {/* Dialog Cod QR Plată */}
        <Dialog
          open={qrCodeDialog.open}
          onClose={closeQRDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QrCode2Icon color="primary" />
                <Typography variant="h6">Cod QR Plată</Typography>
              </Box>
              <IconButton onClick={closeQRDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {qrCodeDialog.loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                <CircularProgress />
              </Box>
            ) : qrCodeDialog.qrDataUrl ? (
              <Stack spacing={2} alignItems="center">
                <Alert severity="success" sx={{ width: '100%' }}>
                  <strong>Cod QR generat cu succes!</strong>
                  <br />
                  Clientul poate scana acest cod QR cu aplicația de banking pentru a plăti factura automat.
                </Alert>

                <Box
                  component="img"
                  src={qrCodeDialog.qrDataUrl}
                  alt="QR Code Plată"
                  sx={{
                    width: 300,
                    height: 300,
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 2,
                    bgcolor: 'white'
                  }}
                />

                <Paper sx={{ p: 2, width: '100%', bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="600">
                    Detalii plată:
                  </Typography>
                  <Stack spacing={0.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Beneficiar:</Typography>
                      <Typography variant="body2" fontWeight="500">{invoiceData.supplierName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">IBAN:</Typography>
                      <Typography variant="body2" fontWeight="500" sx={{ fontFamily: 'monospace' }}>
                        {paymentService.formatIBAN(invoiceData.supplierBankAccounts[0]?.iban || '')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Sumă:</Typography>
                      <Typography variant="body2" fontWeight="700" color="success.main">
                        {totals.gross} {invoiceData.currency}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Referință:</Typography>
                      <Typography variant="body2" fontWeight="500">
                        Factura {invoiceData.series}{invoiceData.number}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Alert severity="info" sx={{ width: '100%' }}>
                  <Typography variant="body2">
                    <strong>Format:</strong> EPC QR Code (standard european pentru plăți SEPA)
                    <br />
                    <strong>Compatibilitate:</strong> Majoritatea aplicațiilor de banking din România și UE
                  </Typography>
                </Alert>
              </Stack>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeQRDialog}>
              Închide
            </Button>
            {qrCodeDialog.qrDataUrl && (
              <Button
                onClick={downloadPaymentQR}
                variant="contained"
                startIcon={<DownloadIcon />}
              >
                Descarcă QR Code
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Stack>
    </ToolLayout>
  );
};

export default InvoiceGenerator;

