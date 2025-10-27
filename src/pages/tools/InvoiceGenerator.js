import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Snackbar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
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
import JSZip from 'jszip';

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
    supplierBankAccounts: [{ bank: '', iban: '', currency: 'RON' }],
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
    clientBankAccounts: [{ bank: '', iban: '', currency: 'RON' }],
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

  // State pentru șabloane
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

  // ===== State pentru UI/UX îmbunătățiri =====

  // Preview Dialog
  const [previewDialog, setPreviewDialog] = useState({
    open: false,
    type: null, // 'pdf' | 'excel'
    content: null
  });

  // Keyboard Shortcuts Dialog
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);

  // Autosave
  const [lastAutosave, setLastAutosave] = useState(null);
  const [autosaveSnackbar, setAutosaveSnackbar] = useState(false);
  const autosaveTimerRef = useRef(null);

  // Drag state pentru reorder
  const [draggedLineId, setDraggedLineId] = useState(null);

  const [lines, setLines] = useState([
    {
      id: 1,
      product: '',
      quantity: '1',
      purchasePrice: '0.00', // Preț de intrare/achiziție
      markup: '0.00', // Adaos comercial (%)
      unitNetPrice: '0.00',
      vatRate: DEFAULT_VAT_RATE,
      unitGrossPrice: '0.00',
      discountPercent: '0.00', // Reducere pe linie (%)
      discountAmount: '0.00' // Reducere pe linie (sumă fixă)
    }
  ]);

  // State pentru vizibilitatea câmpurilor de discount pe fiecare linie
  const [visibleDiscounts, setVisibleDiscounts] = useState(new Set());

  // State pentru reduceri/discount pe total
  const [totalDiscount, setTotalDiscount] = useState({
    type: 'none', // 'none', 'percent', 'amount'
    percent: '0.00',
    amount: '0.00'
  });

  // State pentru funcționalități facturare recurentă
  const [invoiceSablonDialogOpen, setInvoiceSablonDialogOpen] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState({});

  // State pentru categorii produse
  const [productCategoriesDialogOpen, setProductCategoriesDialogOpen] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryData, setEditingCategoryData] = useState({ name: '', color: '', icon: '' });

  // State pentru fișa client
  const [clientProfileDialogOpen, setClientProfileDialogOpen] = useState(false);
  const [selectedClientForProfile, setSelectedClientForProfile] = useState(null);

  // State pentru sortare linii
  const [sortBy, setSortBy] = useState('manual'); // 'manual', 'name', 'price', 'total'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

  // State pentru grupare pe categorii
  const [groupByCategory, setGroupByCategory] = useState(false);

  // State pentru versioning
  const [invoiceVersions, setInvoiceVersions] = useState([]);
  const [showVersionsDialog, setShowVersionsDialog] = useState(false);

  // State pentru furnizori (societăți proprii)
  const [supplierTemplateDialogOpen, setSupplierTemplateDialogOpen] = useState(false);
  const [savedSuppliers, setSavedSuppliers] = useState([]);

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
        supplierBankAccounts: data.supplierBankAccounts
          ? data.supplierBankAccounts.map(acc => ({
            bank: acc.bank || '',
            iban: acc.iban || '',
            currency: acc.currency || 'RON'
          }))
          : [{ bank: '', iban: '', currency: 'RON' }]
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
    loadProductCategories(); // Încarcă categoriile de produse

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
      supplierBankAccounts: [...invoiceData.supplierBankAccounts, { bank: '', iban: '', currency: 'RON' }]
    });
  };

  const handleRemoveSupplierBankAccount = (index) => {
    const updatedAccounts = invoiceData.supplierBankAccounts.filter((_, i) => i !== index);
    setInvoiceData({
      ...invoiceData,
      supplierBankAccounts: updatedAccounts.length > 0 ? updatedAccounts : [{ bank: '', iban: '', currency: 'RON' }]
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
      clientBankAccounts: [...invoiceData.clientBankAccounts, { bank: '', iban: '', currency: 'RON' }]
    });
  };

  const handleRemoveClientBankAccount = (index) => {
    const updatedAccounts = invoiceData.clientBankAccounts.filter((_, i) => i !== index);
    setInvoiceData({
      ...invoiceData,
      clientBankAccounts: updatedAccounts.length > 0 ? updatedAccounts : [{ bank: '', iban: '', currency: 'RON' }]
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
          purchasePrice: '0.00',
          markup: '0.00',
          unitNetPrice: formatNumber(netPrice),
          vatRate: String(parseFloat(vatRate) || parseFloat(DEFAULT_VAT_RATE)), // Fallback la .env
          unitGrossPrice: formatNumber(grossPrice),
          discountPercent: '0.00',
          discountAmount: '0.00'
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

  const toggleDiscountVisibility = (lineId) => {
    setVisibleDiscounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lineId)) {
        // Ascunde secțiunea și resetează valorile
        newSet.delete(lineId);

        // Resetează valorile reducerii pentru această linie și recalculează prețul brut
        setLines(lines.map(line => {
          if (line.id === lineId) {
            const net = parseFloat(line.unitNetPrice) || 0;
            const vat = parseFloat(line.vatRate) || 0;
            const vatAmount = Math.round(net * vat * 10000) / 1000000;
            const gross = net + vatAmount;

            return {
              ...line,
              discountPercent: '0.00',
              discountAmount: '0.00',
              unitGrossPrice: formatNumber(gross)
            };
          }
          return line;
        }));
      } else {
        newSet.add(lineId);
      }
      return newSet;
    });
  };

  const addLine = () => {
    const newId = Math.max(...lines.map(l => l.id)) + 1;
    setLines([...lines, {
      id: newId,
      product: '',
      quantity: '1',
      purchasePrice: '0.00',
      markup: '0.00',
      unitNetPrice: '0.00',
      vatRate: DEFAULT_VAT_RATE,
      unitGrossPrice: '0.00',
      discountPercent: '0.00',
      discountAmount: '0.00'
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

      // Calculează automat prețul net din preț intrare + adaos
      if (field === 'purchasePrice' || field === 'markup') {
        const purchasePrice = parseFloat(updated.purchasePrice) || 0;
        const markup = parseFloat(updated.markup) || 0;

        if (purchasePrice > 0) {
          // Preț Net = Preț Intrare * (1 + Adaos%)
          const calculatedNetPrice = purchasePrice * (1 + markup / 100);
          updated.unitNetPrice = formatNumber(calculatedNetPrice);
        }
      }

      if (field === 'unitNetPrice' || field === 'vatRate' || field === 'purchasePrice' || field === 'markup' ||
        field === 'discountPercent' || field === 'discountAmount') {
        const net = parseFloat(updated.unitNetPrice);
        const vat = parseFloat(updated.vatRate);

        if (!isNaN(net) && !isNaN(vat)) {
          // Calculează preț brut FĂRĂ reducere (reducerea va fi linie separată)
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

  // Calculează suma efectivă de reducere pe linie
  const calculateLineDiscount = (line) => {
    const net = parseFloat(line.unitNetPrice) || 0;
    const qty = parseFloat(line.quantity) || 0;
    const discountPercent = parseFloat(line.discountPercent) || 0;
    const discountAmount = parseFloat(line.discountAmount) || 0;

    // Reducere procentuală din preț net unitar
    const percentDiscount = (net * discountPercent / 100) * qty;
    // Reducere sumă fixă totală
    const fixedDiscount = discountAmount;

    const totalDiscount = percentDiscount + fixedDiscount;
    return totalDiscount.toFixed(2);
  };

  const calculateLineTotal = (line, type) => {
    const qty = parseFloat(line.quantity) || 0;

    if (type === 'net') {
      const net = parseFloat(line.unitNetPrice) || 0;
      // Total FĂRĂ reducere (reducerea e linie separată)
      return (net * qty).toFixed(2);
    } else if (type === 'vat') {
      const vat = parseFloat(calculateLineVat(line)) || 0;
      // Total TVA FĂRĂ reducere (reducerea e linie separată)
      return (vat * qty).toFixed(2);
    } else if (type === 'gross') {
      const gross = parseFloat(line.unitGrossPrice) || 0;
      // Total brut FĂRĂ reducere (reducerea e linie separată)
      return (gross * qty).toFixed(2);
    }
    return '0.00';
  };

  // Selectează un produs din șablon și adaugă-l ca linie nouă
  const selectProductFromTemplate = (product) => {
    const newLine = {
      id: Date.now(),
      product: product.product || '',
      quantity: product.quantity || '1',
      purchasePrice: product.purchasePrice || '0.00',
      markup: product.markup || '0.00',
      unitNetPrice: product.unitNetPrice || '0.00',
      vatRate: product.vatRate || DEFAULT_VAT_RATE,
      unitGrossPrice: product.unitGrossPrice || '0.00',
      discountPercent: '0.00',
      discountAmount: '0.00'
    };

    setLines([...lines, newLine]);
  };

  // Selectează un client din șablon și completează datele
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
      clientVatPrefix: client.clientVatPrefix || 'RO',
      clientBankAccounts: client.clientBankAccounts && client.clientBankAccounts.length > 0
        ? client.clientBankAccounts.map(acc => ({
          bank: acc.bank || '',
          iban: acc.iban || '',
          currency: acc.currency || 'RON'
        }))
        : [{ bank: '', iban: '', currency: 'RON' }]
    });
  };

  // Salvează clientul curent ca șablon
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
      vatPrefix: invoiceData.clientVatPrefix,
      bankAccounts: invoiceData.clientBankAccounts || [{ bank: '', iban: '', currency: 'RON' }]
    });

    alert(`✅ Client "${invoiceData.clientName}" salvat în șabloane!`);
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
      sabloane: {
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

    // Verifică șabloane
    summary.sabloane.products = templateService.getProductTemplates().length;
    summary.sabloane.clients = templateService.getClientTemplates().length;

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

      // Șterge șabloane
      templateService.clearAllTemplates();
      console.log('🗑️ Șabloane șterse');

      // Șterge istoric facturi
      invoiceHistoryService.clearAllInvoices();
      console.log('🗑️ Istoric facturi șters');

      // Actualizează state
      setSaveDataConsent(false);
      setClearDataDialogOpen(false);

      alert(
        '✅ Toate datele au fost șterse cu succes!\n\n' +
        '• Cookie-ul cu datele furnizorului a fost șters\n' +
        '• Șabloanele de produse au fost șterse\n' +
        '• Șabloanele de clienți au fost șterse\n' +
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
        `• Șabloane Produse\n` +
        `• Șabloane Clienți\n` +
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
          supplierBankAccounts: data.supplierBankAccounts
            ? data.supplierBankAccounts.map(acc => ({
              bank: acc.bank || '',
              iban: acc.iban || '',
              currency: acc.currency || 'RON'
            }))
            : [{ bank: '', iban: '', currency: 'RON' }]
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

      // Verifică și creează sheet-urile lipsă
      console.log('🔍 Verificare sheet-uri necesare...');
      setSyncStatus('Verificare sheet-uri...');
      await googleSheetsService.ensureAllSheetsExist();
      console.log('✅ Toate sheet-urile sunt prezente');

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

      // 2. Sincronizează șabloane produse
      console.log('📦 Sincronizare șabloane produse...');
      setSyncStatus('Sincronizare șabloane produse...');
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

      // 3. Sincronizează șabloane clienți
      console.log('👥 Sincronizare șabloane clienți...');
      setSyncStatus('Sincronizare șabloane clienți...');
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
        `• Șabloane produse: ${stats.products} salvate\n` +
        `• Șabloane clienți: ${stats.clients} salvate\n` +
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

  // ===== Funcții Categorii Produse =====

  /**
   * Încarcă categoriile de produse din localStorage
   */
  const loadProductCategories = () => {
    try {
      const saved = localStorage.getItem('normalro_product_categories');
      if (saved) {
        const categories = JSON.parse(saved);
        setProductCategories(categories);
        console.log('✅ Categorii produse încărcate:', categories.length);
      } else {
        // Categorii implicite
        const defaultCategories = [
          { id: Date.now(), name: 'Servicii', color: '#2196f3', icon: '🛠️' },
          { id: Date.now() + 1, name: 'Produse', color: '#4caf50', icon: '📦' },
          { id: Date.now() + 2, name: 'Consultanță', color: '#ff9800', icon: '💼' }
        ];
        setProductCategories(defaultCategories);
        localStorage.setItem('normalro_product_categories', JSON.stringify(defaultCategories));
      }
    } catch (error) {
      console.error('Eroare încărcare categorii:', error);
    }
  };

  /**
   * Salvează categoriile în localStorage
   */
  const saveProductCategories = (categories) => {
    try {
      localStorage.setItem('normalro_product_categories', JSON.stringify(categories));
      setProductCategories(categories);
      console.log('✅ Categorii salvate:', categories.length);
    } catch (error) {
      console.error('Eroare salvare categorii:', error);
    }
  };

  /**
   * Adaugă o categorie nouă
   */
  const addProductCategory = (name, color = '#2196f3', icon = '📁') => {
    const newCategory = {
      id: Date.now(),
      name,
      color,
      icon,
      createdAt: new Date().toISOString()
    };
    const updatedCategories = [...productCategories, newCategory];
    saveProductCategories(updatedCategories);
    return newCategory;
  };

  /**
   * Actualizează o categorie existentă
   */
  const updateProductCategory = (categoryId, updates) => {
    const updatedCategories = productCategories.map(cat =>
      cat.id === categoryId ? { ...cat, ...updates } : cat
    );
    saveProductCategories(updatedCategories);
  };

  /**
   * Începe editarea unei categorii
   */
  const startEditingCategory = (category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryData({
      name: category.name,
      color: category.color,
      icon: category.icon
    });
  };

  /**
   * Anulează editarea
   */
  const cancelEditingCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryData({ name: '', color: '', icon: '' });
  };

  /**
   * Salvează modificările categoriei
   */
  const saveEditedCategory = () => {
    if (!editingCategoryData.name.trim()) {
      alert('❌ Numele categoriei nu poate fi gol!');
      return;
    }

    updateProductCategory(editingCategoryId, {
      name: editingCategoryData.name,
      color: editingCategoryData.color,
      icon: editingCategoryData.icon,
      updatedAt: new Date().toISOString()
    });

    alert(`✅ Categoria "${editingCategoryData.name}" a fost actualizată!`);
    cancelEditingCategory();
  };

  /**
   * Șterge o categorie
   */
  const deleteProductCategory = (categoryId) => {
    // Verifică dacă există produse în această categorie
    const products = templateService.getProductTemplates();
    const productsInCategory = products.filter(p => p.category === categoryId);

    if (productsInCategory.length > 0) {
      const confirmed = window.confirm(
        `Categoria conține ${productsInCategory.length} produse.\n\n` +
        `Produsele vor fi mutate în categoria "Fără categorie".\n\n` +
        `Continui?`
      );
      if (!confirmed) return;

      // Mută produsele în categoria "Fără categorie"
      productsInCategory.forEach(product => {
        templateService.updateProductTemplate(product.id, { category: null });
      });
    }

    const updatedCategories = productCategories.filter(cat => cat.id !== categoryId);
    saveProductCategories(updatedCategories);
  };

  // ===== Funcții Fișa Client =====

  /**
   * Deschide fișa client cu toate facturile emise
   */
  const openClientProfile = (client) => {
    setSelectedClientForProfile(client);
    setClientProfileDialogOpen(true);
  };

  /**
   * Obține toate facturile pentru un client specific
   */
  const getClientInvoices = (clientCUI) => {
    if (!clientCUI) return [];

    const allInvoices = invoiceHistoryService.getAllInvoices();
    return allInvoices.filter(invoice =>
      invoice.client?.cui === clientCUI
    ).sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
  };

  /**
   * Calculează statistici pentru un client
   */
  const calculateClientStats = (clientCUI) => {
    const invoices = getClientInvoices(clientCUI);

    if (invoices.length === 0) {
      return {
        totalInvoices: 0,
        totalAmount: 0,
        currency: 'RON',
        lastInvoiceDate: null,
        averageAmount: 0,
        unpaidInvoices: 0
      };
    }

    const totalAmount = invoices.reduce((sum, inv) => {
      return sum + (parseFloat(inv.totals?.gross) || 0);
    }, 0);

    const unpaidInvoices = invoices.filter(inv => {
      if (!inv.dueDate) return false;
      const dueDate = new Date(inv.dueDate);
      const today = new Date();
      return dueDate < today;
    }).length;

    return {
      totalInvoices: invoices.length,
      totalAmount: totalAmount.toFixed(2),
      currency: invoices[0].currency || 'RON',
      lastInvoiceDate: invoices[0].issueDate,
      averageAmount: (totalAmount / invoices.length).toFixed(2),
      unpaidInvoices
    };
  };

  // ===== Funcții Furnizori (Societăți Proprii) =====

  /**
   * Încarcă furnizorii salvați din localStorage
   */
  const loadSavedSuppliers = () => {
    try {
      const suppliers = JSON.parse(localStorage.getItem('normalro_saved_suppliers') || '[]');
      setSavedSuppliers(suppliers);
      console.log('✅ Furnizori încărcați:', suppliers.length);
    } catch (error) {
      console.error('Eroare încărcare furnizori:', error);
    }
  };

  /**
   * Salvează furnizorul curent ca societate proprie
   */
  const saveCurrentSupplier = () => {
    if (!invoiceData.supplierName || !invoiceData.supplierCUI) {
      alert('❌ Completează cel puțin numele și CUI-ul furnizorului!');
      return;
    }

    // Verifică dacă există deja un furnizor cu același CUI
    const existingSupplier = savedSuppliers.find(s => 
      s.cui && invoiceData.supplierCUI && 
      s.cui.toString().replace(/\D/g, '') === invoiceData.supplierCUI.toString().replace(/\D/g, '')
    );

    if (existingSupplier) {
      // Furnizor existent - oferă opțiunea de actualizare
      const confirmUpdate = window.confirm(
        `⚠️ Există deja un furnizor salvat cu CUI-ul ${invoiceData.supplierCUI}:\n\n` +
        `"${existingSupplier.displayName}"\n\n` +
        `Vrei să actualizezi datele acestui furnizor cu informațiile curente?\n\n` +
        `✅ DA - Actualizează furnizorul existent\n` +
        `❌ NU - Anulează operațiunea\n\n` +
        `(Nu se pot avea 2 furnizori cu același CUI)`
      );

      if (!confirmUpdate) return;

      // Actualizează furnizorul existent
      const updatedSupplier = {
        ...existingSupplier,
        name: invoiceData.supplierName,
        regCom: invoiceData.supplierRegCom,
        address: invoiceData.supplierAddress,
        city: invoiceData.supplierCity,
        county: invoiceData.supplierCounty,
        country: invoiceData.supplierCountry,
        phone: invoiceData.supplierPhone,
        email: invoiceData.supplierEmail,
        vatPrefix: invoiceData.supplierVatPrefix,
        bankAccounts: invoiceData.supplierBankAccounts,
        updatedAt: new Date().toISOString()
      };

      const updatedSuppliers = savedSuppliers.map(s => 
        s.id === existingSupplier.id ? updatedSupplier : s
      );

      localStorage.setItem('normalro_saved_suppliers', JSON.stringify(updatedSuppliers));
      setSavedSuppliers(updatedSuppliers);

      alert(
        `✅ Furnizor "${existingSupplier.displayName}" actualizat cu succes!\n\n` +
        `Datele au fost actualizate cu informațiile curente.`
      );
      console.log('✅ Furnizor actualizat:', updatedSupplier);
      return;
    }

    // Furnizor nou - cere nume de afișare
    const supplierName = prompt('Introdu un nume pentru această societate (ex: "SC ABC SRL - Principal"):', invoiceData.supplierName);
    if (!supplierName) return;

    const supplier = {
      id: Date.now(),
      displayName: supplierName,
      name: invoiceData.supplierName,
      cui: invoiceData.supplierCUI,
      regCom: invoiceData.supplierRegCom,
      address: invoiceData.supplierAddress,
      city: invoiceData.supplierCity,
      county: invoiceData.supplierCounty,
      country: invoiceData.supplierCountry,
      phone: invoiceData.supplierPhone,
      email: invoiceData.supplierEmail,
      vatPrefix: invoiceData.supplierVatPrefix,
      bankAccounts: invoiceData.supplierBankAccounts,
      createdAt: new Date().toISOString()
    };

    const suppliers = [...savedSuppliers, supplier];
    localStorage.setItem('normalro_saved_suppliers', JSON.stringify(suppliers));
    setSavedSuppliers(suppliers);

    alert(`✅ Furnizor "${supplierName}" salvat cu succes!`);
    console.log('✅ Furnizor salvat:', supplier);
  };

  /**
   * Selectează un furnizor din listă
   */
  const selectSupplier = (supplier) => {
    setInvoiceData(prev => ({
      ...prev,
      supplierName: supplier.name,
      supplierCUI: supplier.cui,
      supplierRegCom: supplier.regCom,
      supplierAddress: supplier.address,
      supplierCity: supplier.city,
      supplierCounty: supplier.county,
      supplierCountry: supplier.country,
      supplierPhone: supplier.phone,
      supplierEmail: supplier.email,
      supplierVatPrefix: supplier.vatPrefix,
      supplierBankAccounts: supplier.bankAccounts || [{ bank: '', iban: '', currency: 'RON' }]
    }));

    setSupplierTemplateDialogOpen(false);
    alert(`✅ Furnizor "${supplier.displayName}" selectat!`);
  };

  /**
   * Șterge un furnizor salvat
   */
  const deleteSupplier = (supplierId) => {
    const supplier = savedSuppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    const confirmed = window.confirm(
      `Ești sigur că vrei să ștergi furnizorul "${supplier.displayName}"?`
    );

    if (!confirmed) return;

    const updatedSuppliers = savedSuppliers.filter(s => s.id !== supplierId);
    localStorage.setItem('normalro_saved_suppliers', JSON.stringify(updatedSuppliers));
    setSavedSuppliers(updatedSuppliers);

    alert(`✅ Furnizor "${supplier.displayName}" șters!`);
  };

  // Încarcă furnizorii la mount
  useEffect(() => {
    loadSavedSuppliers();
  }, []);

  // ===== Funcții Versioning =====

  /**
   * Salvează versiune curentă a facturii
   */
  const saveInvoiceVersion = useCallback(() => {
    const version = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      invoiceData: { ...invoiceData },
      lines: lines.map(l => ({ ...l })),
      totalDiscount: { ...totalDiscount },
      attachedFiles: attachedFiles.map(f => ({ ...f })),
      totals: calculateTotals()
    };

    const key = `${invoiceData.series}_${invoiceData.number}`;
    const existingVersions = JSON.parse(localStorage.getItem(`normalro_invoice_versions_${key}`) || '[]');
    
    // Păstrează doar ultimele 5 versiuni
    const updatedVersions = [version, ...existingVersions].slice(0, 5);
    
    localStorage.setItem(`normalro_invoice_versions_${key}`, JSON.stringify(updatedVersions));
    setInvoiceVersions(updatedVersions);
    
    console.log(`✅ Versiune salvată pentru ${key} (total: ${updatedVersions.length})`);
    return version;
  }, [invoiceData, lines, totalDiscount, attachedFiles]);

  /**
   * Încarcă versiunile pentru factura curentă
   */
  const loadInvoiceVersions = useCallback(() => {
    if (!invoiceData.series || !invoiceData.number) {
      setInvoiceVersions([]);
      return;
    }

    const key = `${invoiceData.series}_${invoiceData.number}`;
    const versions = JSON.parse(localStorage.getItem(`normalro_invoice_versions_${key}`) || '[]');
    setInvoiceVersions(versions);
    
    console.log(`📚 Găsite ${versions.length} versiuni pentru ${key}`);
  }, [invoiceData.series, invoiceData.number]);

  /**
   * Restaurează o versiune anterioară
   */
  const restoreVersion = (version) => {
    const confirmed = window.confirm(
      `⚠️ Vrei să restaurezi versiunea din ${new Date(version.timestamp).toLocaleString('ro-RO')}?\n\n` +
      `Datele curente vor fi înlocuite cu cele din versiunea selectată.\n\n` +
      `Continui?`
    );

    if (!confirmed) return;

    // Salvează versiune curentă înainte de restaurare
    saveInvoiceVersion();

    // Restaurează datele
    setInvoiceData(version.invoiceData);
    setLines(version.lines);
    setTotalDiscount(version.totalDiscount);
    setAttachedFiles(version.attachedFiles || []);

    setShowVersionsDialog(false);
    alert('✅ Versiune restaurată cu succes!');
    console.log('🔄 Versiune restaurată:', version.timestamp);
  };

  /**
   * Șterge o versiune
   */
  const deleteVersion = (versionId) => {
    if (!invoiceData.series || !invoiceData.number) return;

    const confirmed = window.confirm('Sigur vrei să ștergi această versiune?');
    if (!confirmed) return;

    const key = `${invoiceData.series}_${invoiceData.number}`;
    const updatedVersions = invoiceVersions.filter(v => v.id !== versionId);
    
    localStorage.setItem(`normalro_invoice_versions_${key}`, JSON.stringify(updatedVersions));
    setInvoiceVersions(updatedVersions);
    
    console.log('🗑️ Versiune ștearsă');
  };

  // useEffect pentru încărcarea versiunilor când se schimbă seria/numărul
  useEffect(() => {
    loadInvoiceVersions();
  }, [invoiceData.series, invoiceData.number, loadInvoiceVersions]);

  // useEffect pentru salvare automată versiune la modificări importante
  useEffect(() => {
    // Debounce pentru a nu salva prea des
    const timer = setTimeout(() => {
      if (invoiceData.series && invoiceData.number && lines.length > 0) {
        // Salvează versiune automată doar dacă există date semnificative
        const hasSignificantData = 
          invoiceData.supplierName || 
          invoiceData.clientName || 
          lines.some(l => l.product && parseFloat(l.unitNetPrice) > 0);
        
        if (hasSignificantData) {
          saveInvoiceVersion();
        }
      }
    }, 10000); // 10 secunde după ultima modificare

    return () => clearTimeout(timer);
  }, [invoiceData, lines, totalDiscount, saveInvoiceVersion]);

  // ===== Funcții Reset și Clear Date =====

  /**
   * Resetează formularul factură la valorile implicite (păstrează furnizor)
   */
  const resetInvoiceForm = () => {
    const confirmed = window.confirm(
      '⚠️ Vrei să resetezi formularul?\n\n' +
      'Această acțiune va șterge:\n' +
      '• Date beneficiar\n' +
      '• Toate liniile produse\n' +
      '• Note și atașamente\n\n' +
      'Datele furnizorului vor fi păstrate.\n\n' +
      'Continui?'
    );

    if (!confirmed) return;

    // Resetează doar datele facturii, păstrând furnizorul
    setInvoiceData(prev => ({
      ...prev,
      // Păstrează GUID
      guid: prev.guid,
      
      // Resetează date factură
      series: prev.series,
      number: incrementInvoiceNumber(prev.number),
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: '',

      // Păstrează furnizor
      // Resetează client
      clientName: '',
      clientCUI: '',
      clientRegCom: '',
      clientAddress: '',
      clientCity: '',
      clientCounty: '',
      clientCountry: 'Romania',
      clientPhone: '',
      clientEmail: '',
      clientBankAccounts: [{ bank: '', iban: '', currency: 'RON' }],
      clientVatPrefix: '-'
    }));

    // Resetează linii
    setLines([{
      id: Date.now(),
      product: '',
      quantity: '1',
      purchasePrice: '0.00',
      markup: '0.00',
      unitNetPrice: '0.00',
      vatRate: DEFAULT_VAT_RATE,
      unitGrossPrice: '0.00',
      discountPercent: '0.00',
      discountAmount: '0.00'
    }]);

    // Resetează reduceri
    setTotalDiscount({
      type: 'none',
      percent: '0.00',
      amount: '0.00'
    });

    // Resetează atașamente
    setAttachedFiles([]);

    // Resetează sortare
    setSortBy('manual');
    setSortOrder('asc');
    setGroupByCategory(false);

    console.log('✅ Formular resetat');
  };

  /**
   * Șterge TOATE datele (inclusiv furnizor, istoric, șabloane)
   */
  const clearAllData = () => {
    const confirmed = window.confirm(
      '🚨 ATENȚIE - ȘTERGERE COMPLETĂ DATE! 🚨\n\n' +
      'Această acțiune va șterge TOATE datele:\n' +
      '• Cookie furnizor\n' +
      '• Șabloane produse\n' +
      '• Șabloane clienți\n' +
      '• Istoric facturi\n' +
      '• Categorii produse\n' +
      '• Formularul curent\n\n' +
      '⚠️ ACEASTĂ ACȚIUNE NU POATE FI ANULATĂ!\n\n' +
      'Ești ABSOLUT SIGUR?'
    );

    if (!confirmed) return;

    // Confirmă din nou
    const doubleConfirm = window.confirm(
      'ULTIMA VERIFICARE!\n\n' +
      'Toate datele vor fi șterse permanent.\n' +
      'Datele din Google Sheets rămân intacte.\n\n' +
      'Continui cu ștergerea?'
    );

    if (!doubleConfirm) return;

    try {
      // Șterge cookie
      document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

      // Șterge din localStorage
      templateService.clearAllTemplates();
      invoiceHistoryService.clearAllInvoices();
      localStorage.removeItem('normalro_product_categories');
      localStorage.removeItem('normalro_invoice_draft');
      localStorage.removeItem('normalro_invoice_sabloane');

      // Resetează state-ul complet
      setInvoiceData({
        guid: '',
        series: '',
        number: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        currency: 'RON',
        notes: '',
        supplierName: '',
        supplierCUI: '',
        supplierRegCom: '',
        supplierAddress: '',
        supplierCity: '',
        supplierCounty: '',
        supplierCountry: 'Romania',
        supplierPhone: '',
        supplierEmail: '',
        supplierBankAccounts: [{ bank: '', iban: '', currency: 'RON' }],
        supplierVatPrefix: '-',
        clientName: '',
        clientCUI: '',
        clientRegCom: '',
        clientAddress: '',
        clientCity: '',
        clientCounty: '',
        clientCountry: 'Romania',
        clientPhone: '',
        clientEmail: '',
        clientBankAccounts: [{ bank: '', iban: '', currency: 'RON' }],
        clientVatPrefix: '-'
      });

      setLines([{
        id: Date.now(),
        product: '',
        quantity: '1',
        purchasePrice: '0.00',
        markup: '0.00',
        unitNetPrice: '0.00',
        vatRate: DEFAULT_VAT_RATE,
        unitGrossPrice: '0.00',
        discountPercent: '0.00',
        discountAmount: '0.00'
      }]);

      setAttachedFiles([]);
      setTotalDiscount({ type: 'none', percent: '0.00', amount: '0.00' });
      setSortBy('manual');
      setSortOrder('asc');
      setGroupByCategory(false);
      setProductCategories([]);
      setSaveDataConsent(false);

      alert(
        '✅ Toate datele au fost șterse cu succes!\n\n' +
        'Aplicația a fost resetată la starea inițială.'
      );

      console.log('🗑️ Toate datele au fost șterse');
    } catch (error) {
      console.error('Eroare ștergere date:', error);
      alert('❌ Eroare la ștergerea datelor:\n\n' + error.message);
    }
  };

  // ===== Funcții Sortare și Grupare Linii =====

  /**
   * Sortează liniile facturii după criteriul selectat
   */
  const sortLines = (sortType) => {
    let sortedLines = [...lines];

    switch (sortType) {
      case 'name':
        sortedLines.sort((a, b) => {
          const nameA = (a.product || '').toLowerCase();
          const nameB = (b.product || '').toLowerCase();
          return sortOrder === 'asc' 
            ? nameA.localeCompare(nameB) 
            : nameB.localeCompare(nameA);
        });
        break;
      
      case 'price':
        sortedLines.sort((a, b) => {
          const priceA = parseFloat(a.unitNetPrice) || 0;
          const priceB = parseFloat(b.unitNetPrice) || 0;
          return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
        });
        break;
      
      case 'total':
        sortedLines.sort((a, b) => {
          const totalA = parseFloat(calculateLineTotal(a, 'gross')) || 0;
          const totalB = parseFloat(calculateLineTotal(b, 'gross')) || 0;
          return sortOrder === 'asc' ? totalA - totalB : totalB - totalA;
        });
        break;
      
      default:
        // Manual - nu sortăm, păstrăm ordinea curentă
        return;
    }

    setLines(sortedLines);
    setSortBy(sortType);
  };

  /**
   * Schimbă ordinea de sortare (asc/desc)
   */
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    
    // Reaplică sortarea cu noua ordine
    if (sortBy !== 'manual') {
      sortLines(sortBy);
    }
  };

  /**
   * Obține liniile grupate pe categorii (pentru afișare)
   */
  const getGroupedLines = () => {
    if (!groupByCategory) {
      return { ungrouped: lines };
    }

    const grouped = {};
    
    lines.forEach(line => {
      // Verifică dacă produsul are categorie salvată
      const products = templateService.getProductTemplates();
      const productTemplate = products.find(p => p.name === line.product);
      
      const categoryId = productTemplate?.category || 'uncategorized';
      
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(line);
    });

    return grouped;
  };

  // ===== Funcții UI/UX îmbunătățiri =====

  /**
   * Duplicate line - clonează o linie existentă
   */
  const duplicateLine = (lineId) => {
    const lineToDuplicate = lines.find(l => l.id === lineId);
    if (!lineToDuplicate) return;

    const newLine = {
      ...lineToDuplicate,
      id: Date.now() + Math.random()
    };

    // Inserează duplicatul imediat după linia originală
    const lineIndex = lines.findIndex(l => l.id === lineId);
    const newLines = [
      ...lines.slice(0, lineIndex + 1),
      newLine,
      ...lines.slice(lineIndex + 1)
    ];

    setLines(newLines);
    console.log('📋 Linie duplicată:', lineId);
  };

  /**
   * Move line up
   */
  const moveLineUp = (lineId) => {
    const lineIndex = lines.findIndex(l => l.id === lineId);
    if (lineIndex <= 0) return; // Deja primul

    const newLines = [...lines];
    [newLines[lineIndex - 1], newLines[lineIndex]] = [newLines[lineIndex], newLines[lineIndex - 1]];
    setLines(newLines);
  };

  /**
   * Move line down
   */
  const moveLineDown = (lineId) => {
    const lineIndex = lines.findIndex(l => l.id === lineId);
    if (lineIndex >= lines.length - 1) return; // Deja ultimul

    const newLines = [...lines];
    [newLines[lineIndex], newLines[lineIndex + 1]] = [newLines[lineIndex + 1], newLines[lineIndex]];
    setLines(newLines);
  };

  /**
   * Autosave draft - salvează automat datele la fiecare 30 secunde
   */
  const autosaveDraft = useCallback(() => {
    try {
      const draft = {
        invoiceData,
        lines,
        attachedFiles: attachedFiles.map(f => ({
          id: f.id,
          name: f.name,
          size: f.size,
          mimeType: f.mimeType
          // Nu salvăm base64 în autosave pentru a economisi spațiu
        })),
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('normalro_invoice_draft', JSON.stringify(draft));
      setLastAutosave(new Date());
      setAutosaveSnackbar(true);
      console.log('💾 Autosave executat:', new Date().toLocaleTimeString('ro-RO'));
    } catch (error) {
      console.error('Eroare autosave:', error);
    }
  }, [invoiceData, lines, attachedFiles]);

  /**
   * Load draft - încarcă draft salvat automat
   */
  const loadDraft = () => {
    try {
      const draftStr = localStorage.getItem('normalro_invoice_draft');
      if (!draftStr) {
        alert('Nu există niciun draft salvat!');
        return;
      }

      const draft = JSON.parse(draftStr);

      const confirmed = window.confirm(
        `Ai un draft salvat la ${new Date(draft.timestamp).toLocaleString('ro-RO')}.\n\n` +
        `Vrei să încarci acest draft?\n` +
        `(Atenție: Datele curente vor fi înlocuite!)`
      );

      if (!confirmed) return;

      setInvoiceData(draft.invoiceData);
      setLines(draft.lines);
      // Nu încărcăm fișierele atașate (nu au base64)
      setAttachedFiles([]);

      alert('✅ Draft încărcat cu succes!');
      console.log('📂 Draft încărcat din autosave');
    } catch (error) {
      console.error('Eroare încărcare draft:', error);
      alert('❌ Eroare la încărcarea draft-ului!');
    }
  };

  /**
   * Preview PDF/Excel înainte de descărcare
   */
  const showPreview = async (type) => {
    setPreviewDialog({ open: true, type, content: 'loading' });

    try {
      if (type === 'pdf') {
        // Generează preview HTML al PDF-ului
        const previewHTML = generateInvoiceHTML();
        setPreviewDialog({ open: true, type: 'pdf', content: previewHTML });
      } else if (type === 'excel') {
        // Generează preview table pentru Excel
        const previewTable = generateExcelPreview();
        setPreviewDialog({ open: true, type: 'excel', content: previewTable });
      }
    } catch (error) {
      console.error('Eroare generare preview:', error);
      setPreviewDialog({ open: false, type: null, content: null });
      alert('Eroare la generarea preview-ului!');
    }
  };

  /**
   * Generează HTML pentru preview PDF
   */
  const generateInvoiceHTML = () => {
    const totals = calculateTotals();

    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; background: #ffffff;">
        <!-- Header modern -->
        <div style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); padding: 30px; border-radius: 12px 12px 0 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 600; text-align: center; letter-spacing: 1px;">FACTURĂ</h1>
          <div style="text-align: center; margin-top: 15px; color: rgba(255,255,255,0.95); font-size: 14px;">
            <div style="display: inline-block; background: rgba(255,255,255,0.15); padding: 8px 20px; border-radius: 20px; margin: 5px;">
              <strong>Serie:</strong> ${invoiceData.series || '-'} &nbsp;|&nbsp; <strong>Nr:</strong> ${invoiceData.number || '-'}
            </div>
            <div style="display: inline-block; background: rgba(255,255,255,0.15); padding: 8px 20px; border-radius: 20px; margin: 5px;">
              <strong>Data:</strong> ${invoiceData.issueDate || '-'}${invoiceData.dueDate ? ` &nbsp;|&nbsp; <strong>Scadență:</strong> ${invoiceData.dueDate}` : ''}
            </div>
          </div>
        </div>
        
        <!-- Furnizor & Beneficiar cu carduri -->
        <table style="width: 100%; margin: 25px 0; border-spacing: 15px 0;">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #1976d2; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="color: #1976d2; font-weight: 700; font-size: 13px; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">📤 Furnizor</div>
                <div style="font-weight: 600; font-size: 15px; color: #212121; margin-bottom: 8px;">${invoiceData.supplierName || '-'}</div>
                <div style="font-size: 12px; color: #666; line-height: 1.6;">
                  <div><strong>CUI:</strong> ${invoiceData.supplierCUI || '-'}</div>
                  ${invoiceData.supplierRegCom ? `<div><strong>Reg Com:</strong> ${invoiceData.supplierRegCom}</div>` : ''}
                  ${invoiceData.supplierAddress ? `<div style="margin-top: 4px;">${invoiceData.supplierAddress}</div>` : ''}
                  ${invoiceData.supplierCity ? `<div>${invoiceData.supplierCity}</div>` : ''}
                  ${invoiceData.supplierCounty ? `<div>${invoiceData.supplierCounty}</div>` : ''}
                  ${invoiceData.supplierPhone ? `<div style="margin-top: 4px;"><strong>Tel:</strong> ${invoiceData.supplierPhone}</div>` : ''}
                  ${invoiceData.supplierEmail ? `<div><strong>Email:</strong> ${invoiceData.supplierEmail}</div>` : ''}
                  ${invoiceData.supplierBankAccounts && invoiceData.supplierBankAccounts.length > 0 ? `
                    ${invoiceData.supplierBankAccounts.map((account, idx) => {
                      if (!account.iban && !account.bank) return '';
                      const label = invoiceData.supplierBankAccounts.length > 1 ? `Cont ${idx + 1}` : 'Cont bancar';
                      return `
                        ${account.iban ? `<div style="margin-top: 4px;"><strong>${label} (${account.currency || 'RON'}):</strong> ${account.iban}</div>` : ''}
                        ${account.bank ? `<div><strong>Banca:</strong> ${account.bank}</div>` : ''}
                      `;
                    }).join('')}
                  ` : ''}
                </div>
              </div>
            </td>
            <td style="width: 50%; vertical-align: top;">
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="color: #4caf50; font-weight: 700; font-size: 13px; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">📥 Beneficiar</div>
                <div style="font-weight: 600; font-size: 15px; color: #212121; margin-bottom: 8px;">${invoiceData.clientName || '-'}</div>
                <div style="font-size: 12px; color: #666; line-height: 1.6;">
                  <div><strong>CUI:</strong> ${invoiceData.clientCUI || '-'}</div>
                  ${invoiceData.clientRegCom ? `<div><strong>Reg Com:</strong> ${invoiceData.clientRegCom}</div>` : ''}
                  ${invoiceData.clientAddress ? `<div style="margin-top: 4px;">${invoiceData.clientAddress}</div>` : ''}
                  ${invoiceData.clientCity ? `<div>${invoiceData.clientCity}</div>` : ''}
                  ${invoiceData.clientCounty ? `<div>${invoiceData.clientCounty}</div>` : ''}
                  ${invoiceData.clientPhone ? `<div style="margin-top: 4px;"><strong>Tel:</strong> ${invoiceData.clientPhone}</div>` : ''}
                  ${invoiceData.clientEmail ? `<div><strong>Email:</strong> ${invoiceData.clientEmail}</div>` : ''}
                  ${invoiceData.clientBankAccounts && invoiceData.clientBankAccounts.length > 0 ? `
                    ${invoiceData.clientBankAccounts.map((account, idx) => {
                      if (!account.iban && !account.bank) return '';
                      const label = invoiceData.clientBankAccounts.length > 1 ? `Cont ${idx + 1}` : 'Cont bancar';
                      return `
                        ${account.iban ? `<div style="margin-top: 4px;"><strong>${label} (${account.currency || 'RON'}):</strong> ${account.iban}</div>` : ''}
                        ${account.bank ? `<div><strong>Banca:</strong> ${account.bank}</div>` : ''}
                      `;
                    }).join('')}
                  ` : ''}
                </div>
              </div>
            </td>
          </tr>
        </table>
        
        <!-- Informație Monedă -->
        <div style="margin: 25px 0 10px 0; padding: 8px 12px; background: linear-gradient(to right, #fff3e0, #ffffff); border-left: 4px solid #ff9800; border-radius: 4px; display: inline-block;">
          <span style="color: #e65100; font-weight: 700; font-size: 11px; letter-spacing: 0.5px;">💰 Monedă: ${invoiceData.currency}</span>
        </div>
        
        <!-- Tabel modern -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white;">
              <th style="padding: 14px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: none;">Nr.</th>
              <th style="padding: 14px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; border: none;">Produs/Serviciu</th>
              <th style="padding: 14px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: none;">Cant.</th>
              <th style="padding: 14px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; border: none;">Preț Net</th>
              <th style="padding: 14px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: none;">TVA%</th>
              <th style="padding: 14px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; border: none;">Total Net</th>
              <th style="padding: 14px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; border: none;">Total TVA</th>
              <th style="padding: 14px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; border: none;">Total Brut</th>
            </tr>
          </thead>
          <tbody>
            ${lines.map((line, index) => {
      const discountPercent = parseFloat(line.discountPercent) || 0;
      const discountAmount = parseFloat(line.discountAmount) || 0;
      const lineDiscount = parseFloat(calculateLineDiscount(line)) || 0;
      const hasDiscount = discountPercent > 0 || discountAmount > 0;

      let rows = `
              <tr style="border-bottom: 1px solid #e0e0e0; transition: background 0.2s;">
                <td style="padding: 12px 10px; text-align: center; font-size: 12px; color: #757575; border: none;">${index + 1}</td>
                <td style="padding: 12px 10px; font-size: 12px; color: #212121; border: none;">${line.product || '-'}</td>
                <td style="padding: 12px 10px; text-align: center; font-size: 12px; color: #212121; border: none;">${line.quantity}</td>
                <td style="padding: 12px 10px; text-align: right; font-size: 12px; color: #212121; border: none;">${line.unitNetPrice}</td>
                <td style="padding: 12px 10px; text-align: center; font-size: 12px; color: #1976d2; font-weight: 500; border: none;">${line.vatRate}%</td>
                <td style="padding: 12px 10px; text-align: right; font-size: 12px; color: #212121; font-weight: 500; border: none;">${calculateLineTotal(line, 'net')}</td>
                <td style="padding: 12px 10px; text-align: right; font-size: 12px; color: #1976d2; font-weight: 500; border: none;">${calculateLineTotal(line, 'vat')}</td>
                <td style="padding: 12px 10px; text-align: right; font-size: 13px; color: #212121; font-weight: 600; border: none;">${calculateLineTotal(line, 'gross')}</td>
              </tr>`;

      // Adaugă linie de discount dacă există
      if (hasDiscount) {
        const discountNet = (parseFloat(line.unitNetPrice) * parseFloat(line.quantity) * discountPercent / 100 + discountAmount);
        const discountVat = discountNet * parseFloat(line.vatRate) / 100;
        const discountGross = discountNet + discountVat;
        rows += `
              <tr style="background: linear-gradient(to right, #fff5f5, #ffffff); border-bottom: 1px solid #ffcdd2;">
                <td style="padding: 10px; text-align: center; border: none;"></td>
                <td style="padding: 10px; font-style: italic; font-size: 11px; color: #c62828; border: none;">🏷️ Discount ${discountPercent > 0 ? discountPercent + '%' : ''} ${discountAmount > 0 ? discountAmount : ''} la ${line.product || 'produs'}</td>
                <td style="padding: 10px; text-align: center; font-size: 11px; color: #757575; border: none;">1</td>
                <td style="padding: 10px; text-align: right; color: #c62828; font-weight: 600; font-size: 11px; border: none;">-${discountNet.toFixed(2)}</td>
                <td style="padding: 10px; text-align: center; font-size: 11px; color: #c62828; border: none;">${line.vatRate}%</td>
                <td style="padding: 10px; text-align: right; color: #c62828; font-weight: 600; font-size: 11px; border: none;">-${discountNet.toFixed(2)}</td>
                <td style="padding: 10px; text-align: right; color: #c62828; font-weight: 600; font-size: 11px; border: none;">-${discountVat.toFixed(2)}</td>
                <td style="padding: 10px; text-align: right; color: #c62828; font-weight: 700; font-size: 11px; border: none;">-${discountGross.toFixed(2)}</td>
              </tr>`;
      }

      return rows;
    }).join('')}
            ${totals.discountAmount && parseFloat(totals.discountAmount) > 0 ? (() => {
        const originalGross = parseFloat(totals.originalGross) || 0;
        const finalGross = parseFloat(totals.gross) || 0;
        const totalDiscountGross = originalGross - finalGross - parseFloat(totals.lineDiscounts || 0);
        const totalDiscountNet = totalDiscountGross / 1.19; // Aproximativ, depinde de TVA medie
        const totalDiscountVat = totalDiscountGross - totalDiscountNet;
        return `
            <tr style="background: linear-gradient(to right, #ffe8e8, #ffffff); border-bottom: 2px solid #ef5350;">
              <td style="padding: 10px; text-align: center; border: none;"></td>
              <td style="padding: 10px; font-style: italic; font-weight: 700; font-size: 11px; color: #b71c1c; border: none;">🎁 Discount factura de ${totalDiscount.type === 'percent' ? totalDiscount.percent + '%' : totalDiscount.amount}</td>
              <td style="padding: 10px; text-align: center; font-size: 11px; color: #757575; border: none;">1</td>
              <td style="padding: 10px; text-align: right; color: #b71c1c; font-weight: 700; font-size: 11px; border: none;">-${totalDiscountNet.toFixed(2)}</td>
              <td style="padding: 10px; text-align: center; border: none;"></td>
              <td style="padding: 10px; text-align: right; color: #b71c1c; font-weight: 700; font-size: 11px; border: none;">-${totalDiscountNet.toFixed(2)}</td>
              <td style="padding: 10px; text-align: right; color: #b71c1c; font-weight: 700; font-size: 11px; border: none;">-${totalDiscountVat.toFixed(2)}</td>
              <td style="padding: 10px; text-align: right; color: #b71c1c; font-weight: 800; font-size: 12px; border: none;">-${totalDiscountGross.toFixed(2)}</td>
              </tr>
            `;
      })() : ''}
          </tbody>
          <tfoot>
            <tr style="background: linear-gradient(135deg, #37474f 0%, #263238 100%); color: white;">
              <td colspan="5" style="padding: 16px 10px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border: none;">💰 TOTAL FACTURĂ</td>
              <td style="padding: 16px 10px; text-align: right; font-size: 14px; font-weight: 700; border: none;">${totals.net} ${invoiceData.currency}</td>
              <td style="padding: 16px 10px; text-align: right; font-size: 14px; font-weight: 700; border: none;">${totals.vat} ${invoiceData.currency}</td>
              <td style="padding: 16px 10px; text-align: right; font-size: 16px; font-weight: 800; background: rgba(76, 175, 80, 0.2); border: none;">${totals.gross} ${invoiceData.currency}</td>
            </tr>
          </tfoot>
        </table>
        
        ${invoiceData.notes ? `
          <div style="margin-top: 25px; padding: 20px; background: linear-gradient(to right, #e3f2fd, #ffffff); border-left: 4px solid #1976d2; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="color: #1976d2; font-weight: 700; font-size: 13px; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">📝 Note</div>
            <div style="font-size: 12px; color: #424242; line-height: 1.6;">${invoiceData.notes}</div>
          </div>
        ` : ''}
      </div>
    `;
  };

  /**
   * Generează preview pentru Excel
   */
  const generateExcelPreview = () => {
    const totals = calculateTotals();
    const rows = [];
    let lineNumber = 0;

    lines.forEach((line, index) => {
      const discountPercent = parseFloat(line.discountPercent) || 0;
      const discountAmount = parseFloat(line.discountAmount) || 0;
      const hasDiscount = discountPercent > 0 || discountAmount > 0;

      lineNumber++;
      rows.push([
        lineNumber,
        line.product || '-',
        line.quantity,
        line.unitNetPrice,
        `${line.vatRate}%`,
        calculateLineTotal(line, 'net'),
        calculateLineTotal(line, 'vat'),
        calculateLineTotal(line, 'gross')
      ]);

      // Adaugă linie de discount dacă există
      if (hasDiscount) {
        lineNumber++;
        const discountNet = (parseFloat(line.unitNetPrice) * parseFloat(line.quantity) * discountPercent / 100 + discountAmount);
        const discountVat = discountNet * parseFloat(line.vatRate) / 100;
        const discountGross = discountNet + discountVat;
        rows.push([
          lineNumber,
          `Discount ${discountPercent > 0 ? discountPercent + '%' : ''} ${discountAmount > 0 ? discountAmount : ''} la ${line.product || 'produs'}`,
          '1',
          `-${discountNet.toFixed(2)}`,
          `${line.vatRate}%`,
          `-${discountNet.toFixed(2)}`,
          `-${discountVat.toFixed(2)}`,
          `-${discountGross.toFixed(2)}`
        ]);
      }
    });

    // Adaugă linie discount factura (dacă există)
    if (totals.discountAmount && parseFloat(totals.discountAmount) > 0) {
      lineNumber++;
      const totalDiscountNet = parseFloat(totals.net) * (parseFloat(totalDiscount.percent) || 0) / 100;
      const totalDiscountVat = parseFloat(totals.vat) * (parseFloat(totalDiscount.percent) || 0) / 100;
      rows.push([
        lineNumber,
        `Discount factura de ${totalDiscount.type === 'percent' ? totalDiscount.percent + '%' : totalDiscount.amount}`,
        '1',
        `-${totalDiscountNet.toFixed(2)}`,
        '', // TVA% gol
        `-${totalDiscountNet.toFixed(2)}`,
        `-${totalDiscountVat.toFixed(2)}`,
        `-${totals.discountAmount}`
      ]);
    }

    return {
      header: ['Nr.', 'Produs/Serviciu', 'Cantitate', 'Preț Net', 'TVA %', 'Total Net', 'Total TVA', 'Total Brut'],
      rows: rows,
      totals: {
        net: `${totals.net} ${invoiceData.currency}`,
        vat: `${totals.vat} ${invoiceData.currency}`,
        gross: `${totals.gross} ${invoiceData.currency}`
      }
    };
  };

  /**
   * Keyboard shortcuts handler
   */
  const handleKeyboardShortcut = useCallback((event) => {
    // Ctrl+S sau Cmd+S - Salvează (autosave)
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      autosaveDraft();
      alert('💾 Draft salvat!');
    }

    // Ctrl+P sau Cmd+P - Preview PDF
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
      event.preventDefault();
      showPreview('pdf');
    }

    // Ctrl+E sau Cmd+E - Preview Excel
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
      event.preventDefault();
      showPreview('excel');
    }

    // Ctrl+D sau Cmd+D - Descarcă PDF
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
      event.preventDefault();
      exportToPDF();
    }

    // Ctrl+Shift+? - Arată shortcuts
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === '?') {
      event.preventDefault();
      setShortcutsDialogOpen(true);
    }

    // Escape - Închide dialoguri
    if (event.key === 'Escape') {
      setPreviewDialog({ open: false, type: null, content: null });
      setShortcutsDialogOpen(false);
    }
  }, [autosaveDraft]);

  // useEffect pentru keyboard shortcuts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardShortcut);
    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, [handleKeyboardShortcut]);

  // useEffect pentru autosave timer (30 secunde)
  useEffect(() => {
    // Pornește timer-ul autosave
    autosaveTimerRef.current = setInterval(() => {
      autosaveDraft();
    }, 30000); // 30 secunde

    return () => {
      if (autosaveTimerRef.current) {
        clearInterval(autosaveTimerRef.current);
      }
    };
  }, [autosaveDraft]);


  const calculateTotals = () => {
    let totalNet = 0;
    let totalVat = 0;
    let totalGross = 0;
    let totalLineDiscounts = 0;

    // Calculează totaluri FĂRĂ reduceri (reducerile sunt linii separate)
    lines.forEach(line => {
      const qty = parseFloat(line.quantity) || 0;
      const unitNetPrice = parseFloat(line.unitNetPrice) || 0;

      // Include doar liniile cu cantitate și preț valide
      if (qty > 0 && unitNetPrice > 0) {
        totalNet += parseFloat(calculateLineTotal(line, 'net')) || 0;
        totalVat += parseFloat(calculateLineTotal(line, 'vat')) || 0;
        totalGross += parseFloat(calculateLineTotal(line, 'gross')) || 0;

        // Adună reducerile pe linii
        const discountPercent = parseFloat(line.discountPercent) || 0;
        const discountAmount = parseFloat(line.discountAmount) || 0;
        const lineDiscountNet = (unitNetPrice * qty * discountPercent / 100 + discountAmount);
        const lineDiscountVat = lineDiscountNet * parseFloat(line.vatRate) / 100;
        totalLineDiscounts += lineDiscountNet + lineDiscountVat;
      }
    });

    // Scade reducerile pe linii
    const grossAfterLineDiscounts = totalGross - totalLineDiscounts;

    // Aplică reducerea pe total (după scăderea reducerilor pe linii)
    let totalDiscountAmount = 0;
    if (totalDiscount.type === 'percent') {
      const percent = parseFloat(totalDiscount.percent) || 0;
      totalDiscountAmount = (grossAfterLineDiscounts * percent / 100);
    } else if (totalDiscount.type === 'amount') {
      totalDiscountAmount = parseFloat(totalDiscount.amount) || 0;
    }

    const finalGross = Math.max(0, grossAfterLineDiscounts - totalDiscountAmount);

    // Calculează Net și VAT finale
    // Scade reducerile proporțional
    const totalDiscounts = totalLineDiscounts + totalDiscountAmount;
    const grossRatio = totalGross > 0 ? (totalGross - totalDiscounts) / totalGross : 0;
    const finalNet = totalNet * grossRatio;
    const finalVat = totalVat * grossRatio;

    return {
      net: finalNet.toFixed(2),
      vat: finalVat.toFixed(2),
      gross: finalGross.toFixed(2),
      originalGross: totalGross.toFixed(2),
      discountAmount: totalDiscountAmount.toFixed(2),
      discountType: totalDiscount.type,
      lineDiscounts: totalLineDiscounts.toFixed(2)
    };
  };

  const totals = calculateTotals();

  const exportToPDF = async () => {
    // Folosește funcția helper pentru a genera PDF-ul (pentru consecvență totală cu batch export)
    const { imgData, canvas } = await generateSingleInvoicePDF();

    // Creează PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 72 / 96;
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

    // Adaugă conturi bancare furnizor (poate fi mai multe)
    if (invoiceData.supplierBankAccounts && invoiceData.supplierBankAccounts.length > 0) {
      invoiceData.supplierBankAccounts.forEach((account, index) => {
        if (account.iban || account.bank) {
          const label = invoiceData.supplierBankAccounts.length > 1 ? `Cont bancar ${index + 1}` : 'Cont bancar';
          if (account.bank) excelData.push([`${label} - Banca`, account.bank]);
          if (account.iban) excelData.push([`${label} - IBAN`, account.iban]);
          if (account.currency) excelData.push([`${label} - Valută`, account.currency]);
        }
      });
    }
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

    // Adaugă conturi bancare client (poate fi mai multe)
    if (invoiceData.clientBankAccounts && invoiceData.clientBankAccounts.length > 0) {
      invoiceData.clientBankAccounts.forEach((account, index) => {
        if (account.iban || account.bank) {
          const label = invoiceData.clientBankAccounts.length > 1 ? `Cont bancar ${index + 1}` : 'Cont bancar';
          if (account.bank) excelData.push([`${label} - Banca`, account.bank]);
          if (account.iban) excelData.push([`${label} - IBAN`, account.iban]);
          if (account.currency) excelData.push([`${label} - Valută`, account.currency]);
        }
      });
    }
    excelData.push([]);

    // Linii produse - Header
    excelData.push(['PRODUSE ȘI SERVICII']);
    excelData.push(['Nr.', 'Denumire produs/serviciu', 'Cantitate', 'Preț net unitar', 'TVA %', 'Suma TVA', 'Preț brut unitar', 'Total net', 'Total TVA', 'Total brut']);

    // Linii produse - Date
    let lineNumber = 0;
    lines.forEach((line, index) => {
      const discountPercent = parseFloat(line.discountPercent) || 0;
      const discountAmount = parseFloat(line.discountAmount) || 0;
      const hasDiscount = discountPercent > 0 || discountAmount > 0;

      lineNumber++;
      excelData.push([
        lineNumber,
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

      // Adaugă linie de discount dacă există
      if (hasDiscount) {
        lineNumber++;
        const discountNet = (parseFloat(line.unitNetPrice) * parseFloat(line.quantity) * discountPercent / 100 + discountAmount);
        const discountVat = discountNet * parseFloat(line.vatRate) / 100;
        const discountGross = discountNet + discountVat;
        excelData.push([
          lineNumber,
          `Discount ${discountPercent > 0 ? discountPercent + '%' : ''} ${discountAmount > 0 ? discountAmount : ''} la ${line.product || 'produs'}`,
          '1,00',
          '-' + formatNumber(discountNet),
          line.vatRate + '%',
          '-' + formatNumber(discountVat),
          '-' + formatNumber(discountGross),
          '-' + formatNumber(discountNet),
          '-' + formatNumber(discountVat),
          '-' + formatNumber(discountGross)
        ]);
      }
    });

    // Linie discount factura (dacă există)
    if (totals.discountAmount && parseFloat(totals.discountAmount) > 0) {
      lineNumber++;
      const totalDiscountNet = parseFloat(totals.net) * (parseFloat(totalDiscount.percent) || 0) / 100;
      const totalDiscountVat = parseFloat(totals.vat) * (parseFloat(totalDiscount.percent) || 0) / 100;
      const totalDiscountGross = parseFloat(totals.discountAmount);
      excelData.push([
        lineNumber,
        `Discount factura de ${totalDiscount.type === 'percent' ? totalDiscount.percent + '%' : totalDiscount.amount}`,
        '1,00',
        '-' + formatNumber(totalDiscountNet),
        '', // TVA% gol pentru discount general
        '-' + formatNumber(totalDiscountVat),
        '-' + formatNumber(totalDiscountGross),
        '-' + formatNumber(totalDiscountNet),
        '-' + formatNumber(totalDiscountVat),
        '-' + formatNumber(totalDiscountGross)
      ]);
    }

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
      { wch: 40 },  // Produs/Serviciu (mai larg pentru "Discount X% la produs")
      { wch: 10 },  // Cantitate
      { wch: 14 },  // Preț net unitar
      { wch: 8 },   // TVA %
      { wch: 12 },  // Suma TVA
      { wch: 14 },  // Preț brut unitar
      { wch: 12 },  // Total net
      { wch: 12 },  // Total TVA
      { wch: 12 }   // Total brut
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

        let lineNumber = 0;
        lines.forEach((line, index) => {
          const discountPercent = parseFloat(line.discountPercent) || 0;
          const discountAmount = parseFloat(line.discountAmount) || 0;
          const hasDiscount = discountPercent > 0 || discountAmount > 0;

          lineNumber++;
          excelData.push([
            lineNumber,
            line.product || '-',
            line.quantity,
            formatNumber(line.unitNetPrice),
            line.vatRate,
            calculateLineTotal(line, 'net'),
            calculateLineTotal(line, 'vat'),
            calculateLineTotal(line, 'gross')
          ]);

          // Adaugă linie de discount dacă există
          if (hasDiscount) {
            lineNumber++;
            const discountNet = (parseFloat(line.unitNetPrice) * parseFloat(line.quantity) * discountPercent / 100 + discountAmount);
            const discountVat = discountNet * parseFloat(line.vatRate) / 100;
            const discountGross = discountNet + discountVat;
            excelData.push([
              lineNumber,
              `Discount ${discountPercent > 0 ? discountPercent + '%' : ''} ${discountAmount > 0 ? discountAmount : ''} la ${line.product || 'produs'}`,
              '1,00',
              '-' + formatNumber(discountNet),
              line.vatRate + '%',
              '-' + formatNumber(discountNet),
              '-' + formatNumber(discountVat),
              '-' + formatNumber(discountGross)
            ]);
          }
        });

        // Linie discount factura (dacă există)
        if (totals.discountAmount && parseFloat(totals.discountAmount) > 0) {
          lineNumber++;
          const totalDiscountNet = parseFloat(totals.net) * (parseFloat(totalDiscount.percent) || 0) / 100;
          const totalDiscountVat = parseFloat(totals.vat) * (parseFloat(totalDiscount.percent) || 0) / 100;
          const totalDiscountGross = parseFloat(totals.discountAmount);
          excelData.push([
            lineNumber,
            `Discount factura de ${totalDiscount.type === 'percent' ? totalDiscount.percent + '%' : totalDiscount.amount}`,
            '1,00',
            '-' + formatNumber(totalDiscountNet),
            '', // TVA% gol
            '-' + formatNumber(totalDiscountNet),
            '-' + formatNumber(totalDiscountVat),
            '-' + formatNumber(totalDiscountGross)
          ]);
        }

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

  // ===== Funcții Facturare Recurentă =====

  /**
   * Verifică dacă există facturi duplicate (aceeași serie + număr)
   */
  const checkDuplicateInvoice = useCallback((series, number) => {
    if (!series || !number) {
      setDuplicateWarning('');
      return;
    }

    const invoices = invoiceHistoryService.getAllInvoices();
    const duplicate = invoices.find(
      inv => inv.series === series && inv.number === number
    );

    if (duplicate) {
      setDuplicateWarning(
        `⚠️ Atenție! O factură cu seria "${series}" și numărul "${number}" există deja în istoric (emisă la ${duplicate.issueDate}).`
      );
    } else {
      setDuplicateWarning('');
    }
  }, []);

  /**
   * Verifică consistența datelor și afișează avertismente
   */
  const validateInvoiceData = useCallback(() => {
    const warnings = [];

    // Verifică date esențiale factură
    if (!invoiceData.series) warnings.push('Lipsește seria facturii');
    if (!invoiceData.number) warnings.push('Lipsește numărul facturii');
    if (!invoiceData.issueDate) warnings.push('Lipsește data emiterii');

    // Verifică furnizor
    if (!invoiceData.supplierName) warnings.push('Lipsește numele furnizorului');
    if (!invoiceData.supplierCUI) warnings.push('Lipsește CUI-ul furnizorului');
    if (!invoiceData.supplierAddress) warnings.push('Lipsește adresa furnizorului');
    if (!invoiceData.supplierBankAccounts[0]?.iban) warnings.push('Lipsește IBAN-ul furnizorului');

    // Verifică client
    if (!invoiceData.clientName) warnings.push('Lipsește numele beneficiarului');
    if (!invoiceData.clientCUI) warnings.push('Lipsește CUI-ul beneficiarului');
    if (!invoiceData.clientAddress) warnings.push('Lipsește adresa beneficiarului');

    // Verifică linii
    if (lines.length === 0) {
      warnings.push('Nu există nicio linie în factură');
    } else {
      const emptyLines = lines.filter(line => !line.product || parseFloat(line.unitNetPrice) === 0);
      if (emptyLines.length > 0) {
        warnings.push(`${emptyLines.length} linie/linii fără produs sau preț`);
      }
    }

    // Verifică total
    if (parseFloat(totals.gross) === 0) {
      warnings.push('Totalul facturii este 0');
    }

    setValidationWarnings(warnings);
    return warnings;
  }, [invoiceData, lines, totals]);

  /**
   * Salvează factura curentă ca șablon
   */
  const saveAsInvoiceSablon = () => {
    const sablonName = prompt('Introdu un nume pentru acest șablon de factură:');
    if (!sablonName) return;

    const sablon = {
      id: Date.now(),
      name: sablonName,
      series: invoiceData.series,
      currency: invoiceData.currency,
      notes: invoiceData.notes,
      lines: lines.map(line => ({
        product: line.product,
        quantity: line.quantity,
        purchasePrice: line.purchasePrice,
        markup: line.markup,
        unitNetPrice: line.unitNetPrice,
        vatRate: line.vatRate,
        unitGrossPrice: line.unitGrossPrice,
        discountPercent: line.discountPercent,
        discountAmount: line.discountAmount
      })),
      totalDiscount: totalDiscount,
      createdAt: new Date().toISOString()
    };

    // Salvează în localStorage
    const sabloane = JSON.parse(localStorage.getItem('normalro_invoice_sabloane') || '[]');
    sabloane.push(sablon);
    localStorage.setItem('normalro_invoice_sabloane', JSON.stringify(sabloane));

    // Salvează în Google Sheets dacă este conectat
    if (googleSheetsConnected) {
      saveInvoiceSablonToSheets(sablon);
    }

    alert(`✅ Șablon "${sablonName}" salvat cu succes!`);
  };

  /**
   * Încarcă un șablon de factură
   */
  const loadInvoiceSablon = (sablon) => {
    const confirmed = window.confirm(
      `Vrei să încarci șablonul "${sablon.name}"?\n\n` +
      `Atenție: Datele curente vor fi înlocuite cu cele din șablon!\n` +
      `(Date furnizor/client NU vor fi modificate)`
    );

    if (!confirmed) return;

    // Păstrează datele furnizor/client, dar înlocuiește restul
    setInvoiceData(prev => ({
      ...prev,
      series: sablon.series || prev.series,
      currency: sablon.currency || prev.currency,
      notes: sablon.notes || ''
    }));

    setLines(sablon.lines.map((line, index) => ({
      ...line,
      id: Date.now() + index
    })));

    setTotalDiscount(sablon.totalDiscount || { type: 'none', percent: '0.00', amount: '0.00' });

    alert(`✅ Șablon "${sablon.name}" încărcat cu succes!`);
    setInvoiceSablonDialogOpen(false);
  };

  /**
   * Șterge un șablon de factură
   */
  const deleteInvoiceSablon = (sablonId) => {
    const sabloane = JSON.parse(localStorage.getItem('normalro_invoice_sabloane') || '[]');
    const sablon = sabloane.find(t => t.id === sablonId);

    if (!sablon) return;

    const confirmed = window.confirm(
      `Ești sigur că vrei să ștergi șablonul "${sablon.name}"?\n\n` +
      `Această acțiune nu poate fi anulată.`
    );

    if (!confirmed) return;

    const updatedSabloane = sabloane.filter(t => t.id !== sablonId);
    localStorage.setItem('normalro_invoice_sabloane', JSON.stringify(updatedSabloane));

    alert(`✅ Șablon "${sablon.name}" șters cu succes!`);
  };

  /**
   * Salvează șablon factură în Google Sheets
   */
  const saveInvoiceSablonToSheets = async (sablon) => {
    if (!googleSheetsConnected) return;

    try {
      await googleSheetsService.requestAuthorization();
      // Implementare simplificată - poți extinde googleSheetsService cu o metodă dedicată
      console.log('📄 Șablon salvat în Google Sheets:', sablon.name);
    } catch (error) {
      console.error('Eroare salvare șablon în Sheets:', error);
    }
  };

  /**
   * Duplică factura curentă (incrementează automat numărul)
   */
  const duplicateCurrentInvoice = () => {
    const confirmed = window.confirm(
      `Vrei să dublezi factura curentă?\n\n` +
      `Se va crea o nouă factură cu:\n` +
      `• Același furnizor și beneficiar\n` +
      `• Aceleași produse și prețuri\n` +
      `• Număr incrementat automat\n` +
      `• Data curentă`
    );

    if (!confirmed) return;

    // Incrementează numărul facturii
    const newNumber = incrementInvoiceNumber(invoiceData.number);

    // Setează noile date
    setInvoiceData(prev => ({
      ...prev,
      number: newNumber,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      guid: '' // Resetează GUID pentru factură nouă
    }));

    // Păstrează liniile și discount-urile
    // (deja în state, nu e nevoie să facem nimic)

    // Verifică automat dacă există duplicate
    checkDuplicateInvoice(invoiceData.series, newNumber);

    alert(
      `✅ Factură dublată cu succes!\n\n` +
      `Noua factură: ${invoiceData.series} ${newNumber}\n` +
      `Data: ${new Date().toLocaleDateString('ro-RO')}\n\n` +
      `Verifică și modifică datele după necesitate.`
    );

    // Scroll la top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Obține sugestii de produse bazate pe istoric
   */
  const getProductSuggestions = useCallback((searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setProductSuggestions([]);
      return;
    }

    // Extrage produse unice din istoric facturi
    const invoices = invoiceHistoryService.getAllInvoices();
    const allProducts = invoices.flatMap(inv => inv.lines || []);

    // Creează un Map pentru produse unice (bazat pe nume)
    const uniqueProducts = new Map();
    allProducts.forEach(line => {
      if (line.product && line.product.toLowerCase().includes(searchTerm.toLowerCase())) {
        const key = line.product.toLowerCase();
        if (!uniqueProducts.has(key)) {
          uniqueProducts.set(key, {
            product: line.product,
            unitNetPrice: line.unitNetPrice || '0.00',
            vatRate: line.vatRate || DEFAULT_VAT_RATE,
            quantity: line.quantity || '1',
            count: 1
          });
        } else {
          // Incrementează numărul de apariții
          const existing = uniqueProducts.get(key);
          existing.count++;
        }
      }
    });

    // Sortează după frecvență (count) descrescător
    const suggestions = Array.from(uniqueProducts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Limitează la 5 sugestii

    setProductSuggestions(suggestions);
  }, [DEFAULT_VAT_RATE]);

  /**
   * Aplică sugestie produs pe o linie
   */
  const applySuggestionToLine = (lineId, suggestion) => {
    const vat = parseFloat(suggestion.vatRate) || 0;
    const net = parseFloat(suggestion.unitNetPrice) || 0;
    const gross = net * (1 + vat / 100);

    setLines(lines.map(line => {
      if (line.id === lineId) {
        return {
          ...line,
          product: suggestion.product,
          quantity: suggestion.quantity || '1',
          unitNetPrice: formatNumber(suggestion.unitNetPrice),
          vatRate: suggestion.vatRate,
          unitGrossPrice: formatNumber(gross)
        };
      }
      return line;
    }));

    // Ascunde sugestiile
    setShowProductSuggestions(prev => ({ ...prev, [lineId]: false }));
    setProductSuggestions([]);
  };

  // useEffect pentru verificare duplicate când se modifică seria/numărul
  useEffect(() => {
    checkDuplicateInvoice(invoiceData.series, invoiceData.number);
  }, [invoiceData.series, invoiceData.number, checkDuplicateInvoice]);

  // useEffect pentru validare date (rulează la modificări)
  useEffect(() => {
    // Debounce pentru a nu rula prea des
    const timer = setTimeout(() => {
      validateInvoiceData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [invoiceData, lines, validateInvoiceData]);

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

  // ===== Funcții Export Suplimentar =====

  /**
   * Print optimizat - deschide dialog print cu CSS print-friendly
   */
  const printInvoice = () => {
    // Generează HTML-ul facturii
    const invoiceHTML = generateInvoiceHTML();

    // Creează o fereastră nouă pentru print
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('❌ Fereastră blocată! Permite pop-up-uri pentru a printa factura.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Factură ${invoiceData.series || ''}${invoiceData.number || ''}</title>
        <style>
          /* Reset și stiluri de bază */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
          }

          /* Print-specific styles */
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            
            @page {
              size: A4;
              margin: 15mm;
            }

            /* Prevent page breaks inside important elements */
            table, tr, td, th {
              page-break-inside: avoid;
            }

            /* Hide elements that shouldn't print */
            .no-print {
              display: none !important;
            }

            /* Ensure colors print */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }

          /* Screen preview styles */
          @media screen {
            body {
              padding: 20px;
              background: #f5f5f5;
            }

            .print-container {
              max-width: 210mm;
              margin: 0 auto;
              background: white;
              padding: 15mm;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }

            .no-print {
              margin-top: 20px;
              text-align: center;
            }

            .no-print button {
              padding: 10px 20px;
              font-size: 14px;
              cursor: pointer;
              background: #1976d2;
              color: white;
              border: none;
              border-radius: 4px;
              margin: 0 5px;
            }

            .no-print button:hover {
              background: #1565c0;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${invoiceHTML}
        </div>
        <div class="no-print">
          <button onclick="window.print()">🖨️ Printează</button>
          <button onclick="window.close()">❌ Închide</button>
        </div>
        <script>
          // Auto-print când se încarcă pagina (opțional)
          // window.onload = () => window.print();
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  /**
   * Helper: Generează PDF pentru o factură (din invoiceData curent SAU din istoric)
   * Folosește EXACT aceeași logică ca exportToPDF() pentru consecvență
   */
  const generateSingleInvoicePDF = async (invoiceDataParam = null, linesParam = null) => {
    // Folosește parametrii dacă sunt furnizați, altfel folosește state-ul curent
    const invData = invoiceDataParam || invoiceData;
    const invLines = linesParam || lines;
    
    // Calculează totaluri pentru această factură
    let totals;
    if (invoiceDataParam) {
      // Pentru facturi din istoric, totalurile sunt deja calculate
      totals = invoiceDataParam.totals || { net: '0.00', vat: '0.00', gross: '0.00' };
    } else {
      // Pentru factura curentă, calculează totalurile
      totals = calculateTotals();
    }

    // Generează QR Code dacă există IBAN (EXACT ca în exportToPDF)
    let qrCodeImg = '';
    const supplierIBAN = invoiceDataParam 
      ? invoiceDataParam.supplier?.iban 
      : invData.supplierBankAccounts[0]?.iban;
    const supplierName = invoiceDataParam 
      ? invoiceDataParam.supplier?.name 
      : invData.supplierName;

    if (supplierIBAN && supplierName) {
      try {
        const qrDataUrl = await paymentService.generatePaymentQR({
          iban: supplierIBAN,
          amount: parseFloat(totals.gross),
          currency: invData.currency || 'RON',
          beneficiary: supplierName,
          reference: `Factura ${invData.series || ''}${invData.number || ''}`,
          bic: ''
        });
        qrCodeImg = `<img src="${qrDataUrl}" style="width: 150px; height: 150px; display: block; margin: 0 auto;" />`;
      } catch (error) {
        console.warn('Nu s-a putut genera QR Code:', error);
      }
    }

    // Generează HTML folosind EXACT aceeași funcție ca exportToPDF
    const invoiceElement = document.createElement('div');
    invoiceElement.style.position = 'absolute';
    invoiceElement.style.left = '-9999px';
    invoiceElement.style.width = '800px';
    invoiceElement.style.padding = '40px';
    invoiceElement.style.backgroundColor = 'white';
    invoiceElement.style.fontFamily = 'Arial, sans-serif';

    // Generează HTML-ul complet (folosind template-ul din exportToPDF)
    invoiceElement.innerHTML = generatePDFHTMLContent(invData, invLines, totals, qrCodeImg, invoiceDataParam);

    document.body.appendChild(invoiceElement);

    try {
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      return { imgData, canvas };
    } finally {
      document.body.removeChild(invoiceElement);
    }
  };

  /**
   * Helper: Generează HTML-ul complet pentru PDF (reutilizabil)
   * EXACT același template ca în exportToPDF (cu discount-uri și toate detaliile)
   */
  const generatePDFHTMLContent = (invData, invLines, totals, qrCodeImg, fromHistory = null) => {
    // Extrage datele în funcție de sursa (istoric sau state curent)
    const getSupplierData = (field) => {
      if (fromHistory) {
        return fromHistory.supplier?.[field] || '';
      }
      return invData[`supplier${field.charAt(0).toUpperCase() + field.slice(1)}`] || '';
    };

    const getClientData = (field) => {
      if (fromHistory) {
        return fromHistory.client?.[field] || '';
      }
      return invData[`client${field.charAt(0).toUpperCase() + field.slice(1)}`] || '';
    };

    const supplierBankAccounts = fromHistory 
      ? (fromHistory.supplier?.bankAccounts || [{ bank: '', iban: '', currency: 'RON' }])
      : (invData.supplierBankAccounts || [{ bank: '', iban: '', currency: 'RON' }]);

    const clientBankAccounts = fromHistory
      ? (fromHistory.client?.bankAccounts || [{ bank: '', iban: '', currency: 'RON' }])
      : (invData.clientBankAccounts || [{ bank: '', iban: '', currency: 'RON' }]);

    // Funcții helper pentru calcule (reutilizare logică)
    const calculateLineVatForLine = (line) => {
      const net = parseFloat(line.unitNetPrice);
      const vat = parseFloat(line.vatRate);
      if (!isNaN(net) && !isNaN(vat)) {
        const vatAmount = Math.round(net * vat * 10000) / 1000000;
        return vatAmount.toFixed(2);
      }
      return '0.00';
    };

    const calculateLineTotalForLine = (line, type) => {
      const qty = parseFloat(line.quantity) || 0;
      if (type === 'net') {
        const net = parseFloat(line.unitNetPrice) || 0;
        return (net * qty).toFixed(2);
      } else if (type === 'vat') {
        const vat = parseFloat(calculateLineVatForLine(line)) || 0;
        return (vat * qty).toFixed(2);
      } else if (type === 'gross') {
        const gross = parseFloat(line.unitGrossPrice) || 0;
        return (gross * qty).toFixed(2);
      }
      return '0.00';
    };

    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 10px; background: #ffffff;">
        <!-- Header modern cu gradient -->
        <div style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); padding: 25px; margin: -40px -40px 30px -40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600; text-align: center; letter-spacing: 1.5px;">FACTURĂ</h1>
          <div style="text-align: center; margin-top: 12px; color: rgba(255,255,255,0.95); font-size: 11px;">
            <div style="display: inline-block; background: rgba(255,255,255,0.15); padding: 6px 16px; border-radius: 15px; margin: 4px;">
              <strong>Serie:</strong> ${invData.series || '-'} &nbsp;|&nbsp; <strong>Nr:</strong> ${invData.number || '-'}
            </div>
            <div style="display: inline-block; background: rgba(255,255,255,0.15); padding: 6px 16px; border-radius: 15px; margin: 4px;">
              <strong>Data:</strong> ${invData.issueDate || '-'}${invData.dueDate ? ` &nbsp;|&nbsp; <strong>Scadență:</strong> ${invData.dueDate}` : ''}
            </div>
          </div>
        </div>
        
        <!-- Carduri Furnizor & Beneficiar -->
        <table style="width: 100%; margin-bottom: 20px; border-spacing: 12px 0;">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #1976d2; min-height: 140px;">
                <div style="color: #1976d2; font-weight: 700; font-size: 11px; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">📤 FURNIZOR</div>
                <div style="font-weight: 600; font-size: 12px; color: #212121; margin-bottom: 6px;">${getSupplierData('name')}</div>
                <div style="font-size: 9px; color: #666; line-height: 1.6;">
                  <div><strong>CUI:</strong> ${getSupplierData('cui')}</div>
                  ${getSupplierData('regCom') ? `<div><strong>Reg Com:</strong> ${getSupplierData('regCom')}</div>` : ''}
                  ${getSupplierData('address') ? `<div style="margin-top: 4px;">${getSupplierData('address')}</div>` : ''}
                  ${getSupplierData('city') ? `<div>${getSupplierData('city')}</div>` : ''}
                  ${getSupplierData('phone') ? `<div style="margin-top: 4px;"><strong>Tel:</strong> ${getSupplierData('phone')}</div>` : ''}
                  ${getSupplierData('email') ? `<div><strong>Email:</strong> ${getSupplierData('email')}</div>` : ''}
                  ${supplierBankAccounts && supplierBankAccounts.length > 0 ? `
                    ${supplierBankAccounts.map((account, idx) => {
                      if (!account.iban && !account.bank) return '';
                      const label = supplierBankAccounts.length > 1 ? `Cont ${idx + 1}` : 'Cont bancar';
                      return `
                        ${account.iban ? `<div style="margin-top: 4px;"><strong>${label} (${account.currency || 'RON'}):</strong> ${account.iban}</div>` : ''}
                        ${account.bank ? `<div><strong>Banca:</strong> ${account.bank}</div>` : ''}
                      `;
                    }).join('')}
                  ` : ''}
                </div>
              </div>
            </td>
            <td style="width: 50%; vertical-align: top;">
              <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #4caf50; min-height: 140px;">
                <div style="color: #4caf50; font-weight: 700; font-size: 11px; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">📥 BENEFICIAR</div>
                <div style="font-weight: 600; font-size: 12px; color: #212121; margin-bottom: 6px;">${getClientData('name')}</div>
                <div style="font-size: 9px; color: #666; line-height: 1.6;">
                  <div><strong>CUI:</strong> ${getClientData('cui')}</div>
                  ${getClientData('regCom') ? `<div><strong>Reg Com:</strong> ${getClientData('regCom')}</div>` : ''}
                  ${getClientData('address') ? `<div style="margin-top: 4px;">${getClientData('address')}</div>` : ''}
                  ${getClientData('city') ? `<div>${getClientData('city')}</div>` : ''}
                  ${getClientData('phone') ? `<div style="margin-top: 4px;"><strong>Tel:</strong> ${getClientData('phone')}</div>` : ''}
                  ${getClientData('email') ? `<div><strong>Email:</strong> ${getClientData('email')}</div>` : ''}
                  ${clientBankAccounts && clientBankAccounts.length > 0 ? `
                    ${clientBankAccounts.map((account, idx) => {
                      if (!account.iban && !account.bank) return '';
                      const label = clientBankAccounts.length > 1 ? `Cont ${idx + 1}` : 'Cont bancar';
                      return `
                        ${account.iban ? `<div style="margin-top: 4px;"><strong>${label} (${account.currency || 'RON'}):</strong> ${account.iban}</div>` : ''}
                        ${account.bank ? `<div><strong>Banca:</strong> ${account.bank}</div>` : ''}
                      `;
                    }).join('')}
                  ` : ''}
                </div>
              </div>
            </td>
          </tr>
        </table>
        
        <!-- Informație Monedă -->
        <div style="margin: 20px 0 8px 0; padding: 6px 12px; background: linear-gradient(to right, #fff3e0, #ffffff); border-left: 4px solid #ff9800; border-radius: 4px; display: inline-block;">
          <span style="color: #e65100; font-weight: 700; font-size: 9px; letter-spacing: 0.5px;">💰 Monedă: ${invData.currency || 'RON'}</span>
        </div>
        
        <!-- Tabel modern cu shadow -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-radius: 6px; overflow: hidden;">
          <thead>
            <tr style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white;">
              <th style="padding: 12px 8px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: none;">Nr.</th>
              <th style="padding: 12px 8px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; border: none;">Produs/Serviciu</th>
              <th style="padding: 12px 8px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: none;">Cant.</th>
              <th style="padding: 12px 8px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; border: none;">Preț Net</th>
              <th style="padding: 12px 8px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: none;">TVA%</th>
              <th style="padding: 12px 8px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; border: none;">Suma TVA</th>
              <th style="padding: 12px 8px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; border: none;">Preț Brut</th>
              <th style="padding: 12px 8px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; border: none;">Total Net</th>
              <th style="padding: 12px 8px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; border: none;">Total TVA</th>
              <th style="padding: 12px 8px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; border: none;">Total Brut</th>
            </tr>
          </thead>
          <tbody>
            ${invLines.map((line, index) => {
              const discountPercent = parseFloat(line.discountPercent) || 0;
              const discountAmount = parseFloat(line.discountAmount) || 0;
              const hasDiscount = discountPercent > 0 || discountAmount > 0;

              const qty = parseFloat(line.quantity) || 0;
              const unitNetPrice = parseFloat(line.unitNetPrice) || 0;
              const vatRate = parseFloat(line.vatRate) || 0;
              const unitVat = unitNetPrice * vatRate / 100;
              const unitGross = parseFloat(line.unitGrossPrice) || (unitNetPrice + unitVat);
              const totalNet = unitNetPrice * qty;
              const totalVat = unitVat * qty;
              const totalGross = unitGross * qty;

              let rows = `
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px 8px; text-align: center; font-size: 9px; color: #757575; border: none;">${index + 1}</td>
                <td style="padding: 10px 8px; font-size: 9px; color: #212121; border: none;">${line.product || '-'}</td>
                <td style="padding: 10px 8px; text-align: center; font-size: 9px; color: #212121; border: none;">${line.quantity || '1'}</td>
                <td style="padding: 10px 8px; text-align: right; font-size: 9px; color: #212121; border: none;">${unitNetPrice.toFixed(2)}</td>
                <td style="padding: 10px 8px; text-align: center; font-size: 9px; color: #1976d2; font-weight: 500; border: none;">${vatRate}%</td>
                <td style="padding: 10px 8px; text-align: right; font-size: 9px; color: #1976d2; font-weight: 500; border: none;">${unitVat.toFixed(2)}</td>
                <td style="padding: 10px 8px; text-align: right; font-size: 9px; color: #212121; border: none;">${unitGross.toFixed(2)}</td>
                <td style="padding: 10px 8px; text-align: right; font-size: 9px; color: #212121; font-weight: 500; border: none;">${totalNet.toFixed(2)}</td>
                <td style="padding: 10px 8px; text-align: right; font-size: 9px; color: #1976d2; font-weight: 500; border: none;">${totalVat.toFixed(2)}</td>
                <td style="padding: 10px 8px; text-align: right; font-size: 10px; color: #212121; font-weight: 600; border: none;">${totalGross.toFixed(2)}</td>
              </tr>`;

              // Adaugă linie de discount dacă există (EXACT ca în exportToPDF)
              if (hasDiscount) {
                const discountNet = (unitNetPrice * qty * discountPercent / 100 + discountAmount);
                const discountVat = discountNet * vatRate / 100;
                const discountGross = discountNet + discountVat;
                rows += `
              <tr style="background: linear-gradient(to right, #fff5f5, #ffffff); border-bottom: 1px solid #ffcdd2;">
                <td style="padding: 8px; text-align: center; border: none;"></td>
                <td style="padding: 8px; font-style: italic; font-size: 9px; color: #c62828; border: none;">🏷️ Discount ${discountPercent > 0 ? discountPercent + '%' : ''} ${discountAmount > 0 ? discountAmount : ''} la ${line.product || 'produs'}</td>
                <td style="padding: 8px; text-align: center; font-size: 8px; color: #757575; border: none;">1,00</td>
                <td style="padding: 8px; text-align: right; color: #c62828; font-weight: 600; font-size: 9px; border: none;">-${discountNet.toFixed(2)}</td>
                <td style="padding: 8px; text-align: center; font-size: 8px; color: #c62828; border: none;">${vatRate}%</td>
                <td style="padding: 8px; text-align: right; color: #c62828; font-weight: 600; font-size: 9px; border: none;">-${discountVat.toFixed(2)}</td>
                <td style="padding: 8px; text-align: right; color: #c62828; font-weight: 600; font-size: 9px; border: none;">-${discountGross.toFixed(2)}</td>
                <td style="padding: 8px; text-align: right; color: #c62828; font-weight: 600; font-size: 9px; border: none;">-${discountNet.toFixed(2)}</td>
                <td style="padding: 8px; text-align: right; color: #c62828; font-weight: 600; font-size: 9px; border: none;">-${discountVat.toFixed(2)}</td>
                <td style="padding: 8px; text-align: right; color: #c62828; font-weight: 700; font-size: 9px; border: none;">-${discountGross.toFixed(2)}</td>
              </tr>`;
              }

              return rows;
            }).join('')}
            ${totals.discountAmount && parseFloat(totals.discountAmount) > 0 ? (() => {
              const originalGross = parseFloat(totals.originalGross) || 0;
              const finalGross = parseFloat(totals.gross) || 0;
              const totalDiscountGross = originalGross - finalGross - parseFloat(totals.lineDiscounts || 0);
              const totalDiscountNet = totalDiscountGross / 1.19;
              const totalDiscountVat = totalDiscountGross - totalDiscountNet;
              return `
            <tr style="background: linear-gradient(to right, #ffe8e8, #ffffff); border-bottom: 2px solid #ef5350;">
              <td style="padding: 8px; text-align: center; border: none;"></td>
              <td style="padding: 8px; font-style: italic; font-weight: 700; font-size: 9px; color: #b71c1c; border: none;">🎁 Discount factura</td>
              <td style="padding: 8px; text-align: center; font-size: 8px; color: #757575; border: none;">1,00</td>
              <td style="padding: 8px; text-align: right; color: #b71c1c; font-weight: 700; font-size: 9px; border: none;">-${totalDiscountNet.toFixed(2)}</td>
              <td style="padding: 8px; text-align: center; border: none;"></td>
              <td style="padding: 8px; text-align: right; color: #b71c1c; font-weight: 700; font-size: 9px; border: none;">-${totalDiscountVat.toFixed(2)}</td>
              <td style="padding: 8px; text-align: right; color: #b71c1c; font-weight: 700; font-size: 9px; border: none;">-${totalDiscountGross.toFixed(2)}</td>
              <td style="padding: 8px; text-align: right; color: #b71c1c; font-weight: 700; font-size: 9px; border: none;">-${totalDiscountNet.toFixed(2)}</td>
              <td style="padding: 8px; text-align: right; color: #b71c1c; font-weight: 700; font-size: 9px; border: none;">-${totalDiscountVat.toFixed(2)}</td>
              <td style="padding: 8px; text-align: right; color: #b71c1c; font-weight: 800; font-size: 10px; border: none;">-${totalDiscountGross.toFixed(2)}</td>
            </tr>
            `;
            })() : ''}
          </tbody>
          <tfoot>
            <tr style="background: linear-gradient(135deg, #37474f 0%, #263238 100%); color: white;">
              <td colspan="7" style="padding: 14px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; border: none;">💰 TOTAL FACTURĂ</td>
              <td style="padding: 14px 8px; text-align: right; font-size: 11px; font-weight: 700; border: none;">${totals.net} ${invData.currency || 'RON'}</td>
              <td style="padding: 14px 8px; text-align: right; font-size: 11px; font-weight: 700; border: none;">${totals.vat} ${invData.currency || 'RON'}</td>
              <td style="padding: 14px 8px; text-align: right; font-size: 12px; font-weight: 800; background: rgba(76, 175, 80, 0.2); border: none;">${totals.gross} ${invData.currency || 'RON'}</td>
            </tr>
          </tfoot>
        </table>
        ${invData.notes ? `
        <div style="margin-top: 20px; padding: 16px; background: linear-gradient(to right, #e3f2fd, #ffffff); border-left: 4px solid #1976d2; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <div style="color: #1976d2; font-weight: 700; font-size: 10px; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">📝 NOTE</div>
          <div style="font-size: 9px; color: #424242; line-height: 1.6; white-space: pre-wrap;">${invData.notes}</div>
        </div>` : ''}
        
        ${qrCodeImg ? `
        <div style="margin-top: 25px; padding: 20px; background: linear-gradient(to bottom, #f1f8e9, #ffffff); border: 2px solid #4caf50; border-radius: 12px; text-align: center; box-shadow: 0 3px 10px rgba(76, 175, 80, 0.2);">
          <div style="color: #2e7d32; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">💳 PLATĂ RAPIDĂ CU COD QR</div>
          <div style="margin-top: 10px;">
            ${qrCodeImg}
          </div>
          <div style="margin-top: 12px; font-size: 9px; color: #558b2f; line-height: 1.5;">
            <strong>Scanează codul QR</strong> cu aplicația de banking<br/>
            pentru a plăti factura instant!
          </div>
        </div>` : ''}
      </div>
    `;
  };

  /**
   * Generează un singur PDF cu multiple facturi din istoric
   * Folosește EXACT aceeași logică ca exportToPDF() pentru fiecare factură
   */
  const generateMultipleInvoicesPDF = async (selectedInvoiceIds) => {
    if (!selectedInvoiceIds || selectedInvoiceIds.length === 0) {
      alert('❌ Nu ai selectat nicio factură!');
      return;
    }

    try {
      const invoices = invoiceHistoryService.getAllInvoices();
      const selectedInvoices = invoices.filter(inv => selectedInvoiceIds.includes(inv.id));

      if (selectedInvoices.length === 0) {
        alert('❌ Facturile selectate nu au fost găsite!');
        return;
      }

      // Confirmă acțiunea
      const confirmed = window.confirm(
        `Vrei să generezi un PDF cu ${selectedInvoices.length} facturi?\n\n` +
        `Facturi selectate:\n` +
        selectedInvoices.map(inv => `• ${inv.series} ${inv.number} - ${inv.issueDate}`).join('\n')
      );

      if (!confirmed) return;

      // Creează PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let isFirstPage = true;

      for (const invoice of selectedInvoices) {
        // Adaugă pagină nouă (exceptând prima)
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        // Generează PDF folosind EXACT aceeași logică ca exportToPDF
        const { imgData, canvas } = await generateSingleInvoicePDF(invoice, invoice.lines || []);

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 72 / 96;
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10;

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      }

      // Salvează PDF
      const firstInvoice = selectedInvoices[0];
      const lastInvoice = selectedInvoices[selectedInvoices.length - 1];
      const filename = `facturi_batch_${firstInvoice.series}_${firstInvoice.number}_to_${lastInvoice.series}_${lastInvoice.number}.pdf`;
      
      pdf.save(filename);

      alert(
        `✅ PDF generat cu succes!\n\n` +
        `📄 Fișier: ${filename}\n` +
        `📊 Facturi incluse: ${selectedInvoices.length}\n\n` +
        `PDF-ul conține toate facturile selectate într-un singur document.`
      );

    } catch (error) {
      console.error('Eroare generare PDF multiplu:', error);
      alert(`❌ Eroare la generarea PDF-ului:\n\n${error.message}`);
    }
  };

  /**
   * Descarcă multiple facturi ca arhivă ZIP
   * Folosește EXACT aceeași logică ca exportToPDF/exportToExcel pentru fiecare factură
   */
  const downloadMultipleInvoicesZIP = async (selectedInvoiceIds, format = 'pdf') => {
    if (!selectedInvoiceIds || selectedInvoiceIds.length === 0) {
      alert('❌ Nu ai selectat nicio factură!');
      return;
    }

    try {
      const invoices = invoiceHistoryService.getAllInvoices();
      const selectedInvoices = invoices.filter(inv => selectedInvoiceIds.includes(inv.id));

      if (selectedInvoices.length === 0) {
        alert('❌ Facturile selectate nu au fost găsite!');
        return;
      }

      // Confirmă acțiunea
      const confirmed = window.confirm(
        `Vrei să descarci ${selectedInvoices.length} facturi ca ${format.toUpperCase()} într-o arhivă ZIP?\n\n` +
        `Facturi selectate:\n` +
        selectedInvoices.map(inv => `• ${inv.series} ${inv.number} - ${inv.issueDate}`).join('\n')
      );

      if (!confirmed) return;

      // Creează arhiva ZIP
      const zip = new JSZip();

      // Generează fișiere pentru fiecare factură
      for (const invoice of selectedInvoices) {
        const filename = `factura_${invoice.series || 'FAC'}_${invoice.number || '001'}_${invoice.issueDate}`;

        if (format === 'pdf') {
          // Generează PDF folosind EXACT aceeași logică ca exportToPDF
          const { imgData, canvas } = await generateSingleInvoicePDF(invoice, invoice.lines || []);

          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;

          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 72 / 96;
          const imgX = (pdfWidth - imgWidth * ratio) / 2;
          const imgY = 10;

          pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

          // Adaugă PDF-ul în ZIP
          const pdfBlob = pdf.output('blob');
          zip.file(`${filename}.pdf`, pdfBlob);
        } else if (format === 'excel') {
          // Generează Excel
          const excelData = [];
          const totals = invoice.totals || { net: '0.00', vat: '0.00', gross: '0.00' };
          const lines = invoice.lines || [];

          excelData.push(['FACTURĂ']);
          excelData.push([]);
          excelData.push(['Serie', invoice.series || '-', '', 'Număr', invoice.number || '-']);
          excelData.push(['Data emitere', invoice.issueDate || '-', '', 'Data scadență', invoice.dueDate || '-']);
          excelData.push([]);
          excelData.push(['FURNIZOR']);
          excelData.push(['Nume', invoice.supplier?.name || '-']);
          excelData.push(['CUI', invoice.supplier?.cui || '-']);
          excelData.push([]);
          excelData.push(['BENEFICIAR']);
          excelData.push(['Nume', invoice.client?.name || '-']);
          excelData.push(['CUI', invoice.client?.cui || '-']);
          excelData.push([]);
          excelData.push(['PRODUSE ȘI SERVICII']);
          excelData.push(['Nr.', 'Denumire produs/serviciu', 'Cantitate', 'Preț net unitar', 'TVA %', 'Total net', 'Total TVA', 'Total brut']);

          lines.forEach((line, index) => {
            const lineNet = (parseFloat(line.unitNetPrice) || 0) * (parseFloat(line.quantity) || 1);
            const lineVat = lineNet * (parseFloat(line.vatRate) || 0) / 100;
            const lineGross = lineNet + lineVat;

            excelData.push([
              index + 1,
              line.product || '-',
              line.quantity || '1',
              line.unitNetPrice || '0.00',
              line.vatRate || '0',
              lineNet.toFixed(2),
              lineVat.toFixed(2),
              lineGross.toFixed(2)
            ]);
          });

          excelData.push([]);
          excelData.push(['', 'TOTAL FACTURĂ', '', '', '', totals.net, totals.vat, totals.gross]);

          const worksheet = XLSX.utils.aoa_to_sheet(excelData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Factură');

          const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          zip.file(`${filename}.xlsx`, excelBuffer);
        }
      }

      // Generează și descarcă ZIP-ul
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facturi_${format}_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(
        `✅ Arhivă ZIP generată cu succes!\n\n` +
        `📦 Fișier: facturi_${format}_${new Date().toISOString().split('T')[0]}.zip\n` +
        `📊 Facturi incluse: ${selectedInvoices.length}\n` +
        `📄 Format: ${format.toUpperCase()}\n\n` +
        `Arhiva conține fișiere separate pentru fiecare factură.`
      );

    } catch (error) {
      console.error('Eroare generare ZIP:', error);
      alert(`❌ Eroare la generarea arhivei ZIP:\n\n${error.message}`);
    }
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

      {/* Avertisment factură duplicată */}
      {duplicateWarning && (
        <Alert severity="warning" onClose={() => setDuplicateWarning('')} sx={{ mb: 3 }}>
          {duplicateWarning}
        </Alert>
      )}

      {/* Avertismente validare date */}
      {validationWarnings.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
            📋 Verificare completitudine date:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            💡 Completează datele lipsă pentru a genera o factură validă conform reglementărilor.
          </Typography>
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
        {/* Butoane Facturare Recurentă și Acțiuni */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              sx={{
                p: 1.5,
                bgcolor: 'primary.50',
                border: '1px solid',
                borderColor: 'primary.200',
                borderRadius: 2
              }}
            >
              <Typography variant="caption" fontWeight="600" display="block" color="primary.main" sx={{ mb: 1 }}>
                🔄 Facturare Recurentă
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  variant="outlined"
                  color="info"
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={duplicateCurrentInvoice}
                >
                  Duplică
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  startIcon={<SaveIcon />}
                  onClick={saveAsInvoiceSablon}
                >
                  Salvează
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={<DescriptionIcon />}
                  onClick={() => setInvoiceSablonDialogOpen(true)}
                >
                  Șabloane
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 1.5,
                bgcolor: 'error.50',
                border: '1px solid',
                borderColor: 'error.200',
                borderRadius: 2
              }}
            >
              <Typography variant="caption" fontWeight="600" display="block" color="error.main" sx={{ mb: 1 }}>
                🗑️ Acțiuni Date
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  variant="outlined"
                  color="info"
                  size="small"
                  startIcon={<HistoryIcon />}
                  onClick={() => setShowVersionsDialog(true)}
                  disabled={!invoiceData.series || !invoiceData.number}
                >
                  Versiuni ({invoiceVersions.length})
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={resetInvoiceForm}
                >
                  Reset
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={clearAllData}
                >
                  Clear All
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

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
            <Stack spacing={1.5}>
              {/* Butoane alegere/salvare furnizor */}
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<StarIcon />}
                  onClick={() => setSupplierTemplateDialogOpen(true)}
                >
                  Furnizori ({savedSuppliers.length})
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  startIcon={<BookmarkAddIcon />}
                  onClick={saveCurrentSupplier}
                  disabled={!invoiceData.supplierName || !invoiceData.supplierCUI}
                >
                  Salvează
                </Button>
              </Stack>
              
              <CompanyForm
                data={invoiceData}
                onChange={handleInvoiceChange}
                onSearch={searchSupplierANAF}
                loading={loadingSupplier}
                type="supplier"
                bgColor="#f8fafb"
                showBankDetails={true}
                onAddBankAccount={handleAddSupplierBankAccount}
                onRemoveBankAccount={handleRemoveSupplierBankAccount}
                onBankAccountChange={handleSupplierBankAccountChange}
              />
            </Stack>
          </Grid>

          {/* Beneficiar */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CompanyForm
              data={invoiceData}
              onChange={handleInvoiceChange}
              onSearch={searchClientANAF}
              loading={loadingClient}
              type="client"
              bgColor="#fdfcfd"
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Linii factură
              </Typography>
              
              {/* Toolbar sortare și grupare */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Sortare:
                </Typography>
                <Button
                  size="small"
                  variant={sortBy === 'manual' ? 'contained' : 'outlined'}
                  onClick={() => sortLines('manual')}
                  sx={{ minWidth: 80 }}
                >
                  Manual
                </Button>
                <Button
                  size="small"
                  variant={sortBy === 'name' ? 'contained' : 'outlined'}
                  onClick={() => sortLines('name')}
                  sx={{ minWidth: 80 }}
                >
                  Nume
                </Button>
                <Button
                  size="small"
                  variant={sortBy === 'price' ? 'contained' : 'outlined'}
                  onClick={() => sortLines('price')}
                  sx={{ minWidth: 80 }}
                >
                  Preț
                </Button>
                <Button
                  size="small"
                  variant={sortBy === 'total' ? 'contained' : 'outlined'}
                  onClick={() => sortLines('total')}
                  sx={{ minWidth: 80 }}
                >
                  Total
                </Button>
                
                {sortBy !== 'manual' && (
                  <IconButton size="small" onClick={toggleSortOrder} title={sortOrder === 'asc' ? 'Crescător' : 'Descrescător'}>
                    {sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                  </IconButton>
                )}

                <Divider orientation="vertical" flexItem />

                <FormControlLabel
                  control={
                    <Switch
                      checked={groupByCategory}
                      onChange={(e) => setGroupByCategory(e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography variant="caption">Grupare</Typography>}
                />
              </Stack>
            </Stack>

            {lines.map((line, index) => (
              <Box
                key={line.id}
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DragIndicatorIcon
                      sx={{ cursor: 'grab', color: 'text.secondary' }}
                      fontSize="small"
                    />
                    <Typography variant="subtitle2" fontWeight="600">
                      Linia {index + 1}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={0.5}>
                    {/* Buton Duplicate */}
                    <Tooltip title="Duplică linia">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => duplicateLine(line.id)}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {/* Buton Discount/Reducere */}
                    <Tooltip title={visibleDiscounts.has(line.id) ? "Ascunde reduceri" : "Afișează reduceri"}>
                      <IconButton
                        size="small"
                        color={visibleDiscounts.has(line.id) ? "warning" : "default"}
                        onClick={() => toggleDiscountVisibility(line.id)}
                        sx={{
                          bgcolor: visibleDiscounts.has(line.id) ? 'warning.light' : 'transparent',
                          '&:hover': {
                            bgcolor: visibleDiscounts.has(line.id) ? 'warning.main' : 'action.hover'
                          }
                        }}
                      >
                        <LocalOfferIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {/* Buton Move Up */}
                    {index > 0 && (
                      <Tooltip title="Mută sus">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => moveLineUp(line.id)}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Buton Move Down */}
                    {index < lines.length - 1 && (
                      <Tooltip title="Mută jos">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => moveLineDown(line.id)}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Buton Delete */}
                    {lines.length > 1 && (
                      <Tooltip title="Șterge linia">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deleteLine(line.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Box>

                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, md: 4.5 }}>
                    <Box sx={{ position: 'relative' }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Produs / Serviciu"
                        value={line.product}
                        onChange={(e) => {
                          updateLine(line.id, 'product', e.target.value);
                          getProductSuggestions(e.target.value);
                          setShowProductSuggestions(prev => ({ ...prev, [line.id]: true }));
                        }}
                        onFocus={() => {
                          if (line.product && line.product.length >= 2) {
                            getProductSuggestions(line.product);
                            setShowProductSuggestions(prev => ({ ...prev, [line.id]: true }));
                          }
                        }}
                        onBlur={() => {
                          // Delay pentru a permite click pe sugestii
                          setTimeout(() => {
                            setShowProductSuggestions(prev => ({ ...prev, [line.id]: false }));
                          }, 200);
                        }}
                        InputProps={{
                          endAdornment: line.product && line.product.length >= 2 && (
                            <InputAdornment position="end">
                              <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                          )
                        }}
                      />
                      {/* Sugestii produse */}
                      {showProductSuggestions[line.id] && productSuggestions.length > 0 && (
                        <Paper
                          sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            maxHeight: 200,
                            overflow: 'auto',
                            mt: 0.5,
                            boxShadow: 3
                          }}
                        >
                          <Stack divider={<Divider />}>
                            {productSuggestions.map((suggestion, idx) => (
                              <Box
                                key={idx}
                                onClick={() => applySuggestionToLine(line.id, suggestion)}
                                sx={{
                                  p: 1.5,
                                  cursor: 'pointer',
                                  '&:hover': {
                                    bgcolor: 'action.hover'
                                  }
                                }}
                              >
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight="500">
                                      {suggestion.product}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Preț: {suggestion.unitNetPrice} | TVA: {suggestion.vatRate}% | Folosit: {suggestion.count}x
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label="Aplică"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                </Stack>
                              </Box>
                            ))}
                          </Stack>
                        </Paper>
                      )}
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4, md: 1.2 }}>
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
                  <Grid size={{ xs: 12, sm: 6, md: 1.3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Preț intrare"
                      type="number"
                      value={line.purchasePrice}
                      onChange={(e) => updateLine(line.id, 'purchasePrice', e.target.value)}
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'info.50'
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Adaos %"
                      type="number"
                      value={line.markup}
                      onChange={(e) => updateLine(line.id, 'markup', e.target.value)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        inputProps: { min: 0, max: 1000, step: 0.01 }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'info.50'
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4, md: 1.3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Preț unitar"
                      type="number"
                      value={line.unitNetPrice}
                      onChange={(e) => updateLine(line.id, 'unitNetPrice', e.target.value)}
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 }
                      }}
                      helperText={
                        parseFloat(line.purchasePrice) > 0 && parseFloat(line.markup) > 0
                          ? `Auto: ${line.purchasePrice} + ${line.markup}%`
                          : ''
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4, md: 0.8 }}>
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
                  <Grid size={{ xs: 12, md: 1.8 }}>
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
                        inputProps: { min: 0, step: 0.01 }
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

                  {/* Reducere pe linie - afișate doar dacă butonul de discount este activat */}
                  {visibleDiscounts.has(line.id) && (
                    <>
                      {/* Afișare reducere calculată (read-only) */}

                      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Reducere %"
                          type="number"
                          value={line.discountPercent}
                          onChange={(e) => updateLine(line.id, 'discountPercent', e.target.value)}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            inputProps: { min: 0, max: 100, step: 0.01 }
                          }}
                          helperText="Reducere procentuală pe linie"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'warning.50',
                              fontSize: '0.8rem' // sau '14px'
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.8rem' // fontul pentru label
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '0.75rem' // fontul pentru helperText
                            }
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Reducere sumă fixă"
                          type="number"
                          value={line.discountAmount}
                          onChange={(e) => updateLine(line.id, 'discountAmount', e.target.value)}
                          InputProps={{
                            inputProps: { min: 0, step: 0.01 }
                          }}
                          helperText="Reducere sumă fixă pe linie"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'warning.50',
                              fontSize: '0.8rem' // sau '14px'
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.8rem' // fontul pentru label
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '0.75rem' // fontul pentru helperText
                            }
                          }}

                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Reducere calculată"
                          value={(() => {
                            const discountPercent = parseFloat(line.discountPercent) || 0;
                            const discountAmount = parseFloat(line.discountAmount) || 0;
                            const hasDiscount = discountPercent > 0 || discountAmount > 0;
                            if (!hasDiscount) return '-';
                            const discount = parseFloat(calculateLineDiscount(line));
                            return `-${discount.toFixed(2)}`;
                          })()}
                          InputProps={{
                            readOnly: true
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'warning.50',
                              fontSize: '0.8rem' // sau '14px'
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.8rem' // fontul pentru label
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '0.75rem' // fontul pentru helperText
                            }
                          }}

                          helperText={(() => {
                            const discountPercent = parseFloat(line.discountPercent) || 0;
                            const discountAmount = parseFloat(line.discountAmount) || 0;
                            if (discountPercent > 0 && discountAmount > 0) return `${discountPercent}% + ${discountAmount}`;
                            if (discountPercent > 0) return `${discountPercent}%`;
                            if (discountAmount > 0) return `${discountAmount}`;
                            return 'Total reducere pe linie';
                          })()}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            ))}

            <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap">
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
              <Button
                variant="outlined"
                color="info"
                size="small"
                startIcon={<LocalOfferIcon />}
                onClick={() => setProductCategoriesDialogOpen(true)}
              >
                Categorii
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

          {/* Reducere pe Total */}
          <Card sx={{ bgcolor: 'warning.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reducere pe Total
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tip reducere</InputLabel>
                    <Select
                      value={totalDiscount.type}
                      onChange={(e) => setTotalDiscount({ ...totalDiscount, type: e.target.value })}
                      label="Tip reducere"
                    >
                      <MenuItem value="none">Fără reducere</MenuItem>
                      <MenuItem value="percent">Procent</MenuItem>
                      <MenuItem value="amount">Sumă fixă</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {totalDiscount.type === 'percent' && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Procent reducere"
                      type="number"
                      value={totalDiscount.percent}
                      onChange={(e) => setTotalDiscount({ ...totalDiscount, percent: e.target.value })}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        inputProps: { min: 0, max: 100, step: 0.01 }
                      }}
                    />
                  </Grid>
                )}
                {totalDiscount.type === 'amount' && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Sumă reducere"
                      type="number"
                      value={totalDiscount.amount}
                      onChange={(e) => setTotalDiscount({ ...totalDiscount, amount: e.target.value })}
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 }
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Factură
              </Typography>
              <Stack spacing={1}>
                {totals.originalGross && parseFloat(totals.originalGross) > parseFloat(totals.gross) && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Total brut inițial:</Typography>
                      <Typography fontWeight="500" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                        {totals.originalGross} {invoiceData.currency}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="error.main">
                        {totalDiscount.type === 'percent' ? `${totalDiscount.percent}%` : 'Reducere'}: -{totals.discountAmount}
                      </Typography>
                      <Typography fontWeight="700" color="error.main">
                        -{totals.discountAmount} {invoiceData.currency}
                      </Typography>
                    </Box>
                    <Divider />
                  </>
                )}
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
                  <Typography variant="h6">Total brut final:</Typography>
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
              <Stack spacing={1}>
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
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => showPreview('pdf')}
                  startIcon={<VisibilityIcon />}
                  sx={{ fontSize: '0.7rem' }}
                >
                  Preview
                </Button>
              </Stack>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Stack spacing={1}>
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
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  onClick={() => showPreview('excel')}
                  startIcon={<VisibilityIcon />}
                  sx={{ fontSize: '0.7rem' }}
                >
                  Preview
                </Button>
              </Stack>
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

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={printInvoice}
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
                <PrintIcon sx={{ fontSize: 40, mb: 0.5 }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1.2, fontWeight: 600 }}>
                  Print
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
            💡 <strong>Sfat:</strong> Completează toate detaliile și apasă pe unul din butoanele de descărcare pentru a generate factura.
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
            🖨️ <strong>Print optimizat:</strong> Butonul "Print" deschide factura într-o fereastră nouă optimizată pentru printare (CSS print-friendly). Perfect pentru imprimare directă fără a salva PDF.
            <br />
            ☁️ <strong>Google Drive:</strong> Salvează rapid fișierele (PDF/Excel) în Google Drive - descarcă automat și deschide Drive pentru upload.
            <br />
            📊 <strong>Google Sheets:</strong> Conectează-te la Google Sheets pentru sincronizare automată în cloud! Datele furnizorului, șabloanele produse/clienți și istoricul facturilor sunt salvate automat în spreadsheet la fiecare export. Poți crea un spreadsheet nou sau conecta unul existent.
            <br />
            📚 <strong>Istoric:</strong> Toate facturile exportate sunt salvate automat în browser (localStorage) și opțional în Google Sheets. Click pe "Istoric Facturi" pentru a vedea, căuta și încărca facturi anterioare. Din istoric poți exporta și batch-uri multiple de facturi!
            <br />
            📦 <strong>Export Batch:</strong> Din dialogul "Istoric Facturi", selectează multiple facturi și:
            <br />
            &nbsp;&nbsp;• <strong>PDF Batch:</strong> Generează un singur fișier PDF cu toate facturile selectate (fiecare factură pe o pagină separată)
            <br />
            &nbsp;&nbsp;• <strong>ZIP PDF/Excel:</strong> Descarcă o arhivă ZIP cu fișiere separate pentru fiecare factură (format PDF sau Excel la alegere)
            <br />
            &nbsp;&nbsp;• Ideal pentru arhivare, backup sau trimitere multiplă către clienți
            <br />
            ⭐ <strong>Șabloane:</strong> Salvează produse și clienți frecvenți pentru completare rapidă. Click pe "Produse" pentru șabloane produse sau "Beneficiari" pentru clienți salvați. Șabloanele sunt sincronizate automat cu Google Sheets dacă ești conectat.
            <br />
            🏢 <strong>Export SAGA:</strong> Din "Istoric Facturi" poți exporta facturi în formatul XML compatibil cu software-ul contabil SAGA. Filtrează facturile după interval de date sau serie/număr, apoi generează XML-ul pentru import în SAGA.
            <br />
            💰 <strong>Reduceri/Discount:</strong> Poți acorda reduceri atât pe linia de produs (procentual sau sumă fixă), cât și pe totalul facturii. Reducerile se aplică automat la calculul final și sunt afișate clar în factură.
            <br />
            📈 <strong>Calcul automat preț:</strong> Introdu "Preț intrare" (cost achiziție) și "Adaos %" (marjă profit) pentru a calcula automat prețul net de vânzare. Util pentru gestionarea marjei de profit pe fiecare produs.
            <br />
            🔄 <strong>FACTURARE RECURENTĂ:</strong> (Butoane în partea dreaptă sus)
            <br />
            &nbsp;&nbsp;• <strong>Duplică factură:</strong> Creează rapid o factură nouă bazată pe cea curentă, cu număr incrementat automat și data curentă
            <br />
            &nbsp;&nbsp;• <strong>Șabloane facturi:</strong> Salvează facturi complete (cu produse și setări) pentru refolosire. Ideal pentru facturi recurente lunare
            <br />
            &nbsp;&nbsp;• <strong>Verificare dubluri:</strong> Sistem automat de alertare când seria+numărul există deja în istoric (previne duplicatele)
            <br />
            &nbsp;&nbsp;• <strong>Autocomplete produse:</strong> Scrie 2+ caractere în câmpul produs și primești sugestii din istoric (cu preț și TVA), sortate după frecvență
            <br />
            &nbsp;&nbsp;• <strong>Validare date:</strong> Alertări automate pentru date lipsă importante (furnizor, client, IBAN, produse fără preț, etc.)
            <br />
            📁 <strong>CATEGORII PRODUSE:</strong>
            <br />
            &nbsp;&nbsp;• <strong>Organizare:</strong> Creează categorii pentru diferite tipuri de produse/servicii (ex: IT, Consultanță, Marketing)
            <br />
            &nbsp;&nbsp;• <strong>Personalizare:</strong> Fiecare categorie are nume, culoare și icon personalizabil
            <br />
            &nbsp;&nbsp;• <strong>Filtrare:</strong> Filtrează rapid produsele din șabloane după categorie
            <br />
            &nbsp;&nbsp;• <strong>Categorii implicite:</strong> La prima utilizare sunt create automat categorii (Servicii, Produse, Consultanță)
            <br />
            &nbsp;&nbsp;• <strong>Gestionare:</strong> Butonul "Categorii" din secțiunea linii factură pentru CRUD categorii
            <br />
            👤 <strong>FIȘA CLIENT:</strong>
            <br />
            &nbsp;&nbsp;• <strong>Istoric complet:</strong> Vezi toate facturile emise către un client specific
            <br />
            &nbsp;&nbsp;• <strong>Statistici:</strong> Total facturat, număr facturi, medie per factură, facturi scadente
            <br />
            &nbsp;&nbsp;• <strong>Acces rapid:</strong> Din dialogul "Beneficiari", click pe iconița 👁️ pentru fișa client
            <br />
            &nbsp;&nbsp;• <strong>Reîncărcare rapidă:</strong> Click pe factură din fișă pentru a o încărca în formular
            <br />
            &nbsp;&nbsp;• <strong>Monitorizare scadențe:</strong> Evidențiere automată pentru facturi scadente
            <br />
            🔧 <strong>SORTARE ȘI GRUPARE LINII:</strong>
            <br />
            &nbsp;&nbsp;• <strong>Sortare:</strong> Sortează liniile după nume, preț unitar sau total (crescător/descrescător)
            <br />
            &nbsp;&nbsp;• <strong>Grupare categorii:</strong> Activează switch-ul "Grupare" pentru a organiza produsele pe categorii în factură
            <br />
            &nbsp;&nbsp;• <strong>Ordine manuală:</strong> Folosește săgețile ↑↓ pentru reordonare manuală
            <br />
            🗑️ <strong>RESET ȘI CLEAR:</strong>
            <br />
            &nbsp;&nbsp;• <strong>Reset:</strong> Șterge beneficiar, linii și atașamente (păstrează furnizorul și incrementează numărul)
            <br />
            &nbsp;&nbsp;• <strong>Clear All:</strong> Ștergere COMPLETĂ - toate datele, inclusiv furnizor, istoric, șabloane (IREVERSIBIL!)
            <br />
            &nbsp;&nbsp;• <strong>Confirmare dublă:</strong> Pentru "Clear All" se cere confirmare de 2 ori pentru siguranță
            <br />
            📚 <strong>VERSIONING:</strong>
            <br />
            &nbsp;&nbsp;• <strong>Salvare automată:</strong> Ultimele 5 versiuni ale fiecărei facturi sunt salvate automat la 10 secunde
            <br />
            &nbsp;&nbsp;• <strong>Restaurare:</strong> Revino la orice versiune anterioară cu un click
            <br />
            &nbsp;&nbsp;• <strong>Istoricul modificărilor:</strong> Vezi când s-au făcut modificările și ce conțineau
            <br />
            &nbsp;&nbsp;• <strong>Buton Versiuni:</strong> Afișează numărul de versiuni salvate pentru factura curentă
            <br />
            🏢 <strong>FURNIZORI (SOCIETĂȚI PROPRII):</strong>
            <br />
            &nbsp;&nbsp;• <strong>Multi-societate:</strong> Salvează și comută rapid între mai multe societăți proprii
            <br />
            &nbsp;&nbsp;• <strong>Date complete:</strong> Fiecare furnizor salvat păstrează toate datele (CUI, IBAN, adresă, etc.)
            <br />
            &nbsp;&nbsp;• <strong>Selecție rapidă:</strong> Click pe furnizor pentru completare automată în formular
            <br />
            &nbsp;&nbsp;• <strong>Butoane:</strong> "Furnizori" pentru selecție, "Salvează" pentru adăugare furnizor nou
            <br />
            &nbsp;&nbsp;• <strong>Util pentru:</strong> Freelanceri cu PFA + SRL, sau persoane cu multiple firme
          </Typography>
        </Paper>

        {/* Dialog Istoric Facturi */}
        <InvoiceHistoryDialog
          open={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
          onLoadInvoice={loadInvoiceFromHistory}
          type="invoice"
          onBatchPDF={generateMultipleInvoicesPDF}
          onBatchZIP={downloadMultipleInvoicesZIP}
        />

        {/* Dialog Șabloane Produse */}
        <ProductTemplateDialog
          open={productTemplateDialogOpen}
          onClose={() => setProductTemplateDialogOpen(false)}
          onSelectProduct={selectProductFromTemplate}
          categories={productCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Dialog Șabloane Clienți */}
        <ClientTemplateDialog
          open={clientTemplateDialogOpen}
          onClose={() => setClientTemplateDialogOpen(false)}
          onSelectClient={selectClientFromTemplate}
          onOpenProfile={openClientProfile}
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

        {/* Dialog Preview PDF/Excel */}
        <Dialog
          open={previewDialog.open}
          onClose={() => setPreviewDialog({ open: false, type: null, content: null })}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {previewDialog.type === 'pdf' ? <PictureAsPdfIcon color="error" /> : <DescriptionIcon color="success" />}
                <Typography variant="h6">
                  Preview {previewDialog.type === 'pdf' ? 'PDF' : 'Excel'}
                </Typography>
              </Box>
              <IconButton onClick={() => setPreviewDialog({ open: false, type: null, content: null })} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {previewDialog.content === 'loading' ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
              </Box>
            ) : previewDialog.type === 'pdf' && previewDialog.content ? (
              <Box
                dangerouslySetInnerHTML={{ __html: previewDialog.content }}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  maxHeight: 600,
                  overflow: 'auto'
                }}
              />
            ) : previewDialog.type === 'excel' && previewDialog.content ? (
              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {previewDialog.content.header.map((col, idx) => (
                        <TableCell key={idx} sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewDialog.content.rows.map((row, rowIdx) => (
                      <TableRow key={rowIdx}>
                        {row.map((cell, cellIdx) => (
                          <TableCell key={cellIdx}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell colSpan={5} sx={{ fontWeight: 'bold' }}>TOTAL</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{previewDialog.content.totals.net}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{previewDialog.content.totals.vat}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{previewDialog.content.totals.gross}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewDialog({ open: false, type: null, content: null })}>
              Închide
            </Button>
            <Button
              onClick={() => {
                setPreviewDialog({ open: false, type: null, content: null });
                if (previewDialog.type === 'pdf') {
                  exportToPDF();
                } else {
                  exportToExcel();
                }
              }}
              variant="contained"
              color={previewDialog.type === 'pdf' ? 'error' : 'success'}
              startIcon={<DownloadIcon />}
            >
              Descarcă {previewDialog.type === 'pdf' ? 'PDF' : 'Excel'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Keyboard Shortcuts */}
        <Dialog
          open={shortcutsDialogOpen}
          onClose={() => setShortcutsDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <KeyboardIcon color="primary" />
                <Typography variant="h6">Scurtături Tastatură</Typography>
              </Box>
              <IconButton onClick={() => setShortcutsDialogOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Combinație</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Acțiune</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Chip label="Ctrl + S" size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>Salvează draft manual</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Chip label="Ctrl + P" size="small" color="error" variant="outlined" />
                    </TableCell>
                    <TableCell>Preview PDF</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Chip label="Ctrl + E" size="small" color="success" variant="outlined" />
                    </TableCell>
                    <TableCell>Preview Excel</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Chip label="Ctrl + D" size="small" color="error" variant="outlined" />
                    </TableCell>
                    <TableCell>Descarcă PDF</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Chip label="Ctrl + Shift + ?" size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>Arată acest dialog</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Chip label="Escape" size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>Închide dialoguri</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                💡 <strong>Sfat:</strong> Pe Mac, folosește <strong>Cmd</strong> în loc de <strong>Ctrl</strong>
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShortcutsDialogOpen(false)} variant="contained">
              Am înțeles
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Autosave */}
        <Snackbar
          open={autosaveSnackbar}
          autoHideDuration={2000}
          onClose={() => setAutosaveSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={() => setAutosaveSnackbar(false)}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            💾 Draft salvat automat!
          </Alert>
        </Snackbar>

        {/* Dialog Șabloane Facturi */}
        <Dialog
          open={invoiceSablonDialogOpen}
          onClose={() => setInvoiceSablonDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon color="secondary" />
                <Typography variant="h6">Șabloane Facturi</Typography>
              </Box>
              <IconButton onClick={() => setInvoiceSablonDialogOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Salvează și refolosește facturi tip pentru facturare recurentă
            </Typography>
          </DialogTitle>
          <DialogContent>
            {(() => {
              const sabloane = JSON.parse(localStorage.getItem('normalro_invoice_sabloane') || '[]');

              if (sabloane.length === 0) {
                return (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Nu există șabloane salvate.</strong>
                      <br />
                      <br />
                      Pentru a crea un șablon:
                      <br />
                      1. Completează o factură cu produse și setări
                      <br />
                      2. Apasă butonul "Salvează șablon" din partea dreaptă sus
                      <br />
                      3. Șablonul va apărea aici pentru refolosire rapidă
                    </Typography>
                  </Alert>
                );
              }

              return (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {sabloane.map((sablon) => (
                    <Card key={sablon.id} variant="outlined">
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                              {sablon.name}
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                              <Chip
                                label={`Serie: ${sablon.series || '-'}`}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={`${sablon.lines?.length || 0} produse`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Chip
                                label={sablon.currency || 'RON'}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                              {sablon.totalDiscount?.type !== 'none' && (
                                <Chip
                                  label={`Discount ${sablon.totalDiscount.type === 'percent' ? sablon.totalDiscount.percent + '%' : sablon.totalDiscount.amount}`}
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              Creat: {new Date(sablon.createdAt).toLocaleString('ro-RO')}
                            </Typography>
                            {sablon.notes && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                "{sablon.notes.substring(0, 100)}{sablon.notes.length > 100 ? '...' : ''}"
                              </Typography>
                            )}
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => loadInvoiceSablon(sablon)}
                            >
                              Încarcă
                            </Button>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                deleteInvoiceSablon(sablon.id);
                                // Force re-render
                                setInvoiceSablonDialogOpen(false);
                                setTimeout(() => setInvoiceSablonDialogOpen(true), 100);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              );
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInvoiceSablonDialogOpen(false)}>
              Închide
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Furnizori (Societăți Proprii) */}
        <Dialog
          open={supplierTemplateDialogOpen}
          onClose={() => setSupplierTemplateDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon color="primary" />
                <Typography variant="h6">Furnizori (Societăți Proprii)</Typography>
              </Box>
              <IconButton onClick={() => setSupplierTemplateDialogOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Gestionează societățile tale - comută rapid între ele
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {savedSuppliers.length === 0 ? (
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Nu există furnizori salvați.</strong>
                    <br />
                    <br />
                    Pentru a salva un furnizor:
                    <br />
                    1. Completează datele furnizorului în formular
                    <br />
                    2. Apasă butonul "Salvează" din dreapta sus
                    <br />
                    3. Furnizorul va apărea aici pentru selecție rapidă
                    <br />
                    <br />
                    💡 <strong>Util pentru:</strong> Dacă ai mai multe societăți și vrei să comiuți rapid între ele când emiți facturi.
                  </Typography>
                </Alert>
              ) : (
                <Stack spacing={1.5}>
                  {savedSuppliers.map((supplier) => (
                    <Card key={supplier.id} variant="outlined" sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { 
                        boxShadow: 3,
                        borderColor: 'primary.main'
                      }
                    }}>
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box sx={{ flex: 1 }} onClick={() => selectSupplier(supplier)}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                              <Typography variant="subtitle1" fontWeight="600">
                                {supplier.displayName}
                              </Typography>
                              {supplier.updatedAt && (
                                <Chip 
                                  label="Actualizat" 
                                  size="small" 
                                  color="warning" 
                                  variant="outlined"
                                  sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                              )}
                            </Stack>
                            <Grid container spacing={1}>
                              <Grid size={{ xs: 6, sm: 4 }}>
                                <Typography variant="caption" color="text.secondary">
                                  CUI:
                                </Typography>
                                <Typography variant="body2" fontSize="0.85rem">
                                  {supplier.cui}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 4 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Oraș:
                                </Typography>
                                <Typography variant="body2" fontSize="0.85rem">
                                  {supplier.city || '-'}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 4 }}>
                                <Typography variant="caption" color="text.secondary">
                                  IBAN:
                                </Typography>
                                <Typography variant="body2" fontSize="0.75rem" sx={{ fontFamily: 'monospace' }}>
                                  {supplier.bankAccounts?.[0]?.iban ? 
                                    `${supplier.bankAccounts[0].iban.substring(0, 8)}...` : 
                                    '-'
                                  }
                                </Typography>
                              </Grid>
                            </Grid>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                              {supplier.updatedAt ? (
                                <>
                                  Creat: {new Date(supplier.createdAt).toLocaleDateString('ro-RO')}
                                  {' • '}
                                  <span style={{ color: '#ff9800', fontWeight: 600 }}>
                                    Actualizat: {new Date(supplier.updatedAt).toLocaleDateString('ro-RO')}
                                  </span>
                                </>
                              ) : (
                                `Salvat: ${new Date(supplier.createdAt).toLocaleDateString('ro-RO')}`
                              )}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSupplier(supplier.id);
                            }}
                            title="Șterge furnizor"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}

              <Alert severity="info">
                <Typography variant="body2">
                  <strong>💡 Sfat:</strong> Click pe un furnizor pentru a completa automat toate câmpurile în formular.
                  Salvează butoanele folosite frecvent pentru acces rapid.
                </Typography>
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSupplierTemplateDialogOpen(false)}>
              Închide
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Versiuni Factură */}
        <Dialog
          open={showVersionsDialog}
          onClose={() => setShowVersionsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon color="info" />
                <Typography variant="h6">Versiuni Factură</Typography>
              </Box>
              <IconButton onClick={() => setShowVersionsDialog(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Ultimele {invoiceVersions.length} versiuni pentru {invoiceData.series} {invoiceData.number}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {invoiceVersions.length === 0 ? (
                <Alert severity="info">
                  Nu există versiuni salvate pentru această factură.
                  <br />
                  Versiunile sunt salvate automat la fiecare 10 secunde după modificări.
                </Alert>
              ) : (
                <>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>📚 Versioning automat:</strong> Ultimele 5 versiuni sunt păstrate automat.
                      Click pe "Restaurează" pentru a reveni la o versiune anterioară.
                    </Typography>
                  </Alert>
                  <Stack spacing={1.5}>
                    {invoiceVersions.map((version, index) => (
                      <Card key={version.id} variant="outlined" sx={{ bgcolor: index === 0 ? 'success.50' : 'grey.50' }}>
                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {index === 0 && (
                                  <Chip label="Curentă" size="small" color="success" />
                                )}
                                <Typography variant="subtitle2" fontWeight="600">
                                  Versiune #{invoiceVersions.length - index}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  • {new Date(version.timestamp).toLocaleString('ro-RO')}
                                </Typography>
                              </Stack>
                              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Client:
                                  </Typography>
                                  <Typography variant="body2" fontSize="0.85rem">
                                    {version.invoiceData.clientName || '-'}
                                  </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Linii:
                                  </Typography>
                                  <Typography variant="body2" fontSize="0.85rem">
                                    {version.lines?.length || 0} produse
                                  </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Total:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="600" color="success.main" fontSize="0.85rem">
                                    {version.totals?.gross || '0.00'} {version.invoiceData.currency}
                                  </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Atașamente:
                                  </Typography>
                                  <Typography variant="body2" fontSize="0.85rem">
                                    {version.attachedFiles?.length || 0} fișiere
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>
                            <Stack direction="row" spacing={0.5}>
                              {index !== 0 && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => restoreVersion(version)}
                                >
                                  Restaurează
                                </Button>
                              )}
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => deleteVersion(version.id)}
                                disabled={index === 0}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowVersionsDialog(false)}>
              Închide
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Categorii Produse */}
        <Dialog
          open={productCategoriesDialogOpen}
          onClose={() => setProductCategoriesDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalOfferIcon color="info" />
                <Typography variant="h6">Categorii Produse</Typography>
              </Box>
              <IconButton onClick={() => setProductCategoriesDialogOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Organizează produsele pe categorii pentru o gestionare mai ușoară
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              {/* Formular adăugare categorie nouă */}
              <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom fontWeight="600">
                    Adaugă categorie nouă
                  </Typography>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const name = formData.get('categoryName');
                    const color = formData.get('categoryColor');
                    const icon = formData.get('categoryIcon');
                    
                    if (name) {
                      addProductCategory(name, color, icon);
                      e.target.reset();
                      alert(`✅ Categoria "${name}" a fost adăugată!`);
                    }
                  }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          name="categoryName"
                          label="Nume categorie"
                          placeholder="ex: Echipamente IT"
                          required
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          name="categoryColor"
                          label="Culoare"
                          type="color"
                          defaultValue="#2196f3"
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          name="categoryIcon"
                          label="Icon"
                          placeholder="📁"
                          defaultValue="📁"
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="small"
                          startIcon={<AddIcon />}
                          fullWidth
                        >
                          Adaugă categorie
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>

              {/* Lista categorii existente */}
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight="600">
                  Categorii existente ({productCategories.length})
                </Typography>
                {productCategories.length === 0 ? (
                  <Alert severity="info">
                    Nu există categorii create. Adaugă prima categorie mai sus!
                  </Alert>
                ) : (
                  <Stack spacing={1}>
                    {productCategories.map((category) => {
                      const products = templateService.getProductTemplates();
                      const productsCount = products.filter(p => p.category === category.id).length;
                      const isEditing = editingCategoryId === category.id;

                      return (
                        <Card key={category.id} variant="outlined" sx={{ 
                          bgcolor: isEditing ? 'primary.50' : 'transparent',
                          borderColor: isEditing ? 'primary.main' : 'divider'
                        }}>
                          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                            {isEditing ? (
                              // Formular editare inline
                              <Stack spacing={2}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                  <Typography variant="subtitle2" fontWeight="600" color="primary.main">
                                    ✏️ Editare categorie
                                  </Typography>
                                  {/* Preview live */}
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="caption" color="text.secondary">
                                      Preview:
                                    </Typography>
                                    <Box
                                      sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 1,
                                        bgcolor: editingCategoryData.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem',
                                        border: '1px solid',
                                        borderColor: 'divider'
                                      }}
                                    >
                                      {editingCategoryData.icon}
                                    </Box>
                                    <Typography variant="body2" fontWeight="500">
                                      {editingCategoryData.name || '(fără nume)'}
                                    </Typography>
                                  </Stack>
                                </Stack>
                                <Grid container spacing={2}>
                                  <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      label="Nume categorie"
                                      value={editingCategoryData.name}
                                      onChange={(e) => setEditingCategoryData({ ...editingCategoryData, name: e.target.value })}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          saveEditedCategory();
                                        } else if (e.key === 'Escape') {
                                          cancelEditingCategory();
                                        }
                                      }}
                                      autoFocus
                                      required
                                    />
                                  </Grid>
                                  <Grid size={{ xs: 6, sm: 3 }}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      label="Culoare"
                                      type="color"
                                      value={editingCategoryData.color}
                                      onChange={(e) => setEditingCategoryData({ ...editingCategoryData, color: e.target.value })}
                                    />
                                  </Grid>
                                  <Grid size={{ xs: 6, sm: 3 }}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      label="Icon (emoji)"
                                      value={editingCategoryData.icon}
                                      onChange={(e) => setEditingCategoryData({ ...editingCategoryData, icon: e.target.value })}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          saveEditedCategory();
                                        } else if (e.key === 'Escape') {
                                          cancelEditingCategory();
                                        }
                                      }}
                                      placeholder="📁"
                                      helperText="ex: 📦 🛠️ 💼"
                                    />
                                  </Grid>
                                </Grid>
                                <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                  <Typography variant="caption" color="text.secondary">
                                    💡 Enter = salvează • Esc = anulează
                                  </Typography>
                                  <Stack direction="row" spacing={1}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={cancelEditingCategory}
                                      startIcon={<CloseIcon />}
                                    >
                                      Anulează
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="primary"
                                      onClick={saveEditedCategory}
                                      startIcon={<CheckIcon />}
                                    >
                                      Salvează
                                    </Button>
                                  </Stack>
                                </Stack>
                              </Stack>
                            ) : (
                              // Afișare normală
                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 1,
                                      bgcolor: category.color,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '1.2rem'
                                    }}
                                  >
                                    {category.icon}
                                  </Box>
                                  <Box>
                                    <Typography variant="subtitle2" fontWeight="600">
                                      {category.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {productsCount} produse
                                      {category.updatedAt && (
                                        <> • Actualizat: {new Date(category.updatedAt).toLocaleDateString('ro-RO')}</>
                                      )}
                                    </Typography>
                                  </Box>
                                </Stack>
                                <Stack direction="row" spacing={0.5}>
                                  <Tooltip title="Editează categoria">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => startEditingCategory(category)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Șterge categoria">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => {
                                        const confirmed = window.confirm(
                                          `Ești sigur că vrei să ștergi categoria "${category.name}"?`
                                        );
                                        if (confirmed) {
                                          deleteProductCategory(category.id);
                                        }
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </Stack>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              {/* Info */}
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>💡 Cum funcționează categoriile?</strong>
                  <br />
                  • Creează categorii pentru diferite tipuri de produse/servicii
                  <br />
                  • Editează categoriile existente (nume, culoare, icon) cu butonul ✏️
                  <br />
                  • Când salvezi un produs ca șablon, poți selecta categoria
                  <br />
                  • Filtrează rapid produsele din șabloane după categorie
                  <br />
                  • Produsele rămân salvate chiar dacă ștergi categoria
                  <br />
                  • Preview live în timpul editării pentru a vedea schimbările instant
                </Typography>
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProductCategoriesDialogOpen(false)}>
              Închide
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Fișa Client */}
        <Dialog
          open={clientProfileDialogOpen}
          onClose={() => setClientProfileDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VisibilityIcon color="primary" />
                <Typography variant="h6">Fișa Client</Typography>
              </Box>
              <IconButton onClick={() => setClientProfileDialogOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {selectedClientForProfile && (() => {
              const stats = calculateClientStats(selectedClientForProfile.clientCUI || selectedClientForProfile.cui);
              const clientInvoices = getClientInvoices(selectedClientForProfile.clientCUI || selectedClientForProfile.cui);

              return (
                <Stack spacing={3} sx={{ mt: 2 }}>
                  {/* Informații client */}
                  <Card variant="outlined" sx={{ bgcolor: 'primary.50' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight="600">
                        {selectedClientForProfile.clientName || selectedClientForProfile.name}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            CUI
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {selectedClientForProfile.clientCUI || selectedClientForProfile.cui}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            Reg Com
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {selectedClientForProfile.clientRegCom || selectedClientForProfile.regCom || '-'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2" color="text.secondary">
                            Adresă
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {selectedClientForProfile.clientAddress || selectedClientForProfile.address || '-'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Statistici */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom fontWeight="600">
                      📊 Statistici facturare
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary.main" fontWeight="700">
                              {stats.totalInvoices}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Facturi emise
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main" fontWeight="700">
                              {stats.totalAmount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total facturat ({stats.currency})
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="info.main" fontWeight="700">
                              {stats.averageAmount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Medie/factură ({stats.currency})
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      {stats.unpaidInvoices > 0 && (
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <Card variant="outlined" sx={{ bgcolor: 'error.50' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="error.main" fontWeight="700">
                                {stats.unpaidInvoices}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Facturi scadente
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                      {stats.lastInvoiceDate && (
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <Card variant="outlined">
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" color="secondary.main" fontWeight="600">
                                {new Date(stats.lastInvoiceDate).toLocaleDateString('ro-RO')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Ultima factură
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  {/* Lista facturi */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom fontWeight="600">
                      📄 Facturi emise ({clientInvoices.length})
                    </Typography>
                    {clientInvoices.length === 0 ? (
                      <Alert severity="info">
                        Nu există facturi emise pentru acest client.
                      </Alert>
                    ) : (
                      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Serie/Nr</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Scadență</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Total</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acțiuni</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {clientInvoices.map((invoice) => {
                              const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date();
                              
                              return (
                                <TableRow key={invoice.id} hover>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight="500">
                                      {invoice.series} {invoice.number}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {new Date(invoice.issueDate).toLocaleDateString('ro-RO')}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color={isOverdue ? 'error.main' : 'text.primary'}>
                                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('ro-RO') : '-'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2" fontWeight="600" color="success.main">
                                      {invoice.totals?.gross} {invoice.currency}
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ textAlign: 'center' }}>
                                    {isOverdue ? (
                                      <Chip label="Scadent" size="small" color="error" />
                                    ) : (
                                      <Chip label="OK" size="small" color="success" />
                                    )}
                                  </TableCell>
                                  <TableCell sx={{ textAlign: 'center' }}>
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => {
                                        loadInvoiceFromHistory(invoice);
                                        setClientProfileDialogOpen(false);
                                      }}
                                      title="Încarcă factura"
                                    >
                                      <DescriptionIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>

                  {/* Info suplimentar */}
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>💡 Sfat:</strong> Click pe iconița 📄 pentru a încărca factura în formular și a o edita/exporta din nou.
                    </Typography>
                  </Alert>
                </Stack>
              );
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClientProfileDialogOpen(false)}>
              Închide
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </ToolLayout>
  );
};

export default InvoiceGenerator;

