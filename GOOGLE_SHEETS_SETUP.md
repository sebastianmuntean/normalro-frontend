# Google Sheets Integration - Ghid de Configurare

## Prezentare Generală

Invoice Generator poate fi conectat la Google Sheets pentru a salva automat datele în cloud:
- **Date furnizor** (serie, număr, date companie, conturi bancare)
- **Template-uri produse** (produse/servicii folosite frecvent)
- **Template-uri clienți** (clienți/beneficiari frecvenți)
- **Istoric facturi** (toate facturile generate)

## Beneficii

✅ **Sincronizare automată**: Datele sunt salvate automat la fiecare export  
✅ **Backup în cloud**: Nu pierzi datele dacă ștergi cache-ul browser-ului  
✅ **Acces multi-dispozitiv**: Folosește același spreadsheet pe mai multe dispozitive  
✅ **Editare externă**: Poți edita datele direct în Google Sheets  
✅ **Export simplu**: Exportă toate datele în Excel/CSV din Google Sheets  

---

## Configurare Google Cloud Console

### Pasul 1: Creează un Proiect Google Cloud

1. Accesează [Google Cloud Console](https://console.cloud.google.com/)
2. Click pe dropdown-ul de proiecte (sus, în stânga)
3. Click pe **"New Project"**
4. Nume proiect: `NormalRO Invoice Generator`
5. Click **"Create"**

### Pasul 2: Activează Google Sheets API

1. În meniul lateral, mergi la **"APIs & Services"** → **"Library"**
2. Caută **"Google Sheets API"**
3. Click pe **"Google Sheets API"**
4. Click **"Enable"**

### Pasul 3: Activează Google Drive API

1. În Library, caută **"Google Drive API"**
2. Click pe **"Google Drive API"**
3. Click **"Enable"**

### Pasul 4: Creează API Key

1. Mergi la **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"API Key"**
3. Copiază API Key-ul generat
4. (Opțional) Click pe **"Edit API Key"** și restricționează:
   - **Application restrictions**: HTTP referrers (web sites)
   - Adaugă URL-ul site-ului tău (ex: `https://normalro.com/*`)
   - **API restrictions**: Restrict key
   - Selectează doar: Google Sheets API, Google Drive API

### Pasul 5: Creează OAuth 2.0 Client ID

1. În **"Credentials"**, click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Dacă e prima dată, configurează **OAuth consent screen**:
   - User Type: **External**
   - App name: `NormalRO Invoice Generator`
   - User support email: (email-ul tău)
   - Developer contact email: (email-ul tău)
   - Click **"Save and Continue"**
   - Scopes: Click **"Add or Remove Scopes"**
     - Caută și adaugă:
       - `https://www.googleapis.com/auth/spreadsheets`
       - `https://www.googleapis.com/auth/drive.file`
   - Click **"Save and Continue"**
   - Test users: Adaugă email-ul tău
   - Click **"Save and Continue"**

3. Revino la **"Credentials"** → **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
4. Application type: **Web application**
5. Name: `NormalRO Invoice Web Client`
6. **Authorized JavaScript origins**:
   - Adaugă: `http://localhost:3000` (pentru development)
   - Adaugă: `https://normalro.com` (sau domeniul tău production)
7. **Authorized redirect URIs**: (lasă gol - nu e necesar pentru JavaScript)
8. Click **"Create"**
9. Copiază **Client ID**

---

## Configurare Aplicație

### Variabile de Mediu (.env)

Creează sau editează fișierul `.env` în directorul `normalro-frontend/`:

```env
# Google API Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
REACT_APP_GOOGLE_API_KEY=your-api-key

# Exemplu complet:
# REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefgh.apps.googleusercontent.com
# REACT_APP_GOOGLE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz
```

**⚠️ IMPORTANT:**
- Înlocuiește valorile de mai sus cu cele reale din Google Cloud Console
- **NU publica** API Key-ul și Client ID-ul pe GitHub (adaugă `.env` în `.gitignore`)
- Pentru producție, folosește restricții stricte pe API Key

### Verificare Configurare

După ce ai setat variabilele în `.env`:

1. Restart aplicația React (`npm start`)
2. Deschide Invoice Generator
3. Ar trebui să vezi un card **"Google Sheets Neconectat"** în partea de sus
4. Dacă nu apare, verifică consola browser-ului pentru erori

---

## Utilizare

### 1. Creare Spreadsheet Nou

1. În Invoice Generator, click pe **"Crează Spreadsheet Nou"**
2. Vei fi redirecționat către Google pentru autorizare
3. **Acceptă permisiunile** (Google Sheets + Google Drive)
4. Un spreadsheet nou va fi creat automat cu 4 sheet-uri:
   - **Date Furnizor**: Datele tale de companie
   - **Template Produse**: Produse/servicii frecvente
   - **Template Clienți**: Clienți/beneficiari frecvenți
   - **Istoric Facturi**: Toate facturile generate
5. Spreadsheet-ul se va deschide automat în Google Sheets
6. ID-ul spreadsheet-ului va fi salvat automat în browser

### 2. Conectare Spreadsheet Existent

Dacă ai deja un spreadsheet creat anterior:

1. Deschide spreadsheet-ul în Google Sheets
2. Copiază ID-ul din URL:
   ```
   https://docs.google.com/spreadsheets/d/[AICI_ESTE_ID-UL]/edit
   ```
3. În Invoice Generator, click pe **"Conectează Spreadsheet Existent"**
4. Lipește ID-ul copiat
5. Click **"Conectează"**

### 3. Sincronizare Automată

Odată conectat, datele sunt salvate automat:

- ✅ **La export PDF**: Salvează date furnizor + factura în istoric
- ✅ **La export Excel**: Salvează date furnizor + factura în istoric
- ✅ **La export XML**: Salvează date furnizor + factura în istoric
- ✅ **La salvare template produs**: Salvează în sheet-ul "Template Produse"
- ✅ **La salvare template client**: Salvează în sheet-ul "Template Clienți"

### 4. Sincronizare Manuală

Dacă vrei să sincronizezi toate datele deodată:

1. Click pe **"Sincronizare Manuală"**
2. Toate datele din localStorage vor fi copiate în Google Sheets:
   - Date furnizor
   - Toate template-urile produse
   - Toate template-urile clienți

### 5. Editare Date în Google Sheets

Poți edita datele direct în Google Sheets:

1. Deschide spreadsheet-ul (click pe **"Deschide Spreadsheet"**)
2. Editează datele în orice sheet
3. **IMPORTANT**: Nu șterge header-ele (prima linie)
4. La următoarea încărcare, aplicația va citi datele actualizate

### 6. Deconectare

Pentru a deconecta spreadsheet-ul:

1. Click pe **"Deconectează"**
2. ID-ul va fi șters din browser
3. Datele rămân în Google Sheets (nu se pierd!)
4. Poți reconecta oricând folosind același ID

---

## Structura Spreadsheet-ului

### Sheet 1: Date Furnizor

| Serie | Număr | Monedă | TVA Implicit | Nume | CUI | Reg Com | Adresă | Oraș | Județ | Țară | Telefon | Email | Prefix TVA | Conturi Bancare (JSON) |
|-------|-------|--------|-------------|------|-----|---------|--------|------|-------|------|---------|-------|------------|------------------------|
| FAC   | 001   | RON    | 19          | SC... | ... | J40/... | Str... | București | București | Romania | 0721... | contact@... | RO | [{"bank":"BRD","iban":"..."}] |

### Sheet 2: Template Produse

| ID | Produs/Serviciu | Cantitate | Preț Net Unitar | Cotă TVA (%) | Data Creare |
|----|-----------------|-----------|-----------------|--------------|-------------|
| 1234567890 | Servicii consultanță IT | 1 | 500.00 | 19 | 2024-01-15T10:30:00.000Z |

### Sheet 3: Template Clienți

| ID | Nume | CUI | Reg Com | Adresă | Oraș | Județ | Țară | Telefon | Email | Prefix TVA | Data Creare |
|----|------|-----|---------|--------|------|-------|------|---------|-------|------------|-------------|
| 1234567890 | SC CLIENT SRL | 12345678 | J40/... | Str... | București | București | Romania | 0721... | client@... | RO | 2024-01-15T10:30:00.000Z |

### Sheet 4: Istoric Facturi

| ID | Serie | Număr | Data Emitere | Data Scadență | Monedă | Furnizor | CUI Furnizor | Client | CUI Client | Total Net | Total TVA | Total Brut | Nr. Linii | Note | Fișiere Atașate | Data Creare | Link PDF | Link Excel | Link XML |
|----|-------|-------|--------------|---------------|--------|----------|--------------|--------|-----------|-----------|-----------|------------|-----------|------|-----------------|-------------|----------|-----------|----------|
| 1234567890 | FAC | 001 | 2024-01-15 | 2024-02-15 | RON | SC FURNIZOR | 12345678 | SC CLIENT | 87654321 | 500.00 | 95.00 | 595.00 | 1 | ... | 2 | 2024-01-15T10:30:00.000Z | ... | ... | ... |

---

## Troubleshooting

### Eroare: "Google Sheets API nu este inițializat"

**Cauză**: Scripturile Google nu s-au încărcat  
**Soluție**:
- Așteaptă 5-10 secunde după încărcarea paginii
- Reîmprospătează pagina (F5)
- Verifică conexiunea la internet

### Eroare: "Spreadsheet-ul nu este valid sau nu ai acces la el"

**Cauză**: ID-ul este greșit sau spreadsheet-ul nu e partajat cu tine  
**Soluție**:
- Verifică că ID-ul copiat este corect (fără spații)
- Asigură-te că ai acces la spreadsheet (deschide-l în Google Sheets)
- Dacă e al altcuiva, cere permisiuni de "Editor"

### Eroare: "Autorizare refuzată"

**Cauză**: Ai refuzat permisiunile Google  
**Soluție**:
- Click din nou pe buton și acceptă permisiunile
- Dacă persistă, mergi la [myaccount.google.com/permissions](https://myaccount.google.com/permissions)
- Șterge aplicația "NormalRO Invoice Generator"
- Încearcă din nou autorizarea

### Datele nu se sincronizează

**Cauză**: Conexiunea s-a pierdut sau token-ul a expirat  
**Soluție**:
- Deconectează și reconectează spreadsheet-ul
- Verifică dacă spreadsheet-ul încă există în Google Drive
- Click pe "Sincronizare Manuală" pentru a forța sync

### API Key invalid sau restrictive

**Cauză**: API Key-ul are restricții prea stricte  
**Soluție**:
- Verifică în Google Cloud Console → Credentials → API Key
- Asigură-te că HTTP referrers include URL-ul tău
- Verifică că API-urile (Sheets + Drive) sunt în whitelist

---

## Securitate și Confidențialitate

### Date Salvate

- **Date furnizor**: Numele companiei, CUI, adresă, conturi bancare
- **Template-uri**: Produse și clienți salvați de tine
- **Istoric facturi**: Rezumat facturi (fără linii detaliate)

### Permisiuni Solicitate

1. **Google Sheets API** (`spreadsheets`):
   - Creare spreadsheet-uri noi
   - Citire și scriere date în spreadsheet-uri
   
2. **Google Drive API** (`drive.file`):
   - Creare fișiere în Drive (spreadsheet-uri)
   - Acces doar la fișierele create de aplicație (NU la tot Drive-ul!)

### Recomandări

✅ **Protejează API Key-ul**: Nu-l publica pe GitHub  
✅ **Restricționează accesul**: Folosește restricții de domeniu în Cloud Console  
✅ **Revocă accesul**: Dacă nu mai folosești aplicația, revocă permisiunile  
✅ **Backup manual**: Descarcă periodic spreadsheet-ul (File → Download → Excel)  

---

## Întrebări Frecvente

### Pot folosi același spreadsheet pe mai multe dispozitive?

Da! Conectează-te cu același Spreadsheet ID pe toate dispozitivele.

### Datele sunt criptate?

Datele sunt salvate în Google Sheets fără criptare suplimentară. Google folosește criptare în transport (HTTPS) și în repaus (encryption at rest).

### Pot șterge datele din Google Sheets?

Da, poți șterge oricând rânduri din spreadsheet. Aplicația nu va fi afectată.

### Pot edita manual datele în Google Sheets?

Da! Poți edita orice date direct în Google Sheets. La următoarea sincronizare, aplicația va citi datele actualizate.

### Costă ceva să folosesc Google Sheets API?

Nu, pentru uz personal/mic este gratuit. Google oferă un quota generos (citește/scrie mii de requests pe zi).

### Ce se întâmplă dacă șterge spreadsheet-ul?

Aplicația va afișa eroare la sincronizare. Creează un spreadsheet nou și reconectează-te.

---

## Suport

Dacă întâmpini probleme:

1. Verifică consola browser-ului (F12 → Console) pentru erori
2. Verifică că toate variabilele `.env` sunt setate corect
3. Asigură-te că API-urile sunt activate în Google Cloud Console
4. Contactează echipa de suport pe [contact@normalro.com](mailto:contact@normalro.com)

---

**Versiune**: 1.0  
**Ultima actualizare**: Octombrie 2024  
**Autor**: NormalRO Team

