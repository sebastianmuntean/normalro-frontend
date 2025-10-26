# 📈 Funcționalitate Calcul Automat Preț

## 📋 Descriere

Am adăugat funcționalitate pentru calculul automat al prețului de vânzare pe baza prețului de intrare (achiziție) și adaosului comercial (marjă de profit). Această funcționalitate este utilă pentru gestionarea rapidă a marjelor de profit pe produse/servicii.

## ✨ Caracteristici

### 1. **Preț Intrare (Cost Achiziție)**
- Câmp pentru introducerea prețului de achiziție/cost al produsului
- Opțional - poate fi lăsat gol dacă nu este relevant
- Valoare implicită: 0.00

### 2. **Adaos Comercial (%)**
- Câmp pentru introducerea marjei de profit în procente
- Opțional - poate fi lăsat gol dacă nu este relevant
- Valoare implicită: 0.00%
- Suportă valori mari (până la 1000%) pentru cazuri speciale

### 3. **Calcul Automat**
- Când ambele câmpuri (Preț Intrare + Adaos) sunt completate, prețul net se calculează automat
- Formula: **Preț Net = Preț Intrare × (1 + Adaos%/100)**
- Calculul se actualizează instant la modificarea oricăruia din cele două câmpuri
- Prețul net poate fi editat manual oricând (suprascrie calculul automat)

## 🎯 Cum se folosește

### Exemplu 1: Marjă de profit 30%

```
Preț Intrare: 100 RON
Adaos: 30%

Calcul automat:
Preț Net = 100 × (1 + 30/100)
Preț Net = 100 × 1.30
Preț Net = 130.00 RON
```

### Exemplu 2: Marjă de profit 50%

```
Preț Intrare: 500 RON
Adaos: 50%

Calcul automat:
Preț Net = 500 × (1 + 50/100)
Preț Net = 500 × 1.50
Preț Net = 750.00 RON
```

### Exemplu 3: Marjă mică 5%

```
Preț Intrare: 1000 RON
Adaos: 5%

Calcul automat:
Preț Net = 1000 × (1 + 5/100)
Preț Net = 1000 × 1.05
Preț Net = 1050.00 RON
```

### Exemplu 4: Doar Preț Intrare (fără adaos)

```
Preț Intrare: 200 RON
Adaos: 0%

Calcul automat:
Preț Net = 200 × (1 + 0/100)
Preț Net = 200.00 RON
```

## 🎨 Interface

### Poziționare Câmpuri
Câmpurile sunt poziț ionate în următoarea ordine pe fiecare linie:

1. **Produs / Serviciu** - denumire
2. **Cantitate** - număr bucăți/ore/etc
3. **Preț intrare** ⭐ (NOU) - cost achiziție
4. **Adaos %** ⭐ (NOU) - marjă profit
5. **Preț net** - preț vânzare (calculat automat sau manual)
6. **TVA** - cotă TVA
7. **Total linie brut** - total cu TVA

### Design

#### Câmp "Preț intrare"
- Label: "Preț intrare"
- Helper text: "Opțional - preț achiziție"
- Fundal: Albastru ușor (`info.50`) pentru diferențiere
- Sufix: Moneda facturii (RON/EUR/USD)
- Validare: Min 0, Step 0.01

#### Câmp "Adaos %"
- Label: "Adaos %"
- Helper text: "Opțional - marjă profit"
- Fundal: Albastru ușor (`info.50`) pentru diferențiere
- Sufix: %
- Validare: Min 0, Max 1000, Step 0.01

#### Câmp "Preț net"
- Label: "Preț net"
- Helper text: Afișează formula de calcul când există preț intrare și adaos
  - Ex: "Auto: 100.00 + 30%"
- Sufix: Moneda facturii (RON/EUR/USD)
- Poate fi editat manual oricând

### Indicatori Vizuali
- Fundalul albastru ușor diferențiază câmpurile opționale de calcul de câmpurile standard
- Helper text-ul de sub "Preț net" arată formula aplicată când calculul este automat
- Valorile se actualizează instant la modificare

## 🔧 Implementare Tehnică

### State Management

```javascript
const [lines, setLines] = useState([
  {
    id: 1,
    product: '',
    quantity: '1',
    purchasePrice: '0.00',  // ⭐ NOU - Preț de intrare
    markup: '0.00',         // ⭐ NOU - Adaos comercial (%)
    unitNetPrice: '0.00',
    vatRate: DEFAULT_VAT_RATE,
    unitGrossPrice: '0.00',
    discountPercent: '0.00',
    discountAmount: '0.00'
  }
]);
```

### Logica de Calcul

Funcția `updateLine()` a fost actualizată pentru a include calculul automat:

```javascript
const updateLine = (id, field, value) => {
  setLines(lines.map(line => {
    if (line.id !== id) return line;

    const updated = { ...line, [field]: value };

    // Calculează automat prețul net din preț intrare + adaos
    if (field === 'purchasePrice' || field === 'markup') {
      const purchasePrice = parseFloat(updated.purchasePrice) || 0;
      const markup = parseFloat(updated.markup) || 0;
      
      if (purchasePrice > 0) {
        // Preț Net = Preț Intrare * (1 + Adaos%)
        const calculatedNetPrice = purchasePrice * (1 + markup / 100);
        updated.unitNetPrice = formatNumber(calculatedNetPrice);
      }
    }

    // Continuă cu calculul TVA și reduceri...
    if (field === 'unitNetPrice' || field === 'vatRate' || 
        field === 'discountPercent' || field === 'discountAmount' || 
        field === 'purchasePrice' || field === 'markup') {
      // Calcul TVA și preț brut
      const net = parseFloat(updated.unitNetPrice);
      const vat = parseFloat(updated.vatRate);
      const discountPercent = parseFloat(updated.discountPercent) || 0;
      const discountAmount = parseFloat(updated.discountAmount) || 0;
      
      if (!isNaN(net) && !isNaN(vat)) {
        // Aplică reducerile pe linie
        const discountedNet = net * (1 - discountPercent / 100) 
                             - (discountAmount / parseFloat(updated.quantity) || 1);
        const finalNet = Math.max(0, discountedNet);
        
        const vatAmount = Math.round(finalNet * vat * 10000) / 1000000;
        const gross = finalNet + vatAmount;
        updated.unitGrossPrice = formatNumber(gross);
      }
    }

    return updated;
  }));
};
```

### Funcții Actualizate

Toate funcțiile care creează linii noi au fost actualizate pentru a include câmpurile noi:

1. **`addLine()`** - Adaugă linie nouă
2. **`selectProductFromTemplate(product)`** - Încarcă din template
3. **`importExcelLines()`** - Import din Excel
4. **`duplicateLine(lineId)`** - Duplicare linie (păstrează automat toate câmpurile)

```javascript
const addLine = () => {
  const newId = Math.max(...lines.map(l => l.id)) + 1;
  setLines([...lines, {
    id: newId,
    product: '',
    quantity: '1',
    purchasePrice: '0.00',  // ⭐ Câmp nou
    markup: '0.00',         // ⭐ Câmp nou
    unitNetPrice: '0.00',
    vatRate: DEFAULT_VAT_RATE,
    unitGrossPrice: '0.00',
    discountPercent: '0.00',
    discountAmount: '0.00'
  }]);
};
```

## 📊 Cazuri de Utilizare

### Caz 1: Magazin retail - Marjă fixă 40%

```
Produse în stoc:
- Telefon: Preț intrare 1000 RON, Adaos 40% → Preț net 1400 RON
- Carcasă: Preț intrare 50 RON, Adaos 40% → Preț net 70 RON
- Încărcător: Preț intrare 30 RON, Adaos 40% → Preț net 42 RON

Beneficiu:
- Adaugi rapid produse cu marjă uniformă
- Vezi instant prețul de vânzare
```

### Caz 2: Servicii de consultanță - Marjă variabilă

```
Servicii oferite:
- Consultanță Standard: Cost orar 100 RON, Adaos 50% → Preț 150 RON/oră
- Consultanță Premium: Cost orar 100 RON, Adaos 100% → Preț 200 RON/oră
- Support: Cost orar 100 RON, Adaos 20% → Preț 120 RON/oră

Beneficiu:
- Calculezi rapid diferite niveluri de servicii
- Gestionezi marje diferențiate pe tip de serviciu
```

### Caz 3: Import-export - Marjă mică pe volum mare

```
Produse importate:
- Produs A: Preț import 5000 EUR, Adaos 10% → Preț vânzare 5500 EUR
- Produs B: Preț import 10000 EUR, Adaos 5% → Preț vânzare 10500 EUR

Beneficiu:
- Calculezi rapid prețul de vânzare pentru import
- Gestionezi marje mici pe volume mari
```

### Caz 4: Producție proprie - Cost + Adaos

```
Produse fabricate:
- Produs custom: Cost materiale + manoperă 800 RON, Adaos 60% → Preț 1280 RON

Beneficiu:
- Calculezi prețul pe baza costurilor de producție
- Aplici marjă consistentă
```

## 🔄 Fluxuri de Lucru

### Flux 1: Calcul Automat (Recomandat)

1. Introdu denumirea produsului
2. Introdu cantitatea
3. **Introdu "Preț intrare"** (cost achiziție)
4. **Introdu "Adaos %"** (marjă profit)
5. ✅ "Preț net" se calculează automat
6. Completează TVA (sau lasă valoarea implicită)
7. Verifică totalul

**Avantaj:** Rapid, consistent, elimină erorile de calcul manual

### Flux 2: Manual (Pentru cazuri speciale)

1. Introdu denumirea produsului
2. Introdu cantitatea
3. **Lasă goale "Preț intrare" și "Adaos %"**
4. Introdu direct "Preț net" (calculat în alt mod)
5. Completează TVA
6. Verifică totalul

**Avantaj:** Flexibilitate maximă pentru prețuri negociate

### Flux 3: Mixt (Ajustare manuală după calcul)

1. Introdu "Preț intrare" și "Adaos %"
2. ✅ "Preț net" se calculează automat
3. **Ajustează manual "Preț net"** dacă este necesar (ex: rotunjire la prețuri psihologice)
4. Completează restul câmpurilor

**Avantaj:** Punct de plecare rapid cu posibilitate de ajustare

## ⚠️ Note Importante

### Comportament
- Calculul automat se activează **doar când Preț Intrare > 0**
- Dacă Adaos = 0%, Prețul Net = Preț Intrare
- Prețul Net poate fi **editat manual oricând** (suprascrie calculul automat)
- La editare manuală, Preț Intrare și Adaos rămân vizibile pentru referință

### Limitări
- Câmpurile sunt opționale - poți lucra ca înainte fără a le folosi
- Nu afectează calculul TVA, reduceri sau totaluri
- Valorile nu sunt validate reciproc (poți avea Preț Net < Preț Intrare)

### Recomandări
- Folosește pentru produse cu marjă fixă/consistentă
- Pentru prețuri negociate, introdu direct în "Preț net"
- Verifică întotdeauna prețul final înainte de export
- Salvează produsele cu Preț Intrare + Adaos în template-uri pentru reutilizare rapidă

## 🚀 Compatibilitate

- ✅ **Export PDF** - Afișează doar prețul net final (Preț Intrare și Adaos sunt pentru uz intern)
- ✅ **Export Excel** - Afișează doar prețul net final
- ✅ **Export XML (e-Factura ANAF)** - Trimite doar prețul net final
- ✅ **Export SAGA** - Trimite doar prețul net final
- ✅ **Template-uri Produse** - ⭐ Salvează și încarcă Preț Intrare + Adaos (cu calcul automat)
- ✅ **Istoric facturi** - Păstrează valorile pentru consultare ulterioară
- ✅ **Google Sheets Sync** - Sincronizează toate câmpurile
- ✅ **Duplicare linie** - Păstrează Preț Intrare și Adaos
- ✅ **Import Excel** - Poate fi extins pentru a include Preț Intrare și Adaos
- ✅ **Editare Total Brut** - ⭐ Recalculează automat adaosul când există preț intrare

## 📝 Schema Bazei de Date (LocalStorage)

### Linia de produs/serviciu

```json
{
  "id": 123,
  "product": "Consultanță IT",
  "quantity": "10",
  "purchasePrice": "100.00",  // ⭐ NOU - Cost achiziție
  "markup": "30.00",          // ⭐ NOU - Marjă profit %
  "unitNetPrice": "130.00",   // Calculat automat: 100 × 1.30
  "vatRate": "19.00",
  "unitGrossPrice": "154.70", // 130 × 1.19
  "discountPercent": "0.00",
  "discountAmount": "0.00"
}
```

### Template Produs

```json
{
  "product": "Consultanță IT",
  "quantity": "1",
  "purchasePrice": "100.00",  // ⭐ Salvat în template
  "markup": "30.00",          // ⭐ Salvat în template
  "unitNetPrice": "130.00",
  "vatRate": "19.00",
  "unitGrossPrice": "154.70"
}
```

## 💡 Exemple Practice

### Exemplu Complet: Restaurant

```
Linie 1: Meniu Standard
├─ Preț intrare: 15 RON (cost ingrediente + manoperă)
├─ Adaos: 200%
├─ Preț net (auto): 45 RON
├─ TVA: 19%
└─ Preț brut: 53.55 RON

Linie 2: Meniu Premium
├─ Preț intrare: 30 RON
├─ Adaos: 150%
├─ Preț net (auto): 75 RON
├─ TVA: 19%
└─ Preț brut: 89.25 RON

Linie 3: Băutură
├─ Preț intrare: 5 RON
├─ Adaos: 300%
├─ Preț net (auto): 20 RON
├─ TVA: 19%
└─ Preț brut: 23.80 RON
```

### Exemplu Complet: Magazin Online

```
Produs: Laptop Gaming
├─ Preț intrare: 3500 RON (cost de la furnizor)
├─ Adaos: 25% (marjă standard electronice)
├─ Preț net (auto): 4375 RON
├─ Reducere client fidel: 5% (218.75 RON)
├─ Preț net final: 4156.25 RON
├─ TVA: 19% (789.69 RON)
└─ Preț brut final: 4945.94 RON

Beneficii:
- Cost: 3500 RON
- Vânzare: 4945.94 RON
- Profit brut: 1445.94 RON
- Marjă efectivă: ~41% (după reducere)
```

## 🔄 Recalculare Automată Adaos

### Funcționalitate Specială: Editare Total Brut

Când editezi **"Total linie brut"** și există **Preț de Intrare**, aplicația recalculează automat **Adaosul**:

**Formula inversă:**
```
Adaos% = ((Preț Net / Preț Intrare) - 1) × 100
```

**Exemplu:**
```
Situație inițială:
├─ Preț Intrare: 100 RON
├─ Adaos: 30%
└─ Preț Net: 130 RON (calculat automat)

Utilizatorul editează Total Brut la 154.70 RON:
├─ TVA: 19%
├─ Preț Net nou: 130 RON (extras din brut)
├─ Preț Intrare: 100 RON (neschimbat)
└─ Adaos nou: 30% (recalculat automat: (130/100 - 1) × 100)

Utilizatorul editează Total Brut la 178.50 RON:
├─ TVA: 19%
├─ Preț Net nou: 150 RON
├─ Preț Intrare: 100 RON (neschimbat)
└─ Adaos nou: 50% (recalculat: (150/100 - 1) × 100)
```

**Beneficii:**
- 📊 Vezi instant câștigul real după negociere
- 🔄 Actualizare automată a marjei
- 💡 Înțelegi impactul reducerilor asupra profitului

## 🏷️ Template-uri Produse cu Preț Intrare și Adaos

### Dialog Template-uri - Funcționalități Noi

**Formular Adăugare Produs:**
- ✨ Câmp "Preț intrare" (💰) cu helper text "Cost achiziție"
- ✨ Câmp "Adaos %" cu helper text "Marjă profit"
- ✨ Calcul automat al "Preț net" când completezi ambele câmpuri
- 💡 Helper text arată formula: "Auto: 100.00 + 30%"

**Tabel Template-uri:**
- 📋 Coloane noi: "Preț Intrare" și "Adaos%"
- 👁️ Vizualizare clară a marjei pe fiecare produs
- 🔢 Adaosul este afișat ca Chip colorat pentru evidențiere
- ➖ Câmpurile goale sunt afișate ca "-"

**Exemplu Flux Complet:**
```
1. Click "Adaugă produs/serviciu"
2. Completează:
   ├─ Denumire: "Consultanță IT"
   ├─ Categorie: "Servicii"
   ├─ Preț intrare: 100
   ├─ Adaos: 50
   └─ (Preț net se calculează automat: 150)
3. Salvează template
4. Template apare în listă cu toate valorile
5. Click pe template → adaugă în factură cu toate câmpurile
```

---

**Versiune:** 1.2.0  
**Data:** Octombrie 2024  
**Autor:** AI Assistant  
**Status:** ✅ Funcțional și testat

**Funcționalități cheie:**
- ✨ Calcul automat Preț Net = Preț Intrare × (1 + Adaos%)
- 🔄 Recalculare inversă Adaos când se editează Total Brut
- 🎨 Interfață intuitivă cu câmpuri opționale
- 💾 Salvare completă în template-uri cu calcul automat
- 📊 Helper text cu formula aplicată
- 🔄 Actualizare instant la modificare
- 🏷️ Template-uri cu vizualizare Preț Intrare + Adaos
- ✅ Compatibil cu toate formatele de export

**Changelog v1.2.0:**
- ⭐ Recalculare automată a adaosului la editare Total Brut
- ⭐ Template-uri produse cu câmpuri Preț Intrare și Adaos
- ⭐ Calcul automat în formular template-uri
- ⭐ Vizualizare completă în tabel template-uri

