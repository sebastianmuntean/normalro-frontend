# 🆔 Sistem GUID pentru Google Sheets Integration

## 📋 Prezentare Generală

Am implementat un sistem de identificare unică (GUID) pentru toate entitățile din Google Sheets, care previne dublarea datelor și permite actualizarea în loc de inserarea de noi înregistrări.

## ✨ Funcționalități

### 1. **GUID Unic pentru Fiecare Entitate**
- **Furnizor**: Un GUID per set de date furnizor
- **Produse**: Un GUID per template de produs
- **Clienți**: Un GUID per template de client  
- **Facturi**: Un GUID per factură din istoric

### 2. **Logica Update vs Insert**
- **Dacă există GUID**: Actualizează rândul existent
- **Dacă nu există GUID**: Generează GUID nou și adaugă rând nou

### 3. **Prevenirea Dublării**
- Fiecare entitate are un identificator unic
- Nu se mai creează înregistrări duplicate
- Datele se actualizează în loc să se adauge

## 🔧 Implementare Tehnică

### **Funcția `generateGUID()`**
```javascript
generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

### **Funcția `findRowByGUID()`**
```javascript
async findRowByGUID(sheetName, guid) {
  try {
    // Citește toate datele din coloana A (GUID)
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A:A`
    });

    const values = response.result.values || [];
    
    // Caută GUID-ul în coloana A
    for (let i = 0; i < values.length; i++) {
      if (values[i] && values[i][0] === guid) {
        return i + 1; // Returnează numărul rândului (1-based)
      }
    }
    
    return null; // Nu găsește GUID-ul
  } catch (error) {
    console.error(`Eroare căutare GUID ${guid} în ${sheetName}:`, error);
    return null;
  }
}
```

### **Logica de Salvare cu GUID**

#### **Pentru Furnizor**
```javascript
async saveSupplierData(data) {
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
    // ... restul datelor
  ];

  // Verifică dacă există deja un rând cu acest GUID
  const existingRow = await this.findRowByGUID(this.SHEET_NAMES.SUPPLIER, guid);
  
  if (existingRow) {
    // Update rândul existent
    await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${this.SHEET_NAMES.SUPPLIER}!A${existingRow}:P${existingRow}`,
      valueInputOption: 'RAW',
      resource: { values: [row] }
    });
    console.log(`✅ Date furnizor actualizate în rândul ${existingRow} (GUID: ${guid})`);
  } else {
    // Adaugă rând nou
    await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: `${this.SHEET_NAMES.SUPPLIER}!A:P`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [row] }
    });
    console.log(`✅ Date furnizor adăugate ca rând nou (GUID: ${guid})`);
  }

  return guid;
}
```

## 📊 Structura Sheet-urilor Actualizată

### **Date Furnizor (16 coloane: A-P)**
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **GUID** | Serie | Număr | Monedă | TVA Implicit (%) | Nume | CUI | Reg Com | Adresă | Oraș | Județ | Țară | Telefon | Email | Prefix TVA | Conturi Bancare (JSON) |

### **Template Produse (7 coloane: A-G)**
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| **GUID** | ID | Produs/Serviciu | Cantitate | Preț Net Unitar | Cotă TVA (%) | Data Creare |

### **Template Clienți (13 coloane: A-M)**
| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **GUID** | ID | Nume | CUI | Reg Com | Adresă | Oraș | Județ | Țară | Telefon | Email | Prefix TVA | Data Creare |

### **Istoric Facturi (21 coloane: A-U)**
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **GUID** | ID | Serie | Număr | Data Emitere | Data Scadență | Monedă | Furnizor | CUI Furnizor | Client | CUI Client | Total Net | Total TVA | Total Brut | Nr. Linii | Note | Fișiere Atașate | Data Creare | Link PDF | Link Excel | Link XML |

## 🔄 Fluxul de Lucru

### **1. Prima Salvare (Nou)**
1. Entitatea nu are GUID în localStorage
2. Se generează GUID nou în Google Sheets
3. Se adaugă rând nou în sheet
4. **GUID-ul se salvează înapoi în localStorage**
5. La următoarea salvare va face UPDATE

### **2. Salvare Ulterioară (Update)**
1. Entitatea are deja GUID în localStorage
2. Se trimite GUID-ul la Google Sheets
3. Google Sheets caută rândul cu acel GUID
4. Se actualizează rândul existent
5. Nu se creează înregistrări duplicate

### **3. Sincronizare Automată**
1. Se citesc datele din localStorage
2. Se verifică dacă au GUID-uri
3. Dacă NU au GUID: se generează și se salvează în localStorage
4. Dacă au GUID: se face UPDATE în Google Sheets

### **4. Persistență GUID-uri în localStorage**
- **Template Produse**: GUID salvat în `normalro_product_templates`
- **Template Clienți**: GUID salvat în `normalro_client_templates`  
- **Istoric Facturi**: GUID salvat în `normalro_invoice_history`
- **Date Furnizor**: GUID salvat în `invoiceData.guid`

## 🎯 Avantaje

### 1. **Prevenirea Dublării**
- Nu se mai creează înregistrări duplicate
- Datele se actualizează în loc să se adauge
- Sincronizarea este mai eficientă

### 2. **Identificare Unică**
- Fiecare entitate are un identificator unic
- Ușor de urmărit și gestionat
- Suport pentru operațiuni CRUD

### 3. **Performanță**
- Update în loc de insert
- Menține sheet-urile curate
- Sincronizare mai rapidă

### 4. **Robustețe**
- Gestionează cazurile de eroare
- Logging detaliat pentru debugging
- Fallback la insert dacă update eșuează

## 🔧 Salvare GUID în localStorage

### **Template Service**
```javascript
// Funcții pentru actualizare GUID-uri
updateProductGuid(id, guid) {
  const templates = this.getAllProductTemplates();
  const updated = templates.map(t =>
    t.id === id ? { ...t, guid: guid } : t
  );
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
}

updateClientGuid(id, guid) {
  const templates = this.getAllClientTemplates();
  const updated = templates.map(t =>
    t.id === id ? { ...t, guid: guid } : t
  );
  localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(updated));
}
```

### **Invoice History Service**
```javascript
updateInvoiceGuid(id, guid) {
  const invoices = this.getAllInvoices();
  const updated = invoices.map(inv =>
    inv.id === id ? { ...inv, guid: guid } : inv
  );
  localStorage.setItem(this.storageKey, JSON.stringify(updated));
}
```

### **Sincronizare cu Salvare GUID**
```javascript
// În syncAllDataToSheets
for (const product of products) {
  const savedGuid = await googleSheetsService.saveProductTemplate(product);
  
  // Salvează GUID-ul înapoi în localStorage
  if (savedGuid && !product.guid) {
    templateService.updateProductGuid(product.id, savedGuid);
    console.log(`🆔 GUID salvat în localStorage pentru produs ${product.id}`);
  }
}
```

## 📝 Logging și Debugging

### **Mesaje de Log**
- `🆕 GUID nou generat pentru [entitate]: [guid]`
- `🔄 Folosesc GUID existent pentru [entitate]: [guid]`
- `✅ [Entitate] actualizat în rândul [row] (GUID: [guid])`
- `✅ [Entitate] adăugat ca rând nou (GUID: [guid])`
- `🆔 GUID salvat în localStorage pentru [entitate] [id]: [guid]`

### **Gestionarea Erorilor**
- Erorile de căutare GUID sunt logate
- Fallback la insert dacă update eșuează
- Continuă funcționarea chiar dacă o operațiune eșuează

## 🚀 Beneficii pentru Utilizator

1. **Date Curate**: Nu se mai dublează înregistrările
2. **Sincronizare Eficientă**: Update în loc de insert
3. **Consistență**: Datele rămân sincronizate
4. **Performanță**: Operațiuni mai rapide
5. **Fiabilitate**: Sistem robust cu gestionare erori

## 🔍 Monitorizare

### **Console Logs**
```javascript
// Prima salvare
🆕 GUID nou generat pentru furnizor: 123e4567-e89b-12d3-a456-426614174000
✅ Date furnizor adăugate ca rând nou (GUID: 123e4567-e89b-12d3-a456-426614174000)

// Salvare ulterioară
🔄 Folosesc GUID existent pentru furnizor: 123e4567-e89b-12d3-a456-426614174000
✅ Date furnizor actualizate în rândul 2 (GUID: 123e4567-e89b-12d3-a456-426614174000)
```

### **Verificare în Google Sheets**
- Coloana A conține GUID-urile
- Rândurile se actualizează în loc să se adauge
- Nu apar înregistrări duplicate

## ⚙️ Configurare

### **Nu Necesită Configurare Suplimentară**
- Sistemul funcționează automat
- GUID-urile se generează automat
- Logica de update/insert este transparentă

### **Compatibilitate**
- Funcționează cu sheet-urile existente
- Adaugă coloana GUID la primul sync
- Menține compatibilitatea cu datele existente
