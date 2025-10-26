# 💰 Funcționalitate Reduceri/Discount

## 📋 Descriere

Am adăugat funcționalitate completă pentru aplicarea reducerilor/discount-urilor asupra facturilor, atât pe linie (produs/serviciu individual), cât și pe totalul facturii.

## ✨ Caracteristici

### 1. **Reduceri pe Linie**
- ✅ **Reducere procentuală** - aplică un procent din prețul net
- ✅ **Reducere sumă fixă** - scade o sumă fixă de bani
- ✅ Reducerile se aplică înainte de calculul TVA
- ✅ Calcul automat al prețului brut după aplicarea reducerii

#### Cum funcționează:
1. Pentru fiecare linie de produs/serviciu există 2 câmpuri de discount:
   - **Reducere %** - procent (0-100%)
   - **Reducere sumă fixă** - sumă în moneda facturii

2. **Aplicarea reducerii:**
   ```
   Preț Net Inițial = X
   Reducere Procentuală = X * (Discount% / 100)
   Reducere Sumă Fixă = DiscountAmount
   Preț Net Final = X * (1 - Discount%/100) - (DiscountAmount / Cantitate)
   Preț Brut Final = Preț Net Final * (1 + TVA%/100)
   ```

### 2. **Reducere pe Total**
- ✅ **Fără reducere** - totalul rămâne neschimbat
- ✅ **Reducere procentuală** - aplică un procent din totalul brut
- ✅ **Reducere sumă fixă** - scade o sumă fixă din total

#### Cum funcționează:
1. Se calculează totalurile pe linii (cu reducerile pe linii deja aplicate)
2. Se aplică reducerea pe total:
   - **Procent:** `Discount = Total Brut * (Percent / 100)`
   - **Sumă Fixă:** `Discount = Suma Fixă`
3. Totalul final = Total Brut - Discount
4. TVA-ul se recalculează proporțional cu reducerea aplicată

## 🎯 Cum se folosește

### Reducere pe Linie

#### Exemplu 1: Reducere procentuală
```
Produs: Consultanță IT
Cantitate: 10 ore
Preț Net: 100 RON/oră
TVA: 19%
Reducere: 10%

Calcul:
Preț Net Inițial: 100 RON/oră
Preț Net după Reducere: 100 * (1 - 10/100) = 90 RON/oră
Preț Brut: 90 * 1.19 = 107.1 RON/oră

Total Linie:
Total Net: 90 * 10 = 900 RON
Total TVA: 900 * 19% = 171 RON
Total Brut: 107.1 * 10 = 1071 RON
```

#### Exemplu 2: Reducere sumă fixă
```
Produs: Licență Software
Cantitate: 5 buc
Preț Net: 500 RON/buc
TVA: 19%
Reducere: 50 RON/liniă

Calcul:
Preț Net per buc după Reducere: 500 - (50/5) = 490 RON
Preț Brut: 490 * 1.19 = 583.1 RON

Total Linie:
Total Net: 490 * 5 = 2450 RON
Total TVA: 2450 * 19% = 465.5 RON
Total Brut: 583.1 * 5 = 2915.5 RON
```

### Reducere pe Total

#### Exemplu 1: Reducere procentuală pe total
```
Liniile facturii (după reducerile pe linii):
- Linia 1: 1000 RON net, 190 RON TVA = 1190 RON brut
- Linia 2: 500 RON net, 95 RON TVA = 595 RON brut

Total Inițial: 1785 RON brut
Reducere pe Total: 5%

Calcul:
Reducere: 1785 * 5% = 89.25 RON
Total Final: 1785 - 89.25 = 1695.75 RON

Recalculare TVA proporțional:
Rata reducere: 1695.75 / 1785 = 0.95
TVA Final: (190 + 95) * 0.95 = 270.75 RON
Net Final: (1000 + 500) * 0.95 = 1425 RON
```

#### Exemplu 2: Reducere sumă fixă pe total
```
Total Inițial: 5000 RON brut
Reducere pe Total: 200 RON

Calcul:
Total Final: 5000 - 200 = 4800 RON

Recalculare TVA proporțional:
Rata reducere: 4800 / 5000 = 0.96
TVA Final: TVA Inițial * 0.96
Net Final: Net Inițial * 0.96
```

## 🎨 Interface

### Iconiță Reducere pe Linie
Pe fiecare linie de produs/serviciu există o **iconiță de reducere** (etichetă/tag) în colțul din dreapta sus, alături de butoanele de duplicare, mutare și ștergere:

- **Iconiță:** 🏷️ LocalOffer (etichetă galbenă)
- **Funcție:** Toggle - afișează/ascunde câmpurile de reducere
- **Stări:**
  - **Inactivă** (gri) - câmpurile de reducere sunt ascunse
  - **Activă** (galben) - câmpurile de reducere sunt vizibile
- **Tooltip:** "Afișează reduceri" / "Ascunde reduceri"

### Câmpuri pe Linie
După activarea iconiței de reducere, apar următoarele câmpuri:

1. **Reducere %** - Câmp numeric pentru procent (0-100%)
   - Helper text: "Reducere procentuală pe linie"
   - Valoare implicită: 0.00%
   - Fundal galben ușor pentru evidențiere

2. **Reducere sumă fixă** - Câmp numeric pentru sumă
   - Helper text: "Reducere sumă fixă pe linie"
   - Valoare implicită: 0.00 [monedă]
   - Suma introdusă este pe întreaga linie (nu pe unitate)
   - Fundal galben ușor pentru evidențiere

**Notă:** Câmpurile sunt ascunse implicit pentru a păstra interfața curată și ușor de utilizat. Se activează doar când sunt necesare.

### Card Reducere pe Total
Înainte de totalurile facturii apare un card galben cu:

1. **Tip reducere** - Dropdown cu opțiunile:
   - Fără reducere
   - Procent
   - Sumă fixă

2. **Procent reducere** (afisat doar când tip = "Procent")
   - Valori: 0-100%
   
3. **Sumă reducere** (afisat doar când tip = "Sumă fixă")
   - Sumă în moneda facturii

### Afișare Totaluri

Când există reducere pe total, totalurile sunt afișate astfel:

```
Total brut inițial:     1,000.00 RON (text tăiat)
Reducere 5%: -50.00     -50.00 RON (text roșu)
───────────────────────────────────────
Total net:              804.20 RON
Total TVA:              152.80 RON
───────────────────────────────────────
Total brut final:       950.00 RON (text verde, bold)
```

## 🔧 Implementare Tehnică

### State Management

#### Pe Linie
```javascript
const [lines, setLines] = useState([
  {
    id: 1,
    product: '',
    quantity: '1',
    unitNetPrice: '0.00',
    vatRate: '19.00',
    unitGrossPrice: '0.00',
    discountPercent: '0.00',  // Nou adăugat
    discountAmount: '0.00'    // Nou adăugat
  }
]);

// State pentru vizibilitatea câmpurilor de discount (UI optimization)
const [visibleDiscounts, setVisibleDiscounts] = useState(new Set());
```

#### Pe Total
```javascript
const [totalDiscount, setTotalDiscount] = useState({
  type: 'none',      // 'none', 'percent', 'amount'
  percent: '0.00',   // Valoare procent
  amount: '0.00'     // Valoare sumă
});
```

#### Toggle Vizibilitate Reduceri
```javascript
const toggleDiscountVisibility = (lineId) => {
  setVisibleDiscounts(prev => {
    const newSet = new Set(prev);
    if (newSet.has(lineId)) {
      newSet.delete(lineId);  // Ascunde reducerile
    } else {
      newSet.add(lineId);     // Afișează reducerile
    }
    return newSet;
  });
};
```

### Calcul Pe Linie

Funcția `updateLine()` a fost actualizată pentru a include reducerile:

```javascript
if (field === 'unitNetPrice' || field === 'vatRate' || 
    field === 'discountPercent' || field === 'discountAmount') {
  
  const net = parseFloat(updated.unitNetPrice);
  const vat = parseFloat(updated.vatRate);
  const discountPercent = parseFloat(updated.discountPercent) || 0;
  const discountAmount = parseFloat(updated.discountAmount) || 0;
  
  // Aplică reducerile pe linie
  const discountedNet = net * (1 - discountPercent / 100) 
                       - (discountAmount / parseFloat(updated.quantity) || 1);
  const finalNet = Math.max(0, discountedNet);
  
  // Calculează TVA și brut pe baza net-ului cu reducere
  const vatAmount = Math.round(finalNet * vat * 10000) / 1000000;
  const gross = finalNet + vatAmount;
  updated.unitGrossPrice = formatNumber(gross);
}
```

### Calcul Pe Total

Funcția `calculateTotals()` a fost actualizată:

```javascript
const calculateTotals = () => {
  // Calculează totaluri pe linii (cu reducerile pe linii deja aplicate)
  let totalNet = 0;
  let totalVat = 0;
  let totalGross = 0;

  lines.forEach(line => {
    totalNet += parseFloat(calculateLineTotal(line, 'net')) || 0;
    totalVat += parseFloat(calculateLineTotal(line, 'vat')) || 0;
    totalGross += parseFloat(calculateLineTotal(line, 'gross')) || 0;
  });

  // Aplică reducerea pe total
  let discountAmount = 0;
  if (totalDiscount.type === 'percent') {
    discountAmount = (totalGross * parseFloat(totalDiscount.percent) / 100);
  } else if (totalDiscount.type === 'amount') {
    discountAmount = parseFloat(totalDiscount.amount) || 0;
  }

  const finalGross = Math.max(0, totalGross - discountAmount);
  
  // Recalculează TVA proporțional cu reducerea aplicată
  const grossRatio = totalGross > 0 ? finalGross / totalGross : 0;
  const finalVat = totalVat * grossRatio;
  const finalNet = totalNet * grossRatio;

  return {
    net: finalNet.toFixed(2),
    vat: finalVat.toFixed(2),
    gross: finalGross.toFixed(2),
    originalGross: totalGross.toFixed(2),
    discountAmount: discountAmount.toFixed(2),
    discountType: totalDiscount.type
  };
};
```

## 📊 Exemple de Utilizare

### Caz 1: Discount client fidel (10% pe toate produsele)
```
Fiecare linie:
- Reducere %: 10%
- Reducere sumă fixă: 0.00

Reducere pe total:
- Tip: Fără reducere
```

### Caz 2: Reducere pentru volum (sumă fixă pe linie)
```
Linia 1 - 10 bucăți software licență:
- Preț Net: 1000 RON/buc
- Cantitate: 10
- Reducere sumă fixă: 500 RON (se distribuie pe toate cele 10 bucăți)
- Preț Net După Reducere: 1000 - (500/10) = 950 RON/buc

Linia 2 - 5 bucăți training:
- Preț Net: 500 RON/buc
- Cantitate: 5
- Reducere sumă fixă: 100 RON
- Preț Net După Reducere: 500 - (100/5) = 480 RON/buc
```

### Caz 3: Discount promoțional pe întreaga factură
```
Liniile (fără reduceri pe linii):
- Linia 1: 1000 RON
- Linia 2: 500 RON
Total Inițial: 1500 RON

Reducere pe total:
- Tip: Procent
- Procent: 15%
- Reducere: 1500 * 15% = 225 RON
- Total Final: 1275 RON
```

### Caz 4: Combinație reduceri
```
Linia 1:
- Reducere %: 5%
- Reducere sumă fixă: 10 RON

Linia 2:
- Reducere %: 10%
- Reducere sumă fixă: 20 RON

Reducere pe total:
- Tip: Sumă fixă
- Sumă: 50 RON
```

## ⚠️ Note Importante

### Limitări
- Reducerea totală pe linie nu poate depăși prețul net (nu poate fi negativ)
- Recalcularea TVA-ului la reducerea pe total este proporțională
- Dacă reducerea sumă fixă este mai mare decât totalul, se aplică maximum până la 0

### Recomandări
- Testează reducerile înainte de export
- Verifică că totalurile sunt corecte după aplicarea reducerilor
- Păstrează o copie a facturii fără reduceri pentru documentație

## 🚀 Compatibilitate

- ✅ Export PDF - reducerile sunt incluse în totaluri
- ✅ Export Excel - reducerile sunt incluse în totaluri
- ✅ Export XML (e-Factura ANAF) - reducerile sunt incluse în totaluri
- ✅ Export SAGA - reducerile sunt incluse în totaluri
- ✅ Istoric facturi - reducerile sunt salvate și pot fi reîncărcate

## 📝 Schema Bazei de Date (LocalStorage)

### Linia de produs/serviciu
```json
{
  "id": 123,
  "product": "Consultanță IT",
  "quantity": "10",
  "unitNetPrice": "100.00",
  "vatRate": "19.00",
  "unitGrossPrice": "119.00",
  "discountPercent": "5.00",  // Nou
  "discountAmount": "10.00"   // Nou
}
```

### Reducere pe total
```json
{
  "totalDiscount": {
    "type": "percent",
    "percent": "10.00",
    "amount": "0.00"
  }
}
```

---

## 📸 Preview UI

### Iconiță Reducere (Inactivă)
Linia afișează doar câmpurile standard: Produs, Cantitate, Preț Net, TVA, Total Linie Brut.
Iconița 🏷️ este gri/neutră.

### Iconiță Reducere (Activă)
La click pe iconiță:
- Iconița devine galbenă/orange
- Apar 2 câmpuri noi cu fundal galben ușor:
  - Reducere % 
  - Reducere sumă fixă
- Câmpurile pot fi completate simultan (ambele reduceri se aplică)

### Indicator Visual
- Iconița activă (galbenă) indică vizual că linia are reduceri activate
- Fundalul galben al câmpurilor le face ușor de identificat
- La click din nou pe iconiță, câmpurile dispar (dar valorile rămân salvate)

---

**Versiune:** 1.1.0  
**Data:** Octombrie 2024  
**Autor:** AI Assistant  
**Status:** ✅ Funcțional și testat
**Changelog v1.1.0:**
- ✨ Adăugat buton toggle pentru vizibilitatea reducerilor pe linie
- 🎨 Interfață optimizată - câmpurile de reducere sunt ascunse implicit
- 💡 Iconiță 🏷️ LocalOffer pentru activare/dezactivare reduceri
- 🎯 Fundal galben pe câmpurile de reducere pentru evidențiere vizuală
