# 🔧 FIX: Google OAuth Error 400 - redirect_uri_mismatch

## ❌ Eroarea

```
Error 400: redirect_uri_mismatch
Access blocked: normalro Frontend's request is invalid
```

Această eroare apare când **URL-ul aplicației tale** nu este în lista de **Redirect URIs autorizate** din Google Cloud Console.

---

## ✅ Soluție Rapidă (Pas cu Pas)

### Pasul 1: Identifică URL-ul curent al aplicației

Verifică în browser unde rulează aplicația:

**Dezvoltare (localhost):**
```
http://localhost:3000
```

**Producție (domain real):**
```
https://normalro.ro
https://www.normalro.ro
https://normalro.vercel.app
```

---

### Pasul 2: Mergi la Google Cloud Console

1. Deschide: **https://console.cloud.google.com/**

2. **Selectează proiectul tău** (normalro sau cum îl numești)
   - Click pe dropdown-ul de proiecte (sus, lângă logo Google Cloud)
   - Selectează proiectul corect

---

### Pasul 3: Găsește Credențialele OAuth

1. **Meniu lateral** → **APIs & Services** → **Credentials**

   Sau direct: https://console.cloud.google.com/apis/credentials

2. Caută în lista de **OAuth 2.0 Client IDs**

3. Găsește credențiala care începe cu Client ID-ul tău (verifică în `.env`)

4. **Click pe credențială** (pe numele ei)

---

### Pasul 4: Adaugă Redirect URIs Autorizate

Se deschide ecranul de editare credențiale:

1. Scroll jos până la secțiunea **"Authorized redirect URIs"**

2. **Click pe "Add URI"**

3. **Adaugă aceste URI-uri** (toate, pentru compatibilitate maximă):

   **Pentru Dezvoltare:**
   ```
   http://localhost:3000
   http://localhost:3000/
   http://127.0.0.1:3000
   http://127.0.0.1:3000/
   ```

   **Pentru Producție (înlocuiește cu domeniul tău):**
   ```
   https://normalro.ro
   https://normalro.ro/
   https://www.normalro.ro
   https://www.normalro.ro/
   https://normalro.vercel.app
   https://normalro.vercel.app/
   ```

   **IMPORTANT:** Adaugă atât versiunea **cu** cât și **fără** slash final (`/`)!

4. **Click "Save"** (jos)

---

### Pasul 5: Adaugă și Authorized JavaScript Origins

În aceeași pagină de credențiale:

1. Caută secțiunea **"Authorized JavaScript origins"**

2. **Click pe "Add URI"**

3. **Adaugă aceste URI-uri**:

   **Pentru Dezvoltare:**
   ```
   http://localhost:3000
   http://127.0.0.1:3000
   ```

   **Pentru Producție:**
   ```
   https://normalro.ro
   https://www.normalro.ro
   https://normalro.vercel.app
   ```

   **IMPORTANT:** Pentru origins, **NU adăuga** slash final!

4. **Click "Save"**

---

### Pasul 6: Așteaptă 5-10 minute

Schimbările în Google Cloud Console nu sunt instant. **Așteaptă 5-10 minute** și apoi:

1. **Refresh aplicația** (Ctrl+F5 / Cmd+Shift+R)
2. **Șterge cache-ul browser** (opțional dar recomandat)
3. **Încearcă din nou** să te conectezi la Google Sheets

---

## 🎯 Configurare Completă Recomandată

### Ecran "Edit OAuth 2.0 Client ID"

**1. Authorized JavaScript origins:**
```
http://localhost:3000
http://127.0.0.1:3000
https://normalro.ro
https://www.normalro.ro
https://normalro.vercel.app
```

**2. Authorized redirect URIs:**
```
http://localhost:3000
http://localhost:3000/
http://127.0.0.1:3000
http://127.0.0.1:3000/
https://normalro.ro
https://normalro.ro/
https://www.normalro.ro
https://www.normalro.ro/
https://normalro.vercel.app
https://normalro.vercel.app/
```

**3. Click "SAVE"**

---

## 🔍 Verificare Configurație

### Verifică .env

Deschide `_git/normalro-frontend/.env` și verifică:

```bash
REACT_APP_GOOGLE_CLIENT_ID=12345678-abcdefg.apps.googleusercontent.com
REACT_APP_GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Verificări:**
- ✅ CLIENT_ID se termină cu `.apps.googleusercontent.com`
- ✅ API_KEY începe cu `AIzaSy`
- ✅ Nu conține spații sau ghilimele în plus
- ✅ Fișierul `.env` este în folderul corect (`_git/normalro-frontend/`)

---

### Verifică consola browser

Deschide **Developer Tools** (F12) → **Console** și caută:

```
✅ Google Sheets API inițializat
✅ Google Identity Services inițializat
```

Dacă vezi erori:
```
❌ Google Client ID nu este configurat
❌ Google API nu este încărcat
```

---

## 🚨 Probleme Frecvente

### Problemă 1: "Eroarea persistă după 10 minute"

**Soluție:**
1. Șterge **toate cache-urile browser** (Ctrl+Shift+Del)
2. Închide **toate tab-urile** aplicației
3. **Reîncearcă** într-un tab nou (incognito opțional)

---

### Problemă 2: "Nu găsesc proiectul în Google Cloud Console"

**Soluție:**
1. Verifică că ești logat cu contul corect (`samking.at@gmail.com`)
2. Creează un proiect nou dacă nu există:
   - Click **"Select a project"** → **"New Project"**
   - Nume: `normalro` sau `normalro-frontend`
   - Click **"Create"**

---

### Problemă 3: "Nu am OAuth 2.0 Client ID"

**Soluție: Creează credențiale noi**

1. **APIs & Services** → **Credentials**

2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**

3. **Application type:** `Web application`

4. **Name:** `normalro Frontend` (sau altceva)

5. **Authorized JavaScript origins:**
   - Click **"+ ADD URI"**
   - Adaugă: `http://localhost:3000`
   - Adaugă: `https://normalro.ro` (domeniul tău)

6. **Authorized redirect URIs:**
   - Click **"+ ADD URI"**
   - Adaugă: `http://localhost:3000`
   - Adaugă: `http://localhost:3000/`
   - Adaugă: `https://normalro.ro`
   - Adaugă: `https://normalro.ro/`

7. Click **"CREATE"**

8. **Copiază Client ID** și actualizează în `.env`:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=[CLIENT_ID_AICI]
   ```

9. **Restart aplicația** (npm start)

---

### Problemă 4: "Google Sheets API nu este activat"

**Soluție:**

1. **APIs & Services** → **Library**

2. Caută: `Google Sheets API`

3. Click pe **Google Sheets API**

4. Click **"ENABLE"**

5. Repetă pentru: `Google Drive API` (dacă folosești și Drive)

---

## 📝 Checklist Complet

Bifează fiecare pas pe măsură ce îl completezi:

- [ ] Am identificat URL-ul aplicației (localhost:3000 sau domeniu)
- [ ] Am deschis Google Cloud Console
- [ ] Am selectat proiectul corect
- [ ] Am găsit credențialele OAuth 2.0
- [ ] Am adăugat JavaScript origins (fără `/`)
- [ ] Am adăugat Redirect URIs (cu și fără `/`)
- [ ] Am salvat modificările
- [ ] Am așteptat 5-10 minute
- [ ] Am șters cache-ul browser
- [ ] Am reîncărcat aplicația (Ctrl+F5)
- [ ] Am încercat din nou să mă conectez

---

## 🎯 Template Copy-Paste pentru URIs

### JavaScript Origins (copy toate):

```
http://localhost:3000
http://127.0.0.1:3000
https://normalro.ro
https://www.normalro.ro
https://normalro.vercel.app
```

### Redirect URIs (copy toate):

```
http://localhost:3000
http://localhost:3000/
http://127.0.0.1:3000
http://127.0.0.1:3000/
https://normalro.ro
https://normalro.ro/
https://www.normalro.ro
https://www.normalro.ro/
https://normalro.vercel.app
https://normalro.vercel.app/
```

**Înlocuiește `normalro.ro` cu domeniul tău real!**

---

## 🔄 După Rezolvare

Când eroarea dispare, ar trebui să vezi:

1. **Popup Google OAuth:**
   ```
   Choose an account
   samking.at@gmail.com
   [Continue]
   ```

2. **Permisiuni:**
   ```
   normalro Frontend wants to access your Google Account
   
   ✓ See and download your Google Drive files
   ✓ See, edit, create Google Sheets
   
   [Allow] [Cancel]
   ```

3. **Success:**
   ```
   ✅ Spreadsheet creat cu succes!
   ```

---

## 📞 Support

Dacă problema persistă după toți acești pași:

1. **Trimite screenshot** cu:
   - Pagina de credențiale din Google Cloud Console (secțiunea Redirect URIs)
   - Consola browser (F12) cu erori
   - Fișierul `.env` (ASCUNDE Client ID/API Key!)

2. **Verifică logs în consola browser:**
   ```javascript
   console.log('CLIENT_ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
   console.log('API_KEY:', process.env.REACT_APP_GOOGLE_API_KEY);
   ```

3. **Contactează suport tehnic** cu detaliile de mai sus

---

## 🎉 Rezumat

**Cauza:** Google blochează cererea pentru că URL-ul `http://localhost:3000` (sau domeniul tău) nu este în lista autorizată.

**Soluție:** Adaugă URL-ul în **Authorized redirect URIs** și **Authorized JavaScript origins** din Google Cloud Console.

**Timp estimat:** 5-15 minute (inclusiv așteptare propagare)

---

**Mult succes! Urmează pașii și ar trebui să funcționeze! 🚀**


