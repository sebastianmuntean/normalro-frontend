# ✅ Google Sheets Integration - Checklist Setup

Folosește acest checklist pentru a verifica că tot setup-ul este corect.

---

## 📋 Pre-Setup

- [ ] Am cont Google activ
- [ ] Am acces la Google Cloud Console
- [ ] Am Node.js și npm instalate
- [ ] Am clonat repository-ul normalro
- [ ] Pot accesa aplicația local (`npm start`)

---

## 🔧 Google Cloud Console Setup

### Creare Proiect

- [ ] Am accesat [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Am creat proiect nou: "NormalRO Invoice" (sau alt nume)
- [ ] Am selectat proiectul creat

### Activare API-uri

- [ ] Am accesat "APIs & Services" → "Library"
- [ ] Am căutat și activat "Google Sheets API"
- [ ] Am verificat că status-ul este "Enabled" (verde)
- [ ] Am căutat și activat "Google Drive API"
- [ ] Am verificat că status-ul este "Enabled" (verde)

### Creare API Key

- [ ] Am accesat "APIs & Services" → "Credentials"
- [ ] Am clickat "+ CREATE CREDENTIALS" → "API Key"
- [ ] Am copiat API Key-ul generat și l-am salvat temporar
- [ ] (Opțional) Am clickat "Edit API Key" pentru restricții:
  - [ ] Application restrictions → HTTP referrers
  - [ ] Am adăugat `http://localhost:3000/*`
  - [ ] Am adăugat `https://normalro.com/*` (sau domeniul meu)
  - [ ] API restrictions → Restrict key
  - [ ] Am selectat "Google Sheets API"
  - [ ] Am selectat "Google Drive API"
  - [ ] Am clickat "Save"

### Configurare OAuth Consent Screen

- [ ] Am accesat "APIs & Services" → "OAuth consent screen"
- [ ] Am selectat "External" (sau "Internal" dacă am Google Workspace)
- [ ] Am completat:
  - [ ] App name: "NormalRO Invoice Generator"
  - [ ] User support email: (email-ul meu)
  - [ ] Developer contact email: (email-ul meu)
- [ ] Am clickat "Save and Continue"
- [ ] În secțiunea Scopes:
  - [ ] Am clickat "Add or Remove Scopes"
  - [ ] Am căutat și selectat: `.../auth/spreadsheets`
  - [ ] Am căutat și selectat: `.../auth/drive.file`
  - [ ] Am clickat "Update"
  - [ ] Am clickat "Save and Continue"
- [ ] În secțiunea Test users:
  - [ ] Am adăugat email-ul meu ca test user
  - [ ] Am clickat "Save and Continue"
- [ ] Am clickat "Back to Dashboard"

### Creare OAuth Client ID

- [ ] Am revenit la "APIs & Services" → "Credentials"
- [ ] Am clickat "+ CREATE CREDENTIALS" → "OAuth client ID"
- [ ] Am selectat Application type: "Web application"
- [ ] Am completat:
  - [ ] Name: "NormalRO Invoice Web Client"
  - [ ] Authorized JavaScript origins:
    - [ ] Am adăugat: `http://localhost:3000`
    - [ ] Am adăugat: `https://normalro.com` (sau domeniul meu)
  - [ ] Authorized redirect URIs: (am lăsat gol)
- [ ] Am clickat "Create"
- [ ] Am copiat Client ID-ul generat și l-am salvat temporar

---

## 💾 Configurare Aplicație

### Fișier .env

- [ ] Am navigat în directorul `normalro-frontend/`
- [ ] Am creat fișierul `.env` (dacă nu există)
- [ ] Am adăugat următoarele linii:
  ```env
  REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
  REACT_APP_GOOGLE_API_KEY=your-api-key
  ```
- [ ] Am înlocuit `your-client-id...` cu Client ID-ul meu real
- [ ] Am înlocuit `your-api-key` cu API Key-ul meu real
- [ ] Am salvat fișierul `.env`

### Verificare .gitignore

- [ ] Am verificat că `.env` este în `.gitignore`
- [ ] ⚠️ **NU** am commitit `.env` pe Git

### Restart Aplicație

- [ ] Am oprit serverul de development (Ctrl+C)
- [ ] Am rulat din nou: `npm start`
- [ ] Aplicația s-a reîncărcat fără erori

---

## 🧪 Testare Funcționalitate

### Verificare Inițializare

- [ ] Am deschis Invoice Generator în browser
- [ ] Am deschis Console-ul browser-ului (F12 → Console)
- [ ] Am verificat că nu apar erori legate de Google API
- [ ] Am căutat în pagină cardul "Google Sheets"
- [ ] Cardul apare și afișează "⚠️ Google Sheets Neconectat"

### Test: Creare Spreadsheet Nou

- [ ] Am clickat butonul "Crează Spreadsheet Nou"
- [ ] S-a deschis popup-ul Google pentru autorizare
- [ ] Am selectat contul meu Google
- [ ] Am verificat permisiunile solicitate:
  - [ ] "See, edit, create, and delete only the specific Google Drive files you use with this app"
  - [ ] "See, edit, create, and delete all your Google Sheets spreadsheets"
- [ ] Am clickat "Allow"
- [ ] Am primit mesaj de succes cu Spreadsheet ID
- [ ] S-a deschis spreadsheet-ul în Google Sheets (tab nou)
- [ ] Spreadsheet-ul conține 4 sheet-uri:
  - [ ] Date Furnizor
  - [ ] Template Produse
  - [ ] Template Clienți
  - [ ] Istoric Facturi
- [ ] Fiecare sheet are header-e formatate (bold, albastru)
- [ ] În aplicație, cardul acum arată "✅ Google Sheets Conectat"
- [ ] Se afișează Spreadsheet ID-ul

### Test: Salvare Date Furnizor

- [ ] În Invoice Generator, am completat datele furnizorului:
  - [ ] Serie: "FAC"
  - [ ] Număr: "001"
  - [ ] Nume furnizor: (un nume de test)
  - [ ] CUI: (un CUI de test)
- [ ] Am bifat "Sunt de acord cu salvarea datelor..."
- [ ] Am clickat "Descarcă PDF"
- [ ] PDF-ul s-a descărcat cu succes
- [ ] Am verificat în Console: mesaj "✅ Date furnizor salvate în Google Sheets"
- [ ] Am deschis spreadsheet-ul în Google Sheets
- [ ] Am verificat sheet-ul "Date Furnizor":
  - [ ] Rândul 2 conține datele completate
  - [ ] Serie = "FAC"
  - [ ] Număr = "001"
  - [ ] Nume = (numele completat)

### Test: Template Produse

- [ ] Am clickat butonul "Produse" (în secțiunea Linii factură)
- [ ] Am creat un template nou:
  - [ ] Denumire: "Servicii consultanță IT"
  - [ ] Preț: "500"
  - [ ] TVA: "19"
- [ ] Am salvat template-ul
- [ ] Am deschis spreadsheet-ul în Google Sheets
- [ ] Am verificat sheet-ul "Template Produse":
  - [ ] Apare un rând nou cu produsul salvat
  - [ ] Datele sunt corecte

### Test: Sincronizare Manuală

- [ ] În Invoice Generator, am clickat "Sincronizare Manuală"
- [ ] Am primit mesaj de succes cu statistici:
  - [ ] "Date furnizor: salvate"
  - [ ] "Template produse: X salvate"
  - [ ] "Template clienți: Y salvate"
- [ ] Nu au apărut erori în Console

### Test: Deconectare și Reconectare

- [ ] Am clickat "Deconectează"
- [ ] Cardul acum arată "⚠️ Google Sheets Neconectat"
- [ ] Am copiat Spreadsheet ID-ul (din Google Sheets URL)
- [ ] Am clickat "Conectează Spreadsheet Existent"
- [ ] Am lipit Spreadsheet ID-ul
- [ ] Am clickat "Conectează"
- [ ] Conexiunea a reușit
- [ ] Cardul arată din nou "✅ Google Sheets Conectat"
- [ ] Datele sunt încă în spreadsheet

---

## 🔒 Verificare Securitate

### Restricții API Key

- [ ] Am accesat Google Cloud Console → Credentials → API Key
- [ ] Am verificat că are restricții setate (HTTP referrers)
- [ ] Am verificat că include doar API-urile necesare (Sheets + Drive)

### Permisiuni OAuth

- [ ] Am accesat [Google Account Permissions](https://myaccount.google.com/permissions)
- [ ] Am verificat că aplicația "NormalRO Invoice Generator" apare în listă
- [ ] Am verificat permisiunile acordate (Sheets + Drive)

### Fișier .env

- [ ] Am verificat că `.env` NU este în repository-ul Git
- [ ] Am rulat: `git status` și `.env` nu apare
- [ ] (Opțional) Am creat `.env.example` cu valori placeholder

---

## 🐛 Troubleshooting (dacă ceva nu funcționează)

### ❌ Cardul "Google Sheets" nu apare

**Verificări**:
- [ ] Variabilele în `.env` sunt corecte (fără spații, fără ghilimele)
- [ ] Am făcut restart la `npm start` după modificarea `.env`
- [ ] Console browser-ului nu arată erori JavaScript

**Soluție**:
```bash
# Verifică variabilele încărcate
# În browser console (F12):
console.log(process.env.REACT_APP_GOOGLE_CLIENT_ID);
console.log(process.env.REACT_APP_GOOGLE_API_KEY);

# Ar trebui să afișeze valorile, nu undefined
```

### ❌ Eroare: "API key not valid"

**Verificări**:
- [ ] API Key-ul din `.env` este corect
- [ ] Google Sheets API este activat în Cloud Console
- [ ] Restricțiile API Key permit domeniul meu

**Soluție**:
- Verifică Cloud Console → Credentials → API Key → Edit
- Asigură-te că HTTP referrers include `http://localhost:3000/*`
- Verifică API restrictions - trebuie să includă Google Sheets API

### ❌ Eroare: "redirect_uri_mismatch"

**Verificări**:
- [ ] Authorized JavaScript origins include `http://localhost:3000`

**Soluție**:
- Google Cloud Console → Credentials → OAuth Client ID → Edit
- Adaugă `http://localhost:3000` în Authorized JavaScript origins
- Salvează și așteaptă 5 minute pentru propagare

### ❌ Eroare: "Access blocked: Authorization Error"

**Cauză**: OAuth consent screen nu este configurat corect

**Soluție**:
- APIs & Services → OAuth consent screen
- Adaugă email-ul tău în Test users
- Publishing status trebuie să fie "Testing" (nu "In production")

### ❌ Spreadsheet-ul nu se creează

**Verificări**:
- [ ] Google Drive API este activat
- [ ] Am autorizat aplicația (am clickat "Allow" în popup)

**Soluție**:
- Revocă permisiunile: https://myaccount.google.com/permissions
- Șterge aplicația "NormalRO Invoice Generator"
- Încearcă din nou autorizarea

---

## 📊 Status Final

După completarea tuturor checklist-urilor:

- [ ] ✅ **Setup Google Cloud**: Complet
- [ ] ✅ **Configurare .env**: Complet
- [ ] ✅ **Testare funcționalitate**: Toate testele trec
- [ ] ✅ **Securitate**: Restricții setate corect
- [ ] ✅ **Gata pentru utilizare**: Da!

---

## 🎉 Felicitări!

Dacă ai bifat toate checkbox-urile de mai sus, configurarea este completă! 🎊

**Next Steps**:
1. Folosește aplicația pentru a genera facturi
2. Datele se vor salva automat în Google Sheets
3. Poți accesa spreadsheet-ul de pe orice dispozitiv
4. Poți edita manual datele în Google Sheets dacă e necesar

---

## 📚 Resurse Utile

- **Ghid detaliat setup**: `GOOGLE_SHEETS_SETUP.md`
- **Ghid rapid utilizare**: `QUICK_START_GOOGLE_SHEETS.md`
- **Documentație tehnică**: `GOOGLE_SHEETS_INTEGRATION.md`
- **Configurare variabile**: `ENV_VARIABLES.md`

---

## 📞 Suport

Dacă ai întâmpinat probleme:

1. **Verifică Console browser-ului** (F12 → Console) pentru erori detaliate
2. **Citește secțiunea Troubleshooting** din acest document
3. **Consultă documentația detaliată**: `GOOGLE_SHEETS_SETUP.md`
4. **Contactează suport**: contact@normalro.com

---

**Versiune Checklist**: 1.0  
**Ultima actualizare**: Octombrie 2024  

✨ **Mult succes!** ✨

