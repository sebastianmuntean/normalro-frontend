import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
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
  TextField,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import ToolLayout from '../../components/ToolLayout';
import { getCompanyDataByCUI } from '../../services/anafService';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import CryptoJS from 'crypto-js';
import { create } from 'xmlbuilder2';

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

  const exportToXML = () => {
    // Format data pentru XML e-Factura (UBL 2.1 pentru România)
    const invoiceNumber = `${invoiceData.series || 'FAC'}${invoiceData.number || '001'}`;
    const issueDate = invoiceData.issueDate || new Date().toISOString().split('T')[0];
    const currencyCode = invoiceData.currency || 'RON';

    // Creează documentul XML
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('Invoice', {
        'xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
        'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
        'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'
      })
        .ele('cbc:CustomizationID').txt('urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.1').up()
        .ele('cbc:ID').txt(invoiceNumber).up()
        .ele('cbc:IssueDate').txt(issueDate).up()
        .ele('cbc:DueDate').txt(invoiceData.dueDate || issueDate).up()
        .ele('cbc:InvoiceTypeCode').txt('380').up() // 380 = Commercial Invoice
        .ele('cbc:DocumentCurrencyCode').txt(currencyCode).up()
        
        // Furnizor (AccountingSupplierParty)
        .ele('cac:AccountingSupplierParty')
          .ele('cac:Party')
            .ele('cac:PartyName')
              .ele('cbc:Name').txt(invoiceData.supplierName || '').up()
            .up()
            .ele('cac:PostalAddress')
              .ele('cbc:StreetName').txt(invoiceData.supplierAddress || '').up()
              .ele('cbc:CityName').txt(invoiceData.supplierCity || '').up()
              .ele('cac:Country')
                .ele('cbc:IdentificationCode').txt('RO').up()
              .up()
            .up()
            .ele('cac:PartyTaxScheme')
              .ele('cbc:CompanyID').txt('RO' + (invoiceData.supplierCUI || '')).up()
              .ele('cac:TaxScheme')
                .ele('cbc:ID').txt('VAT').up()
              .up()
            .up()
            .ele('cac:PartyLegalEntity')
              .ele('cbc:RegistrationName').txt(invoiceData.supplierName || '').up()
              .ele('cbc:CompanyID').txt(invoiceData.supplierRegCom || '').up()
            .up()
            .ele('cac:Contact')
              .ele('cbc:Telephone').txt(invoiceData.supplierPhone || '').up()
              .ele('cbc:ElectronicMail').txt(invoiceData.supplierEmail || '').up()
            .up()
          .up()
        .up()
        
        // Beneficiar (AccountingCustomerParty)
        .ele('cac:AccountingCustomerParty')
          .ele('cac:Party')
            .ele('cac:PartyName')
              .ele('cbc:Name').txt(invoiceData.clientName || '').up()
            .up()
            .ele('cac:PostalAddress')
              .ele('cbc:StreetName').txt(invoiceData.clientAddress || '').up()
              .ele('cbc:CityName').txt(invoiceData.clientCity || '').up()
              .ele('cac:Country')
                .ele('cbc:IdentificationCode').txt('RO').up()
              .up()
            .up()
            .ele('cac:PartyTaxScheme')
              .ele('cbc:CompanyID').txt('RO' + (invoiceData.clientCUI || '')).up()
              .ele('cac:TaxScheme')
                .ele('cbc:ID').txt('VAT').up()
              .up()
            .up()
            .ele('cac:PartyLegalEntity')
              .ele('cbc:RegistrationName').txt(invoiceData.clientName || '').up()
              .ele('cbc:CompanyID').txt(invoiceData.clientRegCom || '').up()
            .up()
          .up()
        .up()
        
        // Modalitate de plată
        .ele('cac:PaymentMeans')
          .ele('cbc:PaymentMeansCode').txt('30').up() // 30 = Credit transfer
          .ele('cac:PayeeFinancialAccount')
            .ele('cbc:ID').txt(invoiceData.supplierIBAN || '').up()
            .ele('cbc:Name').txt(invoiceData.supplierBank || '').up()
          .up()
        .up();

    // Adaugă grupuri TVA
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

    // TaxTotal
    const taxTotal = doc.root().ele('cac:TaxTotal')
      .ele('cbc:TaxAmount', { currencyID: currencyCode }).txt(totals.vat).up();

    Object.entries(vatGroups).forEach(([rate, amounts]) => {
      taxTotal.ele('cac:TaxSubtotal')
        .ele('cbc:TaxableAmount', { currencyID: currencyCode }).txt(amounts.taxableAmount.toFixed(2)).up()
        .ele('cbc:TaxAmount', { currencyID: currencyCode }).txt(amounts.taxAmount.toFixed(2)).up()
        .ele('cac:TaxCategory')
          .ele('cbc:ID').txt('S').up() // S = Standard rate
          .ele('cbc:Percent').txt(rate).up()
          .ele('cac:TaxScheme')
            .ele('cbc:ID').txt('VAT').up()
          .up()
        .up()
      .up();
    });

    // LegalMonetaryTotal
    doc.root()
      .ele('cac:LegalMonetaryTotal')
        .ele('cbc:LineExtensionAmount', { currencyID: currencyCode }).txt(totals.net).up()
        .ele('cbc:TaxExclusiveAmount', { currencyID: currencyCode }).txt(totals.net).up()
        .ele('cbc:TaxInclusiveAmount', { currencyID: currencyCode }).txt(totals.gross).up()
        .ele('cbc:PayableAmount', { currencyID: currencyCode }).txt(totals.gross).up()
      .up();

    // InvoiceLines
    lines.forEach((line, index) => {
      const lineNet = parseFloat(calculateLineTotal(line, 'net')) || 0;
      const lineVat = parseFloat(calculateLineTotal(line, 'vat')) || 0;
      const lineGross = parseFloat(calculateLineTotal(line, 'gross')) || 0;
      const qty = parseFloat(line.quantity) || 0;
      const unitPrice = parseFloat(line.unitNetPrice) || 0;
      const vatRate = parseFloat(line.vatRate) || 0;

      doc.root().ele('cac:InvoiceLine')
        .ele('cbc:ID').txt(index + 1).up()
        .ele('cbc:InvoicedQuantity', { unitCode: 'EA' }).txt(qty).up() // EA = Each (unit)
        .ele('cbc:LineExtensionAmount', { currencyID: currencyCode }).txt(lineNet.toFixed(2)).up()
        .ele('cac:Item')
          .ele('cbc:Name').txt(line.product || 'Produs/Serviciu').up()
        .up()
        .ele('cac:Price')
          .ele('cbc:PriceAmount', { currencyID: currencyCode }).txt(unitPrice.toFixed(2)).up()
        .up()
        .ele('cac:TaxTotal')
          .ele('cbc:TaxAmount', { currencyID: currencyCode }).txt(lineVat.toFixed(2)).up()
          .ele('cac:TaxSubtotal')
            .ele('cbc:TaxableAmount', { currencyID: currencyCode }).txt(lineNet.toFixed(2)).up()
            .ele('cbc:TaxAmount', { currencyID: currencyCode }).txt(lineVat.toFixed(2)).up()
            .ele('cac:TaxCategory')
              .ele('cbc:ID').txt('S').up()
              .ele('cbc:Percent').txt(vatRate).up()
              .ele('cac:TaxScheme')
                .ele('cbc:ID').txt('VAT').up()
              .up()
            .up()
          .up()
        .up()
      .up();
    });

    // Generează XML string
    const xmlString = doc.end({ prettyPrint: true });

    // Creează blob și descarcă
    const blob = new Blob([xmlString], { type: 'application/xml' });
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
                    <Typography variant="caption" color="text.secondary">Total linie:</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {calculateLineTotal(line, 'net')} + {calculateLineTotal(line, 'vat')} = <span style={{ color: '#2e7d32' }}>{calculateLineTotal(line, 'gross')} {invoiceData.currency}</span>
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
            <br />
            📋 <strong>XML (e-Factura):</strong> Format UBL 2.1 compatibil cu sistemul RoE-Factura (ANAF), gata de încărcat direct în portal.
          </Typography>
        </Paper>
      </Stack>
    </ToolLayout>
  );
};

export default InvoiceGenerator;

