# Google Sheets - Quick Start Guide

**Salvează automat datele Invoice Generator în Google Sheets! 📊**

---

## ⚡ Setup Rapid (5 minute)

### 1️⃣ Google Cloud Console

1. Accesează: https://console.cloud.google.com/
2. Creează proiect nou: "NormalRO Invoice"
3. Activează API-uri:
   - Google Sheets API ✅
   - Google Drive API ✅
4. Creează credențiale:
   - **API Key** → Copiază-l
   - **OAuth Client ID** (Web application) → Copiază-l

📖 **Ghid complet**: `GOOGLE_SHEETS_SETUP.md`

---

### 2️⃣ Configurare .env

Creează fișierul `.env` în folder-ul `normalro-frontend/`:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
REACT_APP_GOOGLE_API_KEY=your-api-key
```

**⚠️ Înlocuiește cu valorile tale reale!**

---

### 3️⃣ Restart Aplicație

```bash
npm start
```

Reîmprospătează pagina Invoice Generator.

---

## 🚀 Utilizare

### Prima Conectare

1. **Deschide Invoice Generator**
2. **Caută cardul**: "⚠️ Google Sheets Neconectat"
3. **Click**: "Crează Spreadsheet Nou"
4. **Autorizează** aplicația în Google (acceptă permisiunile)
5. ✅ **Gata!** Spreadsheet-ul s-a creat automat

### Conectare Spreadsheet Existent

Dacă ai deja un spreadsheet:

1. Deschide spreadsheet-ul în Google Sheets
2. Copiază ID-ul din URL:
   ```
   https://docs.google.com/spreadsheets/d/[COPIAZĂ_ASTA]/edit
   ```
3. În app, click "Conectează Spreadsheet Existent"
4. Lipește ID-ul → Click "Conectează"

---

## 📊 Ce se Salvează Automat?

| La Export | Se Salvează |
|-----------|-------------|
| **PDF** | Date furnizor + Factură în istoric |
| **Excel** | Date furnizor + Factură în istoric |
| **XML** | Date furnizor + Factură în istoric |
| **Template Produs** | Produs în sheet "Template Produse" |
| **Template Client** | Client în sheet "Template Clienți" |

---

## 📂 Structura Spreadsheet

```
📊 NormalRO Invoice Data
│
├─ 📄 Date Furnizor
│  └─ Serie, Număr, CUI, Nume, Adresă, IBAN, etc.
│
├─ 📄 Template Produse
│  └─ Produse/servicii salvate frecvent
│
├─ 📄 Template Clienți
│  └─ Clienți/beneficiari salvați
│
└─ 📄 Istoric Facturi
   └─ Toate facturile generate (rezumat)
```

---

## 🔄 Sincronizare Manuală

Pentru backup complet:

1. Click "**Sincronizare Manuală**"
2. Toate template-urile → Google Sheets
3. ✅ Backup complet în cloud!

---

## ❓ Probleme?

### "API Key invalid"
➡️ Verifică că ai copiat corect API Key-ul în `.env`

### "Spreadsheet nu e valid"
➡️ Verifică ID-ul copiat (fără spații)

### "Autorizare refuzată"
➡️ Acceptă permisiunile Google când ți se cere

### "Nu văd cardul Google Sheets"
➡️ Verifică că `.env` are valorile corecte și ai făcut restart

---

## 📖 Documentație Completă

- **Setup detaliat**: `GOOGLE_SHEETS_SETUP.md`
- **Implementare tehnică**: `GOOGLE_SHEETS_INTEGRATION.md`
- **Google Drive**: `GOOGLE_DRIVE_SETUP.md`

---

## ✨ Beneficii

✅ **Backup automat** în cloud  
✅ **Acces multi-dispozitiv** (folosești același spreadsheet)  
✅ **Editare externă** (modifici datele direct în Sheets)  
✅ **Export facil** (Excel/CSV din Google Sheets)  
✅ **Nu pierzi datele** dacă ștergi cache-ul browser-ului  

---

**Mult succes! 🚀**

*Pentru suport: contact@normalro.com*


