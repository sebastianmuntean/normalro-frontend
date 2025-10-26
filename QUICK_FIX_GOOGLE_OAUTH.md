# ⚡ FIX RAPID - Google OAuth Error (5 minute)

## 🎯 Eroare

```
Error 400: redirect_uri_mismatch
```

---

## 🔧 Soluție în 5 Pași

### 1️⃣ Deschide Google Cloud Console

🔗 **Link direct:** https://console.cloud.google.com/apis/credentials

**Logare:** samking.at@gmail.com

---

### 2️⃣ Selectează Proiectul

Click pe **dropdown proiect** (sus, lângă "Google Cloud") → Selectează **"normalro"** (sau cum l-ai numit)

---

### 3️⃣ Editează OAuth Client

1. Găsește în listă: **"OAuth 2.0 Client IDs"**

2. Click pe **numele credențialei** (ex: "Web client 1" sau "normalro Frontend")

---

### 4️⃣ Adaugă URIs

**A. Authorized JavaScript origins** (secțiunea 1):

Click **"+ ADD URI"** și adaugă:
```
http://localhost:3000
```

Dacă ai și domeniu în producție, adaugă și:
```
https://normalro.ro
```

**B. Authorized redirect URIs** (secțiunea 2):

Click **"+ ADD URI"** și adaugă (TOATE):
```
http://localhost:3000
http://localhost:3000/
https://normalro.ro
https://normalro.ro/
```

**IMPORTANT:** Adaugă atât **cu** cât și **fără** slash final (`/`)!

---

### 5️⃣ Salvează și Așteaptă

1. Click **"SAVE"** (jos)

2. **Așteaptă 5-10 minute** (Google propagă modificările)

3. **Refresh aplicația** (Ctrl+F5)

4. **Încearcă din nou** să te conectezi la Google Sheets

---

## ✅ Ar trebui să funcționeze!

Dacă vezi popup-ul Google OAuth de autorizare → **Perfect!**

---

## 🚨 Dacă nu funcționează

### Verificare rapidă în Console Browser (F12):

```javascript
// Verifică dacă CLIENT_ID este setat
console.log(process.env.REACT_APP_GOOGLE_CLIENT_ID);
// Ar trebui: "12345678-abcd.apps.googleusercontent.com"

// Verifică dacă API_KEY este setat
console.log(process.env.REACT_APP_GOOGLE_API_KEY);
// Ar trebui: "AIzaSyXXXXXXXXXXXXXXX"
```

Dacă vezi `undefined`:
1. Verifică fișierul `.env` în `_git/normalro-frontend/.env`
2. Restart serverul de dezvoltare (`npm start`)

---

## 📸 Screenshot Configurație Corectă

Ecranul **Edit OAuth client ID** ar trebui să arate așa:

```
┌─────────────────────────────────────────────────┐
│ Edit OAuth client ID                            │
├─────────────────────────────────────────────────┤
│ Client ID: 12345678-abc.apps.googleusercontent  │
│                                                 │
│ Authorized JavaScript origins                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ http://localhost:3000                       │ │
│ │ https://normalro.ro                         │ │
│ └─────────────────────────────────────────────┘ │
│                                       [+ ADD URI] │
│                                                 │
│ Authorized redirect URIs                        │
│ ┌─────────────────────────────────────────────┐ │
│ │ http://localhost:3000                       │ │
│ │ http://localhost:3000/                      │ │
│ │ https://normalro.ro                         │ │
│ │ https://normalro.ro/                        │ │
│ └─────────────────────────────────────────────┘ │
│                                       [+ ADD URI] │
│                                                 │
│                         [CANCEL]  [SAVE]        │
└─────────────────────────────────────────────────┘
```

---

## 🎯 TL;DR (Foarte Scurt)

1. **Google Cloud Console** → **Credentials**
2. **Click pe OAuth Client**
3. **Adaugă URIs:**
   - JavaScript origins: `http://localhost:3000`
   - Redirect URIs: `http://localhost:3000` și `http://localhost:3000/`
4. **Save** → Așteaptă 5-10 min → **Retry**

---

**De obicei se rezolvă în 5 minute! 🚀**

