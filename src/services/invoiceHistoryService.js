// Invoice History Service - localStorage management
// Salvează și gestionează istoricul facturilor local în browser

const STORAGE_KEY_INVOICES = 'normalro_invoice_history';
const STORAGE_KEY_PROFORMA = 'normalro_proforma_history';
const MAX_INVOICES = 100; // Limită pentru a preveni localStorage overflow

class InvoiceHistoryService {
  constructor() {
    this.storageKey = STORAGE_KEY_INVOICES;
  }

  // Setează tipul de facturi (invoice sau proforma)
  setType(type = 'invoice') {
    this.storageKey = type === 'proforma' ? STORAGE_KEY_PROFORMA : STORAGE_KEY_INVOICES;
  }

  // Salvează o factură în istoric
  saveInvoice(invoiceData, lines, totals, notes = '', attachedFiles = [], totalDiscount = null) {
    try {
      const invoice = {
        guid: invoiceData.guid || '', // Păstrează GUID-ul dacă există
        id: Date.now(),
        type: this.storageKey === STORAGE_KEY_PROFORMA ? 'proforma' : 'invoice',
        series: invoiceData.series || '',
        number: invoiceData.number || '',
        issueDate: invoiceData.issueDate || new Date().toISOString().split('T')[0],
        dueDate: invoiceData.dueDate || invoiceData.validUntil || '',
        currency: invoiceData.currency || 'RON',
        supplier: {
          name: invoiceData.supplierName || '',
          cui: invoiceData.supplierCUI || '',
          regCom: invoiceData.supplierRegCom || '',
          address: invoiceData.supplierAddress || '',
          city: invoiceData.supplierCity || '',
          county: invoiceData.supplierCounty || '',
          country: invoiceData.supplierCountry || 'Romania',
          phone: invoiceData.supplierPhone || '',
          email: invoiceData.supplierEmail || '',
          bank: invoiceData.supplierBank || '',
          iban: invoiceData.supplierIBAN || '',
          vatPrefix: invoiceData.supplierVatPrefix || 'RO',
          bankAccounts: invoiceData.supplierBankAccounts || [{ bank: '', iban: '', currency: 'RON' }]
        },
        client: {
          name: invoiceData.clientName || '',
          cui: invoiceData.clientCUI || '',
          regCom: invoiceData.clientRegCom || '',
          address: invoiceData.clientAddress || '',
          city: invoiceData.clientCity || '',
          county: invoiceData.clientCounty || '',
          country: invoiceData.clientCountry || 'Romania',
          phone: invoiceData.clientPhone || '',
          email: invoiceData.clientEmail || '',
          vatPrefix: invoiceData.clientVatPrefix || 'RO',
          bankAccounts: invoiceData.clientBankAccounts || [{ bank: '', iban: '', currency: 'RON' }]
        },
        lines: lines.map(line => ({
          product: line.product || '',
          quantity: line.quantity || '1',
          purchasePrice: line.purchasePrice || '0.00',
          markup: line.markup || '0.00',
          unitNetPrice: line.unitNetPrice || '0',
          vatRate: line.vatRate || '0',
          unitGrossPrice: line.unitGrossPrice || '0',
          discountPercent: line.discountPercent || '0.00',
          discountAmount: line.discountAmount || '0.00'
        })),
        totalDiscount: totalDiscount && totalDiscount.type !== 'none' ? {
          type: totalDiscount.type || 'none',
          percent: totalDiscount.percent || '0.00',
          amount: totalDiscount.amount || '0.00'
        } : null,
        totals: {
          net: totals.net || '0.00',
          vat: totals.vat || '0.00',
          gross: totals.gross || '0.00'
        },
        notes: notes || '',
        attachedFilesCount: attachedFiles.length || 0,
        createdAt: Date.now()
      };

      const invoices = this.getAllInvoices();
      
      // Verifică duplicate (serie + număr + dată)
      const isDuplicate = invoices.some(inv => 
        inv.series === invoice.series && 
        inv.number === invoice.number && 
        inv.issueDate === invoice.issueDate
      );

      if (isDuplicate) {
        console.warn('Factură duplicată detectată, nu se salvează în istoric');
        return false;
      }

      // Adaugă factura nouă
      invoices.unshift(invoice); // Adaugă la început (cele mai noi primele)

      // Limitează la MAX_INVOICES (șterge cele mai vechi)
      if (invoices.length > MAX_INVOICES) {
        invoices.splice(MAX_INVOICES);
      }

      // Salvează în localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(invoices));
      return true;
    } catch (error) {
      console.error('Eroare salvare factură în istoric:', error);
      
      // Verifică dacă localStorage este plin
      if (error.name === 'QuotaExceededError') {
        this.cleanupOldInvoices(50); // Păstrează doar ultimele 50
        return this.saveInvoice(invoiceData, lines, totals, notes, attachedFiles); // Retry
      }
      
      return false;
    }
  }

  // Obține toate facturile din istoric
  getAllInvoices() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Eroare citire istoric:', error);
      return [];
    }
  }

  // Obține facturi cu filtrare și căutare
  getInvoices({ 
    search = '', 
    dateRange = 'all', // 'all', '7days', '30days', '90days', 'custom'
    startDate = null,
    endDate = null,
    page = 1,
    perPage = 10
  } = {}) {
    let invoices = this.getAllInvoices();

    // Filtrare după căutare
    if (search) {
      const searchLower = search.toLowerCase();
      invoices = invoices.filter(inv => 
        inv.series?.toLowerCase().includes(searchLower) ||
        inv.number?.toLowerCase().includes(searchLower) ||
        inv.client.name?.toLowerCase().includes(searchLower) ||
        inv.client.cui?.toLowerCase().includes(searchLower) ||
        inv.supplier.name?.toLowerCase().includes(searchLower)
      );
    }

    // Filtrare după interval de timp
    if (dateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();

      if (dateRange === '7days') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (dateRange === '30days') {
        cutoffDate.setDate(now.getDate() - 30);
      } else if (dateRange === '90days') {
        cutoffDate.setDate(now.getDate() - 90);
      } else if (dateRange === 'custom' && startDate && endDate) {
        invoices = invoices.filter(inv => {
          const invoiceDate = new Date(inv.issueDate);
          return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
        });
      }

      if (dateRange !== 'custom') {
        invoices = invoices.filter(inv => {
          const invoiceDate = new Date(inv.issueDate);
          return invoiceDate >= cutoffDate;
        });
      }
    }

    // Paginare
    const total = invoices.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedInvoices = invoices.slice(start, end);

    return {
      invoices: paginatedInvoices,
      total,
      totalPages,
      currentPage: page,
      perPage
    };
  }

  // Obține o factură după ID
  getInvoiceById(id) {
    const invoices = this.getAllInvoices();
    return invoices.find(inv => inv.id === id);
  }

  // Șterge o factură din istoric
  deleteInvoice(id) {
    try {
      const invoices = this.getAllInvoices();
      const filtered = invoices.filter(inv => inv.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Eroare ștergere factură:', error);
      return false;
    }
  }

  // Actualizează GUID-ul pentru o factură
  updateInvoiceGuid(id, guid) {
    try {
      const invoices = this.getAllInvoices();
      const updated = invoices.map(inv =>
        inv.id === id ? { ...inv, guid: guid } : inv
      );
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Eroare actualizare GUID factură:', error);
      return false;
    }
  }

  // Șterge toate facturile (cu confirmare externă)
  clearAllInvoices() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Eroare ștergere istoric complet:', error);
      return false;
    }
  }

  // Cleanup - păstrează doar primele N facturi
  cleanupOldInvoices(keepCount = 50) {
    try {
      const invoices = this.getAllInvoices();
      if (invoices.length > keepCount) {
        const toKeep = invoices.slice(0, keepCount);
        localStorage.setItem(this.storageKey, JSON.stringify(toKeep));
      }
      return true;
    } catch (error) {
      console.error('Eroare cleanup:', error);
      return false;
    }
  }

  // Obține statistici
  getStatistics() {
    const invoices = this.getAllInvoices();

    if (invoices.length === 0) {
      return {
        totalInvoices: 0,
        totalAmount: 0,
        averageAmount: 0,
        monthlyBreakdown: {},
        topClients: [],
        byCurrency: {}
      };
    }

    // Total emis
    const totalAmount = invoices.reduce((sum, inv) => {
      const amount = parseFloat(inv.totals.gross) || 0;
      return sum + (inv.currency === 'RON' ? amount : 0); // Doar RON pentru total
    }, 0);

    // Medie per factură
    const averageAmount = totalAmount / invoices.length;

    // Breakdown lunar (ultimele 6 luni)
    const monthlyBreakdown = {};
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyBreakdown[key] = { count: 0, amount: 0 };
    }

    invoices.forEach(inv => {
      const invDate = new Date(inv.issueDate);
      const key = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyBreakdown[key]) {
        monthlyBreakdown[key].count++;
        const amount = parseFloat(inv.totals.gross) || 0;
        if (inv.currency === 'RON') {
          monthlyBreakdown[key].amount += amount;
        }
      }
    });

    // Top clienți
    const clientTotals = {};
    invoices.forEach(inv => {
      const clientKey = inv.client.cui || inv.client.name || 'Unknown';
      if (!clientTotals[clientKey]) {
        clientTotals[clientKey] = {
          name: inv.client.name || 'Unknown',
          cui: inv.client.cui || '-',
          total: 0,
          count: 0
        };
      }
      const amount = parseFloat(inv.totals.gross) || 0;
      if (inv.currency === 'RON') {
        clientTotals[clientKey].total += amount;
      }
      clientTotals[clientKey].count++;
    });

    const topClients = Object.values(clientTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Pe monedă
    const byCurrency = {};
    invoices.forEach(inv => {
      const curr = inv.currency || 'RON';
      if (!byCurrency[curr]) {
        byCurrency[curr] = { count: 0, amount: 0 };
      }
      byCurrency[curr].count++;
      byCurrency[curr].amount += parseFloat(inv.totals.gross) || 0;
    });

    return {
      totalInvoices: invoices.length,
      totalAmount: totalAmount.toFixed(2),
      averageAmount: averageAmount.toFixed(2),
      monthlyBreakdown,
      topClients,
      byCurrency
    };
  }

  // Verifică dacă există duplicate
  checkDuplicate(series, number, issueDate) {
    const invoices = this.getAllInvoices();
    return invoices.some(inv => 
      inv.series === series && 
      inv.number === number && 
      inv.issueDate === issueDate
    );
  }

  // Export istoric complet în format pentru Excel
  exportHistoryToExcel() {
    const invoices = this.getAllInvoices();
    
    if (invoices.length === 0) {
      return null;
    }

    const excelData = [];
    
    // Header
    excelData.push(['ISTORIC FACTURI']);
    excelData.push([`Generat: ${new Date().toLocaleDateString('ro-RO')}`]);
    excelData.push([`Total facturi: ${invoices.length}`]);
    excelData.push([]);
    
    // Tabel header
    excelData.push([
      'Nr.',
      'Tip',
      'Serie',
      'Număr',
      'Data emitere',
      'Scadență/Valabil',
      'Furnizor',
      'CUI Furnizor',
      'Client',
      'CUI Client',
      'Monedă',
      'Total Net',
      'Total TVA',
      'Total Brut',
      'Note'
    ]);

    // Date facturi
    invoices.forEach((inv, index) => {
      excelData.push([
        index + 1,
        inv.type === 'proforma' ? 'PROFORMA' : 'FACTURĂ',
        inv.series || '-',
        inv.number || '-',
        inv.issueDate || '-',
        inv.dueDate || '-',
        inv.supplier.name || '-',
        inv.supplier.cui || '-',
        inv.client.name || '-',
        inv.client.cui || '-',
        inv.currency || 'RON',
        inv.totals.net || '0.00',
        inv.totals.vat || '0.00',
        inv.totals.gross || '0.00',
        inv.notes ? inv.notes.substring(0, 100) : '-'
      ]);
    });

    return excelData;
  }

  // Obține dimensiunea curentă în localStorage
  getStorageSize() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? new Blob([data]).size : 0;
    } catch {
      return 0;
    }
  }

  // Verifică dacă localStorage are spațiu
  hasSpace() {
    try {
      const testKey = '__storage_test__';
      const testData = 'x'.repeat(1024 * 1024); // 1MB test
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
const invoiceHistoryService = new InvoiceHistoryService();
export default invoiceHistoryService;

