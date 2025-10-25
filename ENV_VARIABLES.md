# Environment Variables Configuration

Acest document descrie toate variabilele de mediu necesare pentru aplicația NormalRO Invoice Generator.

---

## 📋 Lista Completă Variabile .env

```env
# ====================
# GENERAL SETTINGS
# ====================

# Default TVA rate (%)
# Folosit ca valoare inițială pentru cota de TVA în facturi
REACT_APP_DEFAULT_TVA=19

# ====================
# BACKEND API
# ====================

# Backend URL for ANAF API calls
# URL-ul backend-ului pentru căutarea datelor companiilor în ANAF
REACT_APP_BACKEND_URL=http://localhost:5000

# Pentru producție:
# REACT_APP_BACKEND_URL=https://api.normalro.com

# ====================
# GOOGLE CLOUD PLATFORM
# ====================

# Google OAuth 2.0 Client ID
# Necesar pentru: Google Drive upload, Google Sheets sync
# Obține din: https://console.cloud.google.com/apis/credentials
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Google API Key
# Necesar pentru: Google Sheets API, Google Drive API
# Obține din: https://console.cloud.google.com/apis/credentials
REACT_APP_GOOGLE_API_KEY=your-api-key

# ====================
# EXAMPLE PRODUCTION VALUES
# ====================

# REACT_APP_DEFAULT_TVA=19
# REACT_APP_BACKEND_URL=https://backend.normalro.com
# REACT_APP_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
# REACT_APP_GOOGLE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz
```

---

## 🔧 Setup Instructions

### 1. Creează fișierul .env

```bash
cd normalro-frontend
touch .env
```

Sau pe Windows:
```cmd
cd normalro-frontend
type nul > .env
```

### 2. Copiază template-ul

Copiază conținutul de mai sus în `.env` și înlocuiește valorile placeholder cu cele reale.

### 3. Obține credențialele Google

Urmează ghidul: `GOOGLE_SHEETS_SETUP.md` sau `GOOGLE_DRIVE_SETUP.md`

### 4. Restart aplicația

```bash
npm start
```

---

## 📖 Descriere Detaliată Variabile

### REACT_APP_DEFAULT_TVA

**Tip**: Number (ca string)  
**Valori posibile**: `0`, `5`, `9`, `19`, `21`, etc.  
**Default**: `19`

**Descriere**: Cota de TVA implicită folosită la crearea unei linii noi în factură. Utilizatorii pot modifica manual cota pentru fiecare linie.

**Exemple**:
```env
# România (TVA standard)
REACT_APP_DEFAULT_TVA=19

# România (TVA redus alimentar)
REACT_APP_DEFAULT_TVA=9

# România (TVA scutit)
REACT_APP_DEFAULT_TVA=0

# UE - alte țări
REACT_APP_DEFAULT_TVA=21  # Belgia, Olanda
REACT_APP_DEFAULT_TVA=20  # Austria, UK (post-Brexit)
```

---

### REACT_APP_BACKEND_URL

**Tip**: String (URL)  
**Format**: `http(s)://domain:port` (fără trailing slash)  
**Default**: `http://localhost:5000`

**Descriere**: URL-ul backend-ului FastAPI/Flask care oferă API-ul pentru căutarea datelor companiilor în baza de date ANAF.

**Exemple**:
```env
# Development (local)
REACT_APP_BACKEND_URL=http://localhost:5000

# Development (Docker)
REACT_APP_BACKEND_URL=http://backend:5000

# Staging
REACT_APP_BACKEND_URL=https://staging-api.normalro.com

# Production
REACT_APP_BACKEND_URL=https://api.normalro.com
```

**⚠️ Important**:
- NU adăuga `/` la final
- Backend-ul trebuie să aibă CORS configurat pentru frontend-ul tău
- Verifică că backend-ul rulează și răspunde la health check

**Endpoints folosite**:
- `GET /api/anaf/:cui` - Căutare companie după CUI

---

### REACT_APP_GOOGLE_CLIENT_ID

**Tip**: String (OAuth 2.0 Client ID)  
**Format**: `{numbers}-{random}.apps.googleusercontent.com`  
**Obligatoriu pentru**: Google Drive, Google Sheets

**Descriere**: Client ID pentru autentificare OAuth 2.0 cu Google. Permite utilizatorilor să autorizeze aplicația să acceseze Google Drive și Google Sheets în numele lor.

**Cum se obține**:
1. Accesează [Google Cloud Console](https://console.cloud.google.com/)
2. Creează proiect nou
3. Activează Google Drive API + Google Sheets API
4. APIs & Services → Credentials
5. Create Credentials → OAuth client ID
6. Application type: Web application
7. Authorized JavaScript origins:
   - `http://localhost:3000` (dev)
   - `https://normalro.com` (production)
8. Copiază Client ID generat

**Exemplu**:
```env
REACT_APP_GOOGLE_CLIENT_ID=123456789-abc123def456ghi789jkl.apps.googleusercontent.com
```

**⚠️ Securitate**:
- Restricționează în Google Cloud Console (HTTP referrers)
- NU partaja public Client ID-ul (deși nu e secret, e bine să-l protejezi)
- Revocă și regenerează dacă suspecți compromitere

---

### REACT_APP_GOOGLE_API_KEY

**Tip**: String (API Key)  
**Format**: `AIzaSy{random_characters}`  
**Obligatoriu pentru**: Google Sheets API (citire/scriere)

**Descriere**: API Key pentru accesarea Google Sheets API fără autentificare OAuth pentru anumite operațiuni publice. În cazul nostru, e folosit împreună cu OAuth pentru acces complet la Sheets.

**Cum se obține**:
1. Accesează [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials
3. Create Credentials → API Key
4. Copiază API Key generat
5. (Opțional) Edit API Key:
   - Application restrictions: HTTP referrers
   - Website restrictions: `https://normalro.com/*`
   - API restrictions: Google Sheets API, Google Drive API

**Exemplu**:
```env
REACT_APP_GOOGLE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz123456
```

**⚠️ Securitate**:
- **OBLIGATORIU**: Restricționează în Google Cloud Console
- Setează HTTP referrers (doar domeniul tău)
- Setează API restrictions (doar Sheets + Drive)
- Monitorizează usage în Cloud Console
- Regenerează periodic (best practice)

---

## 🔐 Securitate și Best Practices

### 1. .gitignore

Asigură-te că `.env` este în `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.production
```

**✅ Verificare**:
```bash
git check-ignore .env
# Ar trebui să returneze: .env
```

### 2. Variabile Publice vs Private

**⚠️ IMPORTANT**: Toate variabilele `REACT_APP_*` sunt **publice** (vizibile în browser)!

- ✅ OK pentru: Client IDs, API Keys (restricționate)
- ❌ NU pune: Parole, secret keys, private keys, tokens

### 3. Restricții Google API

**API Key restricții**:
```
Application restrictions:
  ✅ HTTP referrers (web sites)
    - https://normalro.com/*
    - https://*.normalro.com/*
    - http://localhost:3000/* (doar dev)

API restrictions:
  ✅ Restrict key
    - Google Sheets API
    - Google Drive API
```

**OAuth Client ID restricții**:
```
Authorized JavaScript origins:
  - http://localhost:3000 (development)
  - https://normalro.com (production)

Authorized redirect URIs:
  (lasă gol pentru JavaScript apps)
```

### 4. Separare Environmente

Folosește fișiere `.env` diferite pentru fiecare mediu:

```bash
# Development
.env.development

# Staging
.env.staging

# Production
.env.production
```

**Încărcare automată** (React):
```bash
# Development
npm start
# Încarcă automat .env.development

# Production
npm run build
# Încarcă automat .env.production
```

---

## 🧪 Testare Configurare

### 1. Verifică variabilele încărcate

```javascript
// În browser console (F12)
console.log(process.env.REACT_APP_DEFAULT_TVA);
console.log(process.env.REACT_APP_BACKEND_URL);
console.log(process.env.REACT_APP_GOOGLE_CLIENT_ID);
console.log(process.env.REACT_APP_GOOGLE_API_KEY);

// Ar trebui să afișeze valorile din .env
```

### 2. Test Backend Connection

```javascript
// În browser console
fetch(process.env.REACT_APP_BACKEND_URL + '/api/health')
  .then(r => r.json())
  .then(data => console.log('Backend OK:', data))
  .catch(err => console.error('Backend ERROR:', err));
```

### 3. Test Google APIs

Deschide Invoice Generator și verifică:
- ✅ Apare card "Google Sheets"
- ✅ Nu apar erori în console legate de Google
- ✅ Click "Crează Spreadsheet Nou" funcționează

---

## ❓ Troubleshooting

### ❌ Variabilele nu se încarcă

**Cauze posibile**:
- Fișierul `.env` nu e în directorul corect
- Numele variabilei nu începe cu `REACT_APP_`
- Nu ai făcut restart după modificarea `.env`

**Soluție**:
```bash
# 1. Verifică locația .env
ls -la | grep .env

# 2. Verifică conținutul
cat .env

# 3. Restart aplicația
npm start
```

### ❌ Google API Error: "API key not valid"

**Cauze**:
- API Key greșit în `.env`
- API Key restricționat prea strict
- Google Sheets API nu e activat

**Soluție**:
1. Verifică că API Key-ul din `.env` e corect
2. În Google Cloud Console → Credentials → API Key:
   - Verifică că e activ
   - Verifică restricțiile (HTTP referrers include localhost)
3. APIs & Services → Library:
   - Verifică că Google Sheets API e enabled

### ❌ OAuth Error: "redirect_uri_mismatch"

**Cauză**: Authorized JavaScript origins nu include URL-ul tău

**Soluție**:
1. Google Cloud Console → Credentials → OAuth Client ID
2. Authorized JavaScript origins:
   - Adaugă `http://localhost:3000` (dev)
   - Adaugă `https://normalro.com` (production)
3. Salvează și așteaptă 5 minute pentru propagare

---

## 📚 Resurse Utile

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [OAuth 2.0 for Web Apps](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)
- [Create React App - Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)

---

## 📞 Suport

Probleme cu configurarea? Contactează-ne:

- 📧 Email: contact@normalro.com
- 📖 Documentație: `GOOGLE_SHEETS_SETUP.md`
- 🐛 Issues: GitHub Issues

---

**Ultima actualizare**: Octombrie 2024  
**Versiune documentație**: 1.0

