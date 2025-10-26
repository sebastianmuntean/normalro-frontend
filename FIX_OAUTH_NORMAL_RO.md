# ⚡ FIX URGENT - OAuth Error pentru normal.ro

## ❌ Eroarea Exactă

```
Error 400: redirect_uri_mismatch
origin=https://www.normal.ro
```

## ✅ Soluție IMEDIATĂ

Aplicația ta rulează pe **`https://www.normal.ro`** și acest origin NU este autorizat în Google Cloud Console.

---

## 🚀 Fix în 3 Minute

### Pasul 1: Deschide Google Cloud Console

🔗 **Link direct:** https://console.cloud.google.com/apis/credentials

**Login:** samking.at@gmail.com

---

### Pasul 2: Editează OAuth Client

1. În lista **"OAuth 2.0 Client IDs"**, click pe **credențiala ta**

2. Scroll la **"Authorized JavaScript origins"**

3. Click **"+ ADD URI"**

4. **Adaugă EXACT:**
   ```
   https://www.normal.ro
   ```

5. **Adaugă și (fără www):**
   ```
   https://normal.ro
   ```

6. Scroll la **"Authorized redirect URIs"**

7. Click **"+ ADD URI"** și adaugă:
   ```
   https://www.normal.ro
   https://www.normal.ro/
   https://normal.ro
   https://normal.ro/
   ```

8. Click **"SAVE"**

---

### Pasul 3: Așteaptă și Testează

1. **Așteaptă 5 minute** (Google propagă modificările)

2. **Refresh pagina** (Ctrl+F5 / Cmd+Shift+R)

3. **Încearcă din nou** să te conectezi la Google Sheets

---

## 📋 URIs Complete (Copy-Paste)

### Authorized JavaScript origins:
```
http://localhost:3000
https://normal.ro
https://www.normal.ro
```

### Authorized redirect URIs:
```
http://localhost:3000
http://localhost:3000/
https://normal.ro
https://normal.ro/
https://www.normal.ro
https://www.normal.ro/
```

---

## ⏱️ Timp Estimat

- **Adăugare URIs:** 2 minute
- **Așteptare propagare:** 5-10 minute
- **Total:** ~12 minute

---

## 🎉 Rezultat Așteptat

După fix, când încerci să te conectezi, ar trebui să vezi:

```
┌──────────────────────────────────────┐
│ Choose an account                    │
│                                      │
│ ● samking.at@gmail.com              │
│                                      │
│           [Continue]                 │
└──────────────────────────────────────┘
```

Apoi:

```
┌──────────────────────────────────────────┐
│ normalro Frontend wants to access your  │
│ Google Account                           │
│                                          │
│ ✓ See, edit, create Google Sheets       │
│ ✓ See and download Google Drive files   │
│                                          │
│            [Cancel]  [Allow]             │
└──────────────────────────────────────────┘
```

---

**Succes! 🚀**

