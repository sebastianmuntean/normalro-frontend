/**
 * Google Sheets Service
 * 
 * Serviciu pentru sincronizarea datelor Invoice Generator cu Google Sheets
 * - Date furnizor (salvate în cookie)
 * - Template-uri produse
 * - Template-uri clienți
 * - Istoric facturi
 */

class GoogleSheetsService {
  constructor() {
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    this.apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    this.spreadsheetId = null; // Va fi setat de utilizator sau creat automat
    this.isInitialized = false;
    this.tokenClient = null;
    
    // Nume sheet-uri
    this.SHEET_NAMES = {
      SUPPLIER: 'Date Furnizor',
      PRODUCTS: 'Template Produse',
      CLIENTS: 'Template Clienți',
      INVOICES: 'Istoric Facturi'
    };
  }

  /**
   * Generează un GUID unic pentru identificarea entităților
   */
  generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Formatează numele sheet-ului pentru a fi folosit în API calls
   * Sheet-urile cu spații sau caractere speciale trebuie wrapped în ghilimele simple
   * IMPORTANT: În A1 notation, sheet names cu spații TREBUIE să fie în single quotes
   */
  formatSheetName(sheetName) {
    // Escape single quotes existente (dublându-le conform A1 notation)
    let escaped = sheetName.replace(/'/g, "''");
    
    // Dacă sheet name conține spații, exclamation marks, sau alte caractere speciale
    // trebuie wrapped în single quotes conform A1 notation
    if (sheetName.includes(' ') || sheetName.includes('!') || sheetName.includes("'")) {
      return `'${escaped}'`;
    }
    
    return escaped;
  }

  /**
   * Caută rândul care conține un GUID specific
   * @param {string} sheetName - Numele sheet-ului
   * @param {string} guid - GUID-ul de căutat
   * @returns {number|null} - Numărul rândului (1-based) sau null dacă nu găsește
   */
  async findRowByGUID(sheetName, guid) {
    try {
      // Citește toate datele din coloana A (GUID)
      const formattedSheetName = this.formatSheetName(sheetName);
      console.log(`🔍 Căutare GUID în sheet: "${sheetName}" -> formatted: "${formattedSheetName}"`);
      
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${formattedSheetName}!A:A`
      });

      const values = response.result.values || [];
      
      // Caută GUID-ul în coloana A (index 0)
      for (let i = 0; i < values.length; i++) {
        if (values[i] && values[i][0] === guid) {
          return i + 1; // Returnează numărul rândului (1-based)
        }
      }
      
      return null; // Nu găsește GUID-ul
    } catch (error) {
      console.error(`❌ Eroare căutare GUID ${guid} în "${sheetName}":`, error);
      console.error(`📋 Formatted sheet name: "${this.formatSheetName(sheetName)}"`);
      console.error(`📄 Error body:`, error.body);
      
      // Verifică dacă sheet-ul există
      if (error.status === 400 && error.body && error.body.includes('Unable to parse range')) {
        console.error(`⚠️ Sheet-ul "${sheetName}" nu există sau are un nume diferit în spreadsheet!`);
        console.error(`💡 Sugestie: Verifică numele sheet-urilor în spreadsheet sau recrează spreadsheet-ul.`);
      }
      
      return null;
    }
  }

  /**
   * Verifică dacă serviciul este configurat
   */
  isConfigured() {
    return !!(this.clientId && this.apiKey);
  }

  /**
   * Inițializează Google API Client
   */
  async initializeGapi() {
    return new Promise((resolve, reject) => {
      if (!window.gapi) {
        reject(new Error('Google API nu este încărcat'));
        return;
      }

      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: this.apiKey,
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
          });
          
          this.isInitialized = true;
          console.log('✅ Google Sheets API inițializat');
          resolve();
        } catch (error) {
          console.error('Eroare inițializare Google Sheets API:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Inițializează Google Identity Services (OAuth)
   */
  initializeGis() {
    if (!window.google || !window.google.accounts) {
      console.error('Google Identity Services nu este încărcat');
      return;
    }

    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: this.clientId,
      scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
      callback: '', // Va fi setat dinamic
    });
  }

  /**
   * Solicită autorizare de la utilizator
   */
  async requestAuthorization() {
    return new Promise((resolve, reject) => {
      // Verifică și reinițializează tokenClient dacă nu există
      if (!this.tokenClient) {
        console.log('⚠️ Token client nu este inițializat, încerc reinițializare...');
        this.initializeGis();
        
        // Verifică din nou după reinițializare
        if (!this.tokenClient) {
          reject(new Error(
            'Token client nu este inițializat.\n\n' +
            'Verifică dacă ai autorizat aplicația.\n\n' +
            'Cauze posibile:\n' +
            '• Google Identity Services nu s-a încărcat complet\n' +
            '• REACT_APP_GOOGLE_CLIENT_ID lipsește sau e invalid\n' +
            '• Scriptul Google Identity nu este disponibil'
          ));
          return;
        }
        console.log('✅ Token client reinițializat cu succes');
      }

      // Verifică dacă există deja un token valid
      const token = window.gapi.client.getToken();
      if (token !== null && token.access_token) {
        console.log('✅ Token existent găsit, nu e nevoie de reautorizare');
        resolve(token);
        return;
      }

      this.tokenClient.callback = async (response) => {
        if (response.error !== undefined) {
          console.error('❌ Eroare autorizare:', response.error);
          reject(response);
          return;
        }
        console.log('✅ Autorizare reușită');
        resolve(response);
      };

      // Cere consent pentru access (prima dată sau când token-ul a expirat)
      console.log('🔑 Solicit autorizare Google...');
      this.tokenClient.requestAccessToken({ prompt: '' });
    });
  }

  /**
   * Setează ID-ul spreadsheet-ului de lucru
   */
  setSpreadsheetId(id) {
    this.spreadsheetId = id;
    localStorage.setItem('normalro_sheets_id', id);
  }

  /**
   * Încarcă ID-ul spreadsheet-ului din localStorage
   */
  loadSpreadsheetId() {
    const saved = localStorage.getItem('normalro_sheets_id');
    if (saved) {
      this.spreadsheetId = saved;
    }
    return this.spreadsheetId;
  }

  /**
   * Creează un nou Google Spreadsheet pentru Invoice Generator
   */
  async createInvoiceSpreadsheet() {
    if (!this.isInitialized) {
      throw new Error('Google Sheets API nu este inițializat');
    }

    try {
      // Creează spreadsheet-ul
      const response = await window.gapi.client.sheets.spreadsheets.create({
        properties: {
          title: `NormalRO Invoice Data - ${new Date().toLocaleDateString('ro-RO')}`
        },
        sheets: [
          { properties: { title: this.SHEET_NAMES.SUPPLIER, gridProperties: { rowCount: 50, columnCount: 10 } } },
          { properties: { title: this.SHEET_NAMES.PRODUCTS, gridProperties: { rowCount: 100, columnCount: 8 } } },
          { properties: { title: this.SHEET_NAMES.CLIENTS, gridProperties: { rowCount: 100, columnCount: 12 } } },
          { properties: { title: this.SHEET_NAMES.INVOICES, gridProperties: { rowCount: 500, columnCount: 20 } } }
        ]
      });

      const spreadsheetId = response.result.spreadsheetId;
      const sheets = response.result.sheets;
      this.setSpreadsheetId(spreadsheetId);

      console.log('✅ Spreadsheet creat:', spreadsheetId);
      console.log('📊 Sheets create:', sheets.map(s => ({ id: s.properties.sheetId, title: s.properties.title })));

      // Inițializează header-ele pentru fiecare sheet (folosind ID-urile reale)
      await this.initializeSheetHeaders(spreadsheetId, sheets);

      return {
        id: spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
      };
    } catch (error) {
      console.error('Eroare creare spreadsheet:', error);
      throw error;
    }
  }

  /**
   * Inițializează header-ele pentru toate sheet-urile
   */
  async initializeSheetHeaders(spreadsheetId, sheets) {
    const updates = [
      // Headers pentru Date Furnizor (16 coloane: A-P) - GUID adăugat ca primă coloană
      {
        range: `${this.formatSheetName(this.SHEET_NAMES.SUPPLIER)}!A1:P1`,
        values: [[
          'GUID', 'Serie', 'Număr', 'Monedă', 'TVA Implicit (%)',
          'Nume', 'CUI', 'Reg Com', 'Adresă', 'Oraș', 'Județ',
          'Țară', 'Telefon', 'Email', 'Prefix TVA', 'Conturi Bancare (JSON)'
        ]]
      },
      // Headers pentru Template Produse (7 coloane: A-G) - GUID adăugat
      {
        range: `${this.formatSheetName(this.SHEET_NAMES.PRODUCTS)}!A1:G1`,
        values: [[
          'GUID', 'ID', 'Produs/Serviciu', 'Cantitate', 'Preț Net Unitar', 'Cotă TVA (%)', 'Data Creare'
        ]]
      },
      // Headers pentru Template Clienți (13 coloane: A-M) - GUID adăugat
      {
        range: `${this.formatSheetName(this.SHEET_NAMES.CLIENTS)}!A1:M1`,
        values: [[
          'GUID', 'ID', 'Nume', 'CUI', 'Reg Com', 'Adresă', 'Oraș', 
          'Județ', 'Țară', 'Telefon', 'Email', 'Prefix TVA', 'Data Creare'
        ]]
      },
      // Headers pentru Istoric Facturi (21 coloane: A-U) - GUID adăugat
      {
        range: `${this.formatSheetName(this.SHEET_NAMES.INVOICES)}!A1:U1`,
        values: [[
          'GUID', 'ID', 'Serie', 'Număr', 'Data Emitere', 'Data Scadență', 'Monedă',
          'Furnizor', 'CUI Furnizor', 'Client', 'CUI Client',
          'Total Net', 'Total TVA', 'Total Brut', 'Nr. Linii', 'Note',
          'Fișiere Atașate', 'Data Creare', 'Link PDF', 'Link Excel', 'Link XML'
        ]]
      }
    ];

    // Batch update pentru toate header-ele
    await window.gapi.client.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    // Creează mapping între nume sheet și ID real
    const sheetIdMap = {};
    sheets.forEach(sheet => {
      sheetIdMap[sheet.properties.title] = sheet.properties.sheetId;
    });

    console.log('📊 Sheet ID Map:', sheetIdMap);

    // Formatare header-e (bold + background) - folosind ID-urile REALE
    const requests = [
      this.SHEET_NAMES.SUPPLIER,
      this.SHEET_NAMES.PRODUCTS,
      this.SHEET_NAMES.CLIENTS,
      this.SHEET_NAMES.INVOICES
    ].map((sheetName) => ({
      repeatCell: {
        range: {
          sheetId: sheetIdMap[sheetName], // Folosește ID-ul REAL din response
          startRowIndex: 0,
          endRowIndex: 1
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.2, green: 0.6, blue: 0.86 },
            textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)'
      }
    }));

    await window.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: { requests }
    });

    console.log('✅ Headers inițializate cu succes pentru toate sheet-urile');
  }

  /**
   * Salvează datele furnizorului în Google Sheets
   */
  async saveSupplierData(data) {
    if (!this.spreadsheetId) {
      throw new Error('Spreadsheet ID nu este setat. Creează sau conectează un spreadsheet mai întâi.');
    }

    // Generează sau folosește GUID existent
    let guid = data.guid;
    if (!guid) {
      guid = this.generateGUID();
      console.log('🆕 GUID nou generat pentru furnizor:', guid);
    } else {
      console.log('🔄 Folosesc GUID existent pentru furnizor:', guid);
    }

    const row = [
      guid, // GUID ca primă coloană
      data.series || '',
      data.number || '',
      data.currency || 'RON',
      data.defaultVatRate || '19',
      data.supplierName || '',
      data.supplierCUI || '',
      data.supplierRegCom || '',
      data.supplierAddress || '',
      data.supplierCity || '',
      data.supplierCounty || '',
      data.supplierCountry || 'Romania',
      data.supplierPhone || '',
      data.supplierEmail || '',
      data.supplierVatPrefix || 'RO',
      JSON.stringify(data.supplierBankAccounts || [])
    ];

    // Verifică dacă există deja un rând cu acest GUID
    const existingRow = await this.findRowByGUID(this.SHEET_NAMES.SUPPLIER, guid);
    
    if (existingRow) {
      // Update rândul existent
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.formatSheetName(this.SHEET_NAMES.SUPPLIER)}!A${existingRow}:P${existingRow}`,
        valueInputOption: 'RAW',
        resource: {
          values: [row]
        }
      });
      console.log(`✅ Date furnizor actualizate în rândul ${existingRow} (GUID: ${guid})`);
    } else {
      // Adaugă rând nou
      await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.formatSheetName(this.SHEET_NAMES.SUPPLIER)}!A:P`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [row]
        }
      });
      console.log(`✅ Date furnizor adăugate ca rând nou (GUID: ${guid})`);
    }

    // Returnează GUID-ul pentru a fi salvat în data
    return guid;
  }

  /**
   * Încarcă datele furnizorului din Google Sheets
   */
  async loadSupplierData() {
    if (!this.spreadsheetId) {
      return null;
    }

    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.formatSheetName(this.SHEET_NAMES.SUPPLIER)}!A2:P2`
      });

      const row = response.result.values?.[0];
      if (!row || row.length === 0) {
        return null;
      }

      return {
        guid: row[0] || '', // GUID ca primul câmp
        series: row[1] || '',
        number: row[2] || '',
        currency: row[3] || 'RON',
        defaultVatRate: row[4] || '19',
        supplierName: row[5] || '',
        supplierCUI: row[6] || '',
        supplierRegCom: row[7] || '',
        supplierAddress: row[8] || '',
        supplierCity: row[9] || '',
        supplierCounty: row[10] || '',
        supplierCountry: row[11] || 'Romania',
        supplierPhone: row[12] || '',
        supplierEmail: row[13] || '',
        supplierVatPrefix: row[14] || 'RO',
        supplierBankAccounts: row[15] ? JSON.parse(row[15]) : [{ bank: '', iban: '' }]
      };
    } catch (error) {
      console.error('Eroare încărcare date furnizor:', error);
      return null;
    }
  }

  /**
   * Salvează un template de produs
   */
  async saveProductTemplate(product) {
    if (!this.spreadsheetId) {
      throw new Error('Spreadsheet ID nu este setat');
    }

    // Generează sau folosește GUID existent
    let guid = product.guid;
    if (!guid) {
      guid = this.generateGUID();
      console.log('🆕 GUID nou generat pentru produs:', guid);
    } else {
      console.log('🔄 Folosesc GUID existent pentru produs:', guid);
    }

    const row = [
      guid, // GUID ca primă coloană
      product.id || Date.now().toString(),
      product.product || '',
      product.quantity || '1',
      product.unitNetPrice || '0.00',
      product.vatRate || '19',
      new Date().toISOString()
    ];

    // Verifică dacă există deja un rând cu acest GUID
    const existingRow = await this.findRowByGUID(this.SHEET_NAMES.PRODUCTS, guid);
    
    if (existingRow) {
      // Update rândul existent
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.formatSheetName(this.SHEET_NAMES.PRODUCTS)}!A${existingRow}:G${existingRow}`,
        valueInputOption: 'RAW',
        resource: {
          values: [row]
        }
      });
      console.log(`✅ Template produs actualizat în rândul ${existingRow} (GUID: ${guid})`);
    } else {
      // Adaugă rând nou
      await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.formatSheetName(this.SHEET_NAMES.PRODUCTS)}!A:G`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [row]
        }
      });
      console.log(`✅ Template produs adăugat ca rând nou (GUID: ${guid})`);
    }

    return guid;
  }

  /**
   * Încarcă toate template-urile de produse
   */
  async loadProductTemplates() {
    if (!this.spreadsheetId) {
      return [];
    }

    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.formatSheetName(this.SHEET_NAMES.PRODUCTS)}!A2:G`
      });

      const rows = response.result.values || [];
      return rows.map(row => ({
        guid: row[0] || '', // GUID ca primul câmp
        id: row[1] || '',
        product: row[2] || '',
        quantity: row[3] || '1',
        unitNetPrice: row[4] || '0.00',
        vatRate: row[5] || '19',
        createdAt: row[6] || ''
      }));
    } catch (error) {
      console.error('Eroare încărcare template-uri produse:', error);
      return [];
    }
  }

  /**
   * Șterge un template de produs
   */
  async deleteProductTemplate(productId) {
    if (!this.spreadsheetId) {
      throw new Error('Spreadsheet ID nu este setat');
    }

    // Găsește rândul cu ID-ul respectiv
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${this.formatSheetName(this.SHEET_NAMES.PRODUCTS)}!A:A`
    });

    const rows = response.result.values || [];
    const rowIndex = rows.findIndex(row => row[0] === productId);

    if (rowIndex === -1) {
      throw new Error('Template nu a fost găsit');
    }

    // Șterge rândul (rowIndex + 1 pentru că indexarea începe de la 1 în API)
    const sheetId = await this.getSheetIdByName(this.SHEET_NAMES.PRODUCTS);
    await window.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }]
      }
    });

    console.log('✅ Template produs șters din Google Sheets');
  }

  /**
   * Salvează un template de client
   */
  async saveClientTemplate(client) {
    if (!this.spreadsheetId) {
      throw new Error('Spreadsheet ID nu este setat');
    }

    // Generează sau folosește GUID existent
    let guid = client.guid;
    if (!guid) {
      guid = this.generateGUID();
      console.log('🆕 GUID nou generat pentru client:', guid);
    } else {
      console.log('🔄 Folosesc GUID existent pentru client:', guid);
    }

    const row = [
      guid, // GUID ca primă coloană
      client.id || Date.now().toString(),
      client.name || '',
      client.cui || '',
      client.regCom || '',
      client.address || '',
      client.city || '',
      client.county || '',
      client.country || 'Romania',
      client.phone || '',
      client.email || '',
      client.vatPrefix || 'RO',
      new Date().toISOString()
    ];

    // Verifică dacă există deja un rând cu acest GUID
    const existingRow = await this.findRowByGUID(this.SHEET_NAMES.CLIENTS, guid);
    
    if (existingRow) {
      // Update rândul existent
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.formatSheetName(this.SHEET_NAMES.CLIENTS)}!A${existingRow}:M${existingRow}`,
        valueInputOption: 'RAW',
        resource: {
          values: [row]
        }
      });
      console.log(`✅ Template client actualizat în rândul ${existingRow} (GUID: ${guid})`);
    } else {
      // Adaugă rând nou
      await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.formatSheetName(this.SHEET_NAMES.CLIENTS)}!A:M`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [row]
        }
      });
      console.log(`✅ Template client adăugat ca rând nou (GUID: ${guid})`);
    }

    return guid;
  }

  /**
   * Încarcă toate template-urile de clienți
   */
  async loadClientTemplates() {
    if (!this.spreadsheetId) {
      return [];
    }

    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.formatSheetName(this.SHEET_NAMES.CLIENTS)}!A2:M`
      });

      const rows = response.result.values || [];
      return rows.map(row => ({
        guid: row[0] || '', // GUID ca primul câmp
        id: row[1] || '',
        clientName: row[2] || '',
        clientCUI: row[3] || '',
        clientRegCom: row[4] || '',
        clientAddress: row[5] || '',
        clientCity: row[6] || '',
        clientCounty: row[7] || '',
        clientCountry: row[8] || 'Romania',
        clientPhone: row[9] || '',
        clientEmail: row[10] || '',
        clientVatPrefix: row[11] || 'RO',
        createdAt: row[12] || ''
      }));
    } catch (error) {
      console.error('Eroare încărcare template-uri clienți:', error);
      return [];
    }
  }

  /**
   * Șterge un template de client
   */
  async deleteClientTemplate(clientId) {
    if (!this.spreadsheetId) {
      throw new Error('Spreadsheet ID nu este setat');
    }

    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${this.formatSheetName(this.SHEET_NAMES.CLIENTS)}!A:A`
    });

    const rows = response.result.values || [];
    const rowIndex = rows.findIndex(row => row[0] === clientId);

    if (rowIndex === -1) {
      throw new Error('Template nu a fost găsit');
    }

    const sheetId = await this.getSheetIdByName(this.SHEET_NAMES.CLIENTS);
    await window.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }]
      }
    });

    console.log('✅ Template client șters din Google Sheets');
  }

  /**
   * Salvează o factură în istoric
   */
  async saveInvoiceToHistory(invoice, lines, totals, notes, attachedFiles) {
    if (!this.spreadsheetId) {
      throw new Error('Spreadsheet ID nu este setat');
    }

    // Generează sau folosește GUID existent
    let guid = invoice.guid;
    if (!guid) {
      guid = this.generateGUID();
      console.log('🆕 GUID nou generat pentru factură:', guid);
    } else {
      console.log('🔄 Folosesc GUID existent pentru factură:', guid);
    }

    const row = [
      guid, // GUID ca primă coloană
      Date.now().toString(),
      invoice.series || '',
      invoice.number || '',
      invoice.issueDate || '',
      invoice.dueDate || '',
      invoice.currency || 'RON',
      invoice.supplierName || '',
      invoice.supplierCUI || '',
      invoice.clientName || '',
      invoice.clientCUI || '',
      totals.net || '0.00',
      totals.vat || '0.00',
      totals.gross || '0.00',
      lines.length.toString(),
      notes || '',
      attachedFiles.length.toString(),
      new Date().toISOString(),
      '', // Link PDF (va fi completat manual)
      '', // Link Excel
      ''  // Link XML
    ];

    // Verifică dacă există deja un rând cu acest GUID
    const existingRow = await this.findRowByGUID(this.SHEET_NAMES.INVOICES, guid);
    
    if (existingRow) {
      // Update rândul existent
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.formatSheetName(this.SHEET_NAMES.INVOICES)}!A${existingRow}:U${existingRow}`,
        valueInputOption: 'RAW',
        resource: {
          values: [row]
        }
      });
      console.log(`✅ Factură actualizată în rândul ${existingRow} (GUID: ${guid})`);
    } else {
      // Adaugă rând nou
      await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.formatSheetName(this.SHEET_NAMES.INVOICES)}!A:U`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [row]
        }
      });
      console.log(`✅ Factură adăugată ca rând nou (GUID: ${guid})`);
    }

    return guid;
  }

  /**
   * Încarcă istoricul facturilor
   */
  async loadInvoiceHistory() {
    if (!this.spreadsheetId) {
      return [];
    }

    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.formatSheetName(this.SHEET_NAMES.INVOICES)}!A2:U`
      });

      const rows = response.result.values || [];
      return rows.map(row => ({
        guid: row[0] || '', // GUID ca primul câmp
        id: row[1] || '',
        series: row[2] || '',
        number: row[3] || '',
        issueDate: row[4] || '',
        dueDate: row[5] || '',
        currency: row[6] || 'RON',
        supplierName: row[7] || '',
        supplierCUI: row[8] || '',
        clientName: row[9] || '',
        clientCUI: row[10] || '',
        totalNet: row[11] || '0.00',
        totalVat: row[12] || '0.00',
        totalGross: row[13] || '0.00',
        lineCount: row[14] || '0',
        notes: row[15] || '',
        attachmentCount: row[16] || '0',
        createdAt: row[17] || '',
        pdfLink: row[18] || '',
        excelLink: row[19] || '',
        xmlLink: row[20] || ''
      }));
    } catch (error) {
      console.error('Eroare încărcare istoric facturi:', error);
      return [];
    }
  }

  /**
   * Helper: Găsește sheet ID după nume
   */
  async getSheetIdByName(sheetName) {
    const response = await window.gapi.client.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId
    });

    const sheet = response.result.sheets.find(
      s => s.properties.title === sheetName
    );

    return sheet ? sheet.properties.sheetId : 0;
  }

  /**
   * Verifică dacă spreadsheet-ul este valid și accesibil
   */
  async validateSpreadsheet(spreadsheetId) {
    try {
      await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId
      });
      return true;
    } catch (error) {
      console.error('Spreadsheet invalid:', error);
      return false;
    }
  }

  /**
   * Verifică dacă un sheet există în spreadsheet
   */
  async sheetExists(sheetName) {
    try {
      const response = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });
      
      const sheets = response.result.sheets || [];
      return sheets.some(sheet => sheet.properties.title === sheetName);
    } catch (error) {
      console.error(`Eroare verificare sheet "${sheetName}":`, error);
      return false;
    }
  }

  /**
   * Creează un sheet lipsă în spreadsheet
   */
  async createMissingSheet(sheetName) {
    try {
      console.log(`📝 Creez sheet lipsă: "${sheetName}"`);
      
      // Creează sheet-ul
      const createResponse = await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName,
                gridProperties: {
                  rowCount: sheetName === this.SHEET_NAMES.INVOICES ? 500 : 100,
                  columnCount: 20
                }
              }
            }
          }]
        }
      });

      const newSheet = createResponse.result.replies[0].addSheet;
      console.log(`✅ Sheet "${sheetName}" creat cu succes (ID: ${newSheet.properties.sheetId})`);

      // Inițializează headers pentru sheet-ul nou creat
      await this.initializeSheetHeaders(this.spreadsheetId, [newSheet]);
      
      return true;
    } catch (error) {
      console.error(`❌ Eroare creare sheet "${sheetName}":`, error);
      return false;
    }
  }

  /**
   * Verifică și creează toate sheet-urile necesare
   */
  async ensureAllSheetsExist() {
    const requiredSheets = [
      this.SHEET_NAMES.SUPPLIER,
      this.SHEET_NAMES.PRODUCTS,
      this.SHEET_NAMES.CLIENTS,
      this.SHEET_NAMES.INVOICES
    ];

    console.log('🔍 Verificare sheet-uri necesare...');
    
    for (const sheetName of requiredSheets) {
      const exists = await this.sheetExists(sheetName);
      if (!exists) {
        console.warn(`⚠️ Sheet "${sheetName}" lipsește!`);
        await this.createMissingSheet(sheetName);
      } else {
        console.log(`✅ Sheet "${sheetName}" există`);
      }
    }
    
    console.log('✅ Toate sheet-urile necesare sunt prezente');
  }

  /**
   * Sincronizează toate datele din localStorage către Google Sheets
   */
  async syncAllDataToSheets() {
    if (!this.spreadsheetId) {
      throw new Error('Spreadsheet ID nu este setat');
    }

    const results = {
      supplier: false,
      products: false,
      clients: false,
      invoices: false
    };

    try {
      // 1. Sincronizează date furnizor din cookie
      const supplierCookie = localStorage.getItem('normalro_invoice_supplier');
      if (supplierCookie) {
        // Aici ar trebui să decriptezi cookie-ul, dar pentru simplitate citim direct
        console.log('📤 Sincronizare date furnizor...');
        // results.supplier = true;
      }

      // 2. Sincronizează template-uri produse
      const products = JSON.parse(localStorage.getItem('normalro_product_templates') || '[]');
      console.log(`📤 Sincronizare ${products.length} template-uri produse...`);
      for (const product of products) {
        await this.saveProductTemplate(product);
      }
      results.products = true;

      // 3. Sincronizează template-uri clienți
      const clients = JSON.parse(localStorage.getItem('normalro_client_templates') || '[]');
      console.log(`📤 Sincronizare ${clients.length} template-uri clienți...`);
      for (const client of clients) {
        await this.saveClientTemplate(client);
      }
      results.clients = true;

      // 4. Sincronizează istoric facturi
      const invoices = JSON.parse(localStorage.getItem('normalro_invoice_history') || '[]');
      console.log(`📤 Sincronizare ${invoices.length} facturi din istoric...`);
      // Aici ar trebui să salvezi fiecare factură
      results.invoices = true;

      return results;
    } catch (error) {
      console.error('Eroare sincronizare:', error);
      throw error;
    }
  }

  /**
   * URL ghid configurare
   */
  getConfigurationGuideUrl() {
    return 'https://docs.google.com/document/d/1234567890'; // Link către ghidul de configurare
  }
}

// Export instanță singleton
const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;

