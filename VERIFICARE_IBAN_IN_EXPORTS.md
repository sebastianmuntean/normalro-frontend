# ✅ Verificare IBAN în PDF și Excel

## 📋 Ce s-a implementat

IBAN-urile furnizorului și beneficiarului sunt acum incluse automat în exporturile PDF și Excel.

---

## 📄 PDF - Cum apar IBAN-urile

### Structură secțiune Furnizor:
```
FURNIZOR:
Firma SRL
CUI: 12345678
Reg Com: J40/123/2020
Str. Victoriei, Nr. 10
București
Tel: 0721234567                    ← (dacă e completat)
Email: contact@firma.ro            ← (dacă e completat)
IBAN: RO49AAAA1B31007593840000     ← (dacă e completat)
Banca: BCR                         ← (dacă e completat)
```

### Structură secțiune Beneficiar:
```
BENEFICIAR:
Client SRL
CUI: 87654321
Reg Com: J12/456/2018
Str. Libertății, Nr. 5
Cluj-Napoca
Tel: 0723456789                    ← (dacă e completat)
Email: office@client.ro            ← (dacă e completat)
IBAN: RO12BBBB2C42008967120000     ← (dacă e completat)
Banca: Banca Transilvania          ← (dacă e completat)
```

### Condiții afișare:
- ✅ IBAN apare doar dacă `supplierBankAccounts[0].iban` există și nu e gol
- ✅ Banca apare doar dacă `supplierBankAccounts[0].bank` există și nu e gol
- ✅ Telefon apare doar dacă `supplierPhone` există
- ✅ Email apare doar dacă `supplierEmail` există

---

## 📊 Excel - Cum apar IBAN-urile

### Sheet "Factură" - Secțiune Furnizor:
```
FURNIZOR
Nume                 Firma SRL
CUI                  12345678
Reg Com              J40/123/2020
Adresă               Str. Victoriei, Nr. 10
Oraș                 București
Telefon              0721234567
Email                contact@firma.ro
Cont bancar - Banca  BCR                          ← NOU!
Cont bancar - IBAN   RO49AAAA1B31007593840000     ← NOU!
```

### Dacă sunt multiple conturi bancare:
```
Cont bancar 1 - Banca  BCR
Cont bancar 1 - IBAN   RO49AAAA1B31007593840000
Cont bancar 2 - Banca  BT
Cont bancar 2 - IBAN   RO12BBBB2C42008967120000
```

### Sheet "Factură" - Secțiune Beneficiar:
```
BENEFICIAR
Nume                 Client SRL
CUI                  87654321
Reg Com              J12/456/2018
Adresă               Str. Libertății, Nr. 5
Oraș                 Cluj-Napoca
Telefon              0723456789
Email                office@client.ro
Cont bancar - Banca  Banca Transilvania          ← NOU!
Cont bancar - IBAN   RO12BBBB2C42008967120000     ← NOU!
```

---

## 🧪 Cum testezi

### Pasul 1: Completează IBAN-ul furnizorului

1. Deschide InvoiceGenerator
2. În secțiunea **"Furnizor"**, găsește câmpul **"IBAN"**
3. Introdu un IBAN valid: `RO49AAAA1B31007593840000`
4. (Opțional) Completează și **"Bancă"**: `BCR`

### Pasul 2: (Opțional) Completează IBAN-ul beneficiarului

1. În secțiunea **"Beneficiar"**, găsește câmpul **"IBAN"**
2. Introdu un IBAN valid: `RO12BBBB2C42008967120000`
3. (Opțional) Completează și **"Bancă"**: `Banca Transilvania`

### Pasul 3: Generează PDF

1. Click pe butonul **"Descarcă PDF"** (roșu)
2. Deschide PDF-ul descărcat
3. Verifică secțiunea **FURNIZOR** - ar trebui să vezi:
   ```
   IBAN: RO49AAAA1B31007593840000
   Banca: BCR
   ```
4. Verifică secțiunea **BENEFICIAR** (dacă ai completat IBAN-ul)

### Pasul 4: Generează Excel

1. Click pe butonul **"Descarcă Excel"** (verde)
2. Deschide Excel-ul descărcat
3. Verifică secțiunea **FURNIZOR** - ar trebui să vezi:
   ```
   Cont bancar - Banca    BCR
   Cont bancar - IBAN     RO49AAAA1B31007593840000
   ```

---

## 🔍 Debugging

### Problemă: IBAN nu apare în PDF

**Verificări:**

1. **Verifică consola browser** (F12 → Console)
   - Caută erori JavaScript
   - Caută warning-uri despre QR Code

2. **Verifică că IBAN-ul este salvat în state:**
   ```javascript
   // În consola browser, după ce completezi IBAN-ul
   console.log(invoiceData.supplierBankAccounts[0]);
   // Ar trebui să afișeze: { bank: "BCR", iban: "RO49..." }
   ```

3. **Verifică template string-ul:**
   - IBAN-ul ar trebui să apară în HTML-ul generat
   - Deschide PDF-ul și verifică dacă textul "IBAN:" apare

4. **Reîncarcă pagina** (Ctrl+F5 sau Cmd+Shift+R)
   - Modificările recente necesită rebuild/refresh

---

### Problemă: IBAN nu apare în Excel

**Verificări:**

1. **Verifică consola browser** pentru log-ul:
   ```
   ✅ Sheet "Cod QR Plată" adăugat în Excel
   ```

2. **Verifică numărul de rânduri:**
   - Dacă IBAN-ul este completat, secțiunea FURNIZOR ar trebui să aibă 2 rânduri în plus
   - Contează rândurile în Excel

3. **Verifică formatare:**
   ```javascript
   // În consola, după export Excel
   console.log(invoiceData.supplierBankAccounts);
   // Ar trebui: [{ bank: "BCR", iban: "RO49..." }]
   ```

---

## 🚀 Flow complet de testare

### Test 1: Factură completă (PDF + Excel + QR)

**Pași:**

1. Completează furnizor:
   - Nume: `FIRMA MEA SRL`
   - CUI: `12345678`
   - IBAN: `RO49AAAA1B31007593840000`
   - Bancă: `BCR`

2. Completează beneficiar:
   - Nume: `CLIENT PREMIUM SRL`
   - CUI: `87654321`
   - IBAN: `RO12BBBB2C42008967120000`
   - Bancă: `Banca Transilvania`

3. Completează produse:
   - Produs: `Consultanță IT`
   - Cantitate: `1`
   - Preț net: `1000`

4. Click **"Descarcă PDF"**

5. Deschide PDF-ul și verifică:
   - ✅ IBAN furnizor apare în secțiunea FURNIZOR
   - ✅ IBAN client apare în secțiunea BENEFICIAR
   - ✅ Cod QR apare la final (secțiunea "PLATĂ RAPIDĂ CU COD QR")

6. Click **"Descarcă Excel"**

7. Deschide Excel-ul și verifică:
   - ✅ Sheet "Factură" conține IBAN-urile în secțiunile FURNIZOR și BENEFICIAR
   - ✅ Sheet "Cod QR Plată" există (dacă IBAN furnizor e completat)

---

### Test 2: Factură fără IBAN-uri

**Pași:**

1. Completează furnizor FĂRĂ IBAN
2. Completează beneficiar FĂRĂ IBAN
3. Click **"Descarcă PDF"**
4. Verifică PDF-ul:
   - ✅ Nu apare linia "IBAN:" în secțiunile FURNIZOR/BENEFICIAR
   - ✅ Nu apare secțiunea "PLATĂ RAPIDĂ CU COD QR"

5. Click **"Descarcă Excel"**
6. Verifică Excel-ul:
   - ✅ Nu apar rânduri "Cont bancar - IBAN"
   - ✅ Nu există sheet "Cod QR Plată"

---

## 📝 Cod implementat

### PDF - Template string (linii 1573-1574):
```javascript
${invoiceData.supplierBankAccounts && 
  invoiceData.supplierBankAccounts.length > 0 && 
  invoiceData.supplierBankAccounts[0].iban ? 
  `<br/><strong>IBAN:</strong> ${invoiceData.supplierBankAccounts[0].iban}` : 
  ''}
${invoiceData.supplierBankAccounts && 
  invoiceData.supplierBankAccounts.length > 0 && 
  invoiceData.supplierBankAccounts[0].bank ? 
  `<br/>Banca: ${invoiceData.supplierBankAccounts[0].bank}` : 
  ''}
```

### Excel - Loop conturi bancare (linii 1721-1729):
```javascript
if (invoiceData.supplierBankAccounts && invoiceData.supplierBankAccounts.length > 0) {
  invoiceData.supplierBankAccounts.forEach((account, index) => {
    if (account.iban || account.bank) {
      const label = invoiceData.supplierBankAccounts.length > 1 
        ? `Cont bancar ${index + 1}` 
        : 'Cont bancar';
      if (account.bank) excelData.push([`${label} - Banca`, account.bank]);
      if (account.iban) excelData.push([`${label} - IBAN`, account.iban]);
    }
  });
}
```

---

## ⚠️ Atenție!

Pentru ca IBAN-urile să apară, trebuie să:

1. **Completezi câmpul IBAN** în formular (secțiunea Furnizor sau Beneficiar)
2. **Salvezi** modificările (modificarea state-ului React)
3. **Generezi** exportul (PDF sau Excel)

**Nu este suficient să ai IBAN-ul salvat în cookie!** Trebuie să fie în state-ul `invoiceData` în momentul exportului.

---

## 📞 Dacă încă nu funcționează

1. **Reîncarcă pagina** (hard refresh: Ctrl+F5)
2. **Completează IBAN-ul din nou** în formular
3. **Verifică consola** pentru erori
4. **Generează PDF/Excel** din nou
5. Dacă problema persistă, trimite screenshot cu formularul completat + consola browser

---

## 🎉 Concluzie

IBAN-urile sunt implementate corect în:
- ✅ PDF (secțiuni FURNIZOR și BENEFICIAR)
- ✅ Excel (secțiuni FURNIZOR și BENEFICIAR)
- ✅ Suport conturi multiple
- ✅ Afișare condiționată (doar dacă sunt completate)

**Modificările sunt live! Testează completând IBAN-ul și generând PDF/Excel! 🚀**


