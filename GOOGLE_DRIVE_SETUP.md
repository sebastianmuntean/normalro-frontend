# Configurare Google Drive API

Pentru a activa funcția de **salvare automată** în Google Drive, urmează acești pași:

## 1. Creează un proiect în Google Cloud Console

1. Accesează [Google Cloud Console](https://console.cloud.google.com/)
2. Creează un proiect nou sau selectează unul existent
3. Notează numele proiectului

## 2. Activează Google Drive API

1. În meniul din stânga, mergi la **APIs & Services** → **Library**
2. Caută "Google Drive API"
3. Click pe **Enable**

## 3. Creează credențiale OAuth 2.0

1. Mergi la **APIs & Services** → **Credentials**
2. Click pe **Create Credentials** → **OAuth client ID**
3. Dacă este prima dată, vei fi rugat să configurezi "OAuth consent screen":
   - User Type: **External**
   - App name: `normal.ro Tools` ⚠️ **IMPORTANT: NU folosi "n8n" sau alt nume greșit!**
   - User support email: email-ul tău
   - Application home page: `https://normal.ro` (sau domeniul tău)
   - Application privacy policy link: `https://normal.ro/privacy-policy` ✅
   - Application terms of service link: `https://normal.ro/terms-of-service` ✅
   - Developer contact: email-ul tău
   - Click **Save and Continue**
   - Scopes: Nu adăuga nimic specific (folosim scope-uri standard)
   - Test users: Adaugă email-ul tău pentru testare
   
   **Dacă ai deja configurat OAuth consent screen cu numele greșit (ex: n8n):**
   - Mergi la **APIs & Services** → **OAuth consent screen**
   - Click pe **EDIT APP**
   - Schimbă "App name" la `normal.ro Tools` sau alt nume preferat
   - Adaugă link-urile pentru Privacy Policy și Terms of Service
   - Click **Save and Continue** prin toți pașii
   - Așteaptă 5-10 minute pentru propagarea modificărilor
4. Revino la **Credentials** și creează **OAuth client ID**:
   - Application type: **Web application**
   - Name: `normal.ro Frontend`
   - Authorized JavaScript origins:
     - `http://localhost:3000` (pentru development)
     - `https://normal.ro` (pentru production - înlocuiește cu domeniul tău)
   - Authorized redirect URIs:
     - `http://localhost:3000` (pentru development)
     - `https://normal.ro` (pentru production)
   - Click **Create**

## 4. Copiază Client ID

1. După creare, vei primi un **Client ID** (ceva de genul: `123456789-abc123.apps.googleusercontent.com`)
2. **Copiază acest Client ID**

## 5. Configurează aplicația

### Development (Local):

Creează fișierul `.env` în directorul `_git/normalro-frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=PASTE-YOUR-CLIENT-ID-HERE
```

### Production (Vercel):

1. Mergi în setările proiectului Vercel
2. Accesează **Settings** → **Environment Variables**
3. Adaugă variabila:
   - Name: `REACT_APP_GOOGLE_CLIENT_ID`
   - Value: Client ID-ul tău
   - Click **Save**

## 6. Redeploy aplicația

- **Local**: Restart-ează serverul development (`npm start`)
- **Production**: Redeploy proiectul pe Vercel

## 7. Testare

1. Deschide generatorul de facturi
2. Click pe **"Salvează PDF în Drive"** sau **"Salvează Excel în Drive"**
3. Ar trebui să apară un popup de la Google care cere autorizare
4. Acceptă permisiunile cerute
5. Fișierul va fi salvat automat în Google Drive!

## Troubleshooting

### "Google Drive nu este configurat"
- Verifică că `REACT_APP_GOOGLE_CLIENT_ID` este setat corect în `.env`
- Restart-ează serverul după modificarea `.env`

### "Autorizare refuzată"
- Asigură-te că ai acceptat permisiunile în popup-ul Google
- Verifică că email-ul tău este adăugat ca "test user" în OAuth consent screen

### "Redirect URI mismatch"
- Verifică că URL-ul din browser matches exact cu "Authorized JavaScript origins" din Google Console
- Include protocolul (http/https), hostname și portul exact

### "API not enabled"
- Verifică că Google Drive API este activat în Google Cloud Console

## Securitate

- **Nu partaja** Client ID-ul public în repository-uri publice dacă aplicația nu este încă publicată
- După publicare, Client ID-ul poate fi public (este safe să fie în frontend)
- **Niciodată** nu partaja Client Secret (nu este necesar pentru aplicații frontend)

## Permisiuni cerute

Aplicația cere doar permisiunea:
- `https://www.googleapis.com/auth/drive.file` - permite aplicației să creeze și să acceseze DOAR fișierele pe care le-a creat ea însăși, nu toate fișierele din Drive

## Cost

Google Drive API este **gratuită** pentru majoritatea utilizărilor:
- 1 miliard de request-uri/zi (quota gratuită)
- Perfect pentru această aplicație!

---

## Publicare aplicație (Pentru acces public)

Dacă vrei ca oricine să folosească funcția Google Drive (nu doar test users):

### Pasul 1: Publish App (Publicare fără verificare)

1. În **OAuth consent screen** → Click **"PUBLISH APP"**
2. Click **"CONFIRM"** în dialog
3. **Status** se va schimba de la "Testing" la "In production"

**Rezultat:**
- ✅ Oricine poate folosi aplicația
- ⚠️ Utilizatorii vor vedea warning: "Google hasn't verified this app"
- ⚠️ Trebuie să click-eze "Advanced" → "Continue to normal.ro (unsafe)"
- Limită: 100 utilizatori concurrent

### Pasul 2: Verificare oficială Google (Opțional, recomandat)

Pentru a elimina warning-ul și a avea acces unlimited:

1. În **OAuth consent screen** → Click **"PREPARE FOR VERIFICATION"**
2. Completează informațiile necesare:

**Required URLs:**
- **Homepage URL**: `https://normal.ro` (sau domeniul tău)
- **Privacy Policy URL**: `https://normal.ro/privacy-policy`
- **Terms of Service URL**: `https://normal.ro/terms-of-service`

**Documentation needed:**
- Video demo (2-3 minute) care arată:
  - Cum funcționează aplicația
  - De ce ai nevoie de permisiunea Google Drive
  - Cum sunt folosite datele utilizatorilor
- Justificare scrisă pentru permisiunea `drive.file`

**Justificare exemplu pentru drive.file:**
```
Aplicația normal.ro oferă un generator de facturi care permite utilizatorilor să 
salveze automat facturile generate (PDF/Excel) direct în Google Drive-ul lor personal 
pentru backup și arhivare. Folosim permisiunea 'drive.file' care permite aplicației 
să creeze fișiere noi în Drive-ul utilizatorului, fără a avea acces la alte fișiere 
existente. Această funcție este opțională și necesită consimțământ explicit de la 
utilizator prin click pe butonul "Salvează în Drive".
```

3. **Trimite pentru review**
4. **Așteaptă aprobare**: 1-6 săptămâni

### URL-uri disponibile:

Paginile au fost create și sunt disponibile la:
- Privacy Policy: `https://normal.ro/privacy-policy`
- Terms of Service: `https://normal.ro/terms-of-service`

Acestea trebuie introduse în OAuth consent screen la "App information" → "Application home page", "Privacy policy link" și "Terms of service link".

