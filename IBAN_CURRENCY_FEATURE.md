# 💳 Adăugare Câmp Valută pentru IBAN-uri

## 📋 Ce s-a implementat

Fiecare cont bancar (furnizor și beneficiar) are acum **3 câmpuri**:
1. **Bancă** - Numele băncii (ex: BCR, BT)
2. **IBAN** - Codul IBAN (ex: RO49AAAA1B31...)
3. **Valută** - Moneda contului (RON, EUR, USD, GBP, CHF)

---

## 🎨 Interfață Formular

### Înainte:
```
┌───────────────────────────────────────────┐
│ Conturi bancare                           │
├───────────────────────────────────────────┤
│ [Bancă 1: ___________] [IBAN 1: _______] │
└───────────────────────────────────────────┘
```

### Acum:
```
┌──────────────────────────────────────────────────┐
│ Conturi bancare                                  │
├──────────────────────────────────────────────────┤
│ [Bancă 1: ___] [IBAN 1: __________] [RON ▼]    │
│                                         EUR      │
│                                         USD      │
│                                         GBP      │
│                                         CHF      │
└──────────────────────────────────────────────────┘
```

**Layout Grid:**
- Bancă: 4 coloane (33%)
- IBAN: 6 coloane (50%)
- Valută: 2 coloane (17%)

---

## 📄 PDF - Cum apare valuta

### Exemplu furnizor cu cont RON:
```
FURNIZOR:
Firma SRL
CUI: 12345678
Str. Victoriei, Nr. 10
București
Tel: 0721234567
Email: contact@firma.ro
IBAN (RON): RO49AAAA1B31007593840000
Banca: BCR
```

### Exemplu furnizor cu cont EUR:
```
FURNIZOR:
Firma Export SRL
CUI: 12345678
...
IBAN (EUR): RO49AAAA1B31007593840000
Banca: BCR
```

### Exemplu cu conturi multiple:
```
FURNIZOR:
Firma Multi SRL
CUI: 12345678
...
IBAN (RON): RO49AAAA1B31007593840000
Banca: BCR
IBAN (EUR): RO12BBBB2C42008967120000
Banca: Banca Transilvania
```

**Notă:** În PDF apare doar primul cont (pentru simplitate vizuală).

---

## 📊 Excel - Cum apare valuta

### Sheet "Factură" - Secțiune Furnizor:

**Un singur cont:**
```
FURNIZOR
Nume                  Firma SRL
CUI                   12345678
...
Cont bancar - Banca   BCR
Cont bancar - IBAN    RO49AAAA1B31007593840000
Cont bancar - Valută  RON                        ← NOU!
```

**Conturi multiple (RON + EUR):**
```
FURNIZOR
Nume                     Firma SRL
CUI                      12345678
...
Cont bancar 1 - Banca    BCR
Cont bancar 1 - IBAN     RO49AAAA1B31007593840000
Cont bancar 1 - Valută   RON                      ← NOU!
Cont bancar 2 - Banca    Banca Transilvania
Cont bancar 2 - IBAN     RO12BBBB2C42008967120000
Cont bancar 2 - Valută   EUR                      ← NOU!
```

---

## 💡 Use Cases

### Cazul 1: Factură în RON cu plată în RON
```
Moneda facturii: RON
IBAN Furnizor (RON): RO49...
```
✅ Standard, cel mai comun caz în România

---

### Cazul 2: Factură în EUR cu plată în EUR
```
Moneda facturii: EUR
IBAN Furnizor (EUR): RO49...
```
✅ Pentru exportatori care emit facturi în EUR și primesc plata în EUR

---

### Cazul 3: Factură în EUR cu opțiune plată RON sau EUR
```
Moneda facturii: EUR
Cont 1 - IBAN (RON): RO49...
Cont 2 - IBAN (EUR): RO12...
```
✅ Oferă clientului opțiunea să plătească în RON (la cursul BNR) sau EUR direct

---

### Cazul 4: Companie cu conturi în multiple valute
```
Cont 1 - IBAN (RON): RO49...  ← Principal, pentru clienți români
Cont 2 - IBAN (EUR): RO12...  ← Pentru clienți UE
Cont 3 - IBAN (USD): RO56...  ← Pentru clienți USA
```
✅ Toate conturile apar în Excel pentru referință, primul în PDF

---

## 🔧 Backward Compatibility

### Date vechi (fără currency)

Dacă ai date salvate înainte de această actualizare:

**În cookie:**
```json
{
  "supplierBankAccounts": [
    { "bank": "BCR", "iban": "RO49..." }
    // Lipsește "currency"
  ]
}
```

**La încărcare, se adaugă automat `currency: 'RON'`:**
```javascript
supplierBankAccounts: data.supplierBankAccounts.map(acc => ({
  bank: acc.bank || '',
  iban: acc.iban || '',
  currency: acc.currency || 'RON'  // ← Fallback automat la RON
}))
```

✅ Datele vechi rămân compatibile!

---

## 🎯 Valori Default

### La creare cont nou:
```javascript
{ bank: '', iban: '', currency: 'RON' }
```

### Valute disponibile:
- **RON** - Leu românesc (default)
- **EUR** - Euro
- **USD** - Dolar american
- **GBP** - Liră sterlină
- **CHF** - Franc elvețian

---

## 📊 Structura Datelor Actualizată

### Obiect invoiceData:
```javascript
{
  supplierBankAccounts: [
    {
      bank: 'BCR',
      iban: 'RO49AAAA1B31007593840000',
      currency: 'RON'  // ← NOU!
    },
    {
      bank: 'Banca Transilvania',
      iban: 'RO12BBBB2C42008967120000',
      currency: 'EUR'  // ← NOU!
    }
  ],
  clientBankAccounts: [
    {
      bank: 'ING Bank',
      iban: 'RO56INGB0001234567890123',
      currency: 'RON'  // ← NOU!
    }
  ]
}
```

---

## 🚀 Testare

### Test 1: Adaugă cont cu valută EUR

**Pași:**
1. Deschide InvoiceGenerator
2. În secțiunea **Furnizor**, completează:
   - Bancă: `BCR`
   - IBAN: `RO49AAAA1B31007593840000`
   - Valută: Selectează **EUR** din dropdown
3. Click **"Descarcă PDF"**
4. Deschide PDF → verifică:
   ```
   IBAN (EUR): RO49AAAA1B31007593840000
   ```
5. Click **"Descarcă Excel"**
6. Deschide Excel → verifică:
   ```
   Cont bancar - Valută    EUR
   ```

---

### Test 2: Conturi multiple cu valute diferite

**Pași:**
1. În secțiunea Furnizor, click **"Adaugă cont bancar"**
2. Cont 1:
   - IBAN: `RO49...`
   - Valută: **RON**
3. Cont 2:
   - IBAN: `RO12...`
   - Valută: **EUR**
4. Cont 3:
   - IBAN: `RO56...`
   - Valută: **USD**
5. Click **"Descarcă Excel"**
6. Verifică că Excel conține toate cele 3 conturi cu valutele lor

---

## 🎉 Beneficii

### Pentru furnizor:
- ✅ **Claritate** - clientul știe în ce valută să plătească
- ✅ **Flexibilitate** - poate oferi conturi în multiple valute
- ✅ **Profesionalism** - factură completă și clară

### Pentru client:
- ✅ **Transparență** - vede în ce monedă e IBAN-ul
- ✅ **Alegere** - poate alege contul în moneda preferată
- ✅ **Fără confuzii** - știe exact unde să plătească

### Pentru contabil:
- ✅ **Tracking precis** - știe în ce monedă intră banii
- ✅ **Reconciliere ușoară** - identifică rapid contul folosit
- ✅ **Export clar** - toate detaliile în Excel

---

## 📚 Modificări în Cod

### Fișiere modificate:

1. **InvoiceGenerator.js**
   - State: `supplierBankAccounts` include `currency`
   - Handlers: `handleAddSupplierBankAccount()` creează cont cu currency
   - Export PDF: Afișează `IBAN (RON):` sau `IBAN (EUR):`
   - Export Excel: Include rând `Cont bancar - Valută`
   - Backward compatibility: Mapare cu fallback la RON

2. **CompanyForm.js**
   - Grid layout: 4 + 6 + 2 coloane (Bancă + IBAN + Valută)
   - Select currency: 5 opțiuni (RON, EUR, USD, GBP, CHF)
   - Handler: `onBankAccountChange(index, 'currency', value)`

---

## 🔍 Verificare Finală

Deschide consola browser și verifică:

```javascript
// După ce completezi un IBAN cu valută EUR
console.log(invoiceData.supplierBankAccounts[0]);
// Output așteptat:
// {
//   bank: "BCR",
//   iban: "RO49AAAA1B31007593840000",
//   currency: "EUR"  ← Ar trebui să fie aici!
// }
```

---

**Funcționalitatea de valută pentru IBAN-uri este gata! 🎉💳**


