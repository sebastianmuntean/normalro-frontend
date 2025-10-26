# 📅 Ghid Configurare Sărbători - PaymentService

## 📋 Prezentare Generală

Sărbătorile legale din România sunt acum configurabile prin fișierul JSON:
```
src/config/holidays.json
```

Acest sistem permite:
- ✅ **Actualizare ușoară** a sărbătorilor fără modificare cod
- ✅ **Cache-uire automată** pentru performanță
- ✅ **Sărbători mobile** (Paște, Rusalii) calculate automat
- ✅ **Historicizare** - suportă sărbători introduse în ani diferiți
- ✅ **Precalculare** - opțiune pentru date Paște precalculate

---

## 📁 Structura Fișierului `holidays.json`

### 1. Sărbători Fixe (`fixedHolidays`)

```json
{
  "fixedHolidays": [
    {
      "name": "Anul Nou",
      "day": 1,
      "month": 1,
      "since": 1990,
      "note": "Zi liberă naționala"
    },
    ...
  ]
}
```

**Câmpuri:**
- `name` (string) - Numele sărbătorii (pentru afișare)
- `day` (int) - Ziua din lună (1-31)
- `month` (int) - Luna (1-12)
- `since` (int, opțional) - Anul de introducere (ex: 2015)
- `note` (string, opțional) - Detalii legale/context

**Exemplu: Adaugă o sărbătoare nouă**

```json
{
  "name": "2 Mai - Ziua Veteranilor",
  "day": 2,
  "month": 5,
  "since": 2025,
  "note": "Legea XYZ/2024"
}
```

---

### 2. Sărbători Mobile (`mobileHolidays`)

```json
{
  "mobileHolidays": {
    "orthodoxEaster": {
      "name": "Paștele Ortodox",
      "offsetDays": 0,
      "duration": 2,
      "note": "Duminică + Luni (2 zile libere)",
      "since": 1990
    },
    "goodFriday": {
      "name": "Vinerea Mare",
      "offsetDays": -2,
      "duration": 1,
      "since": 2018
    },
    ...
  }
}
```

**Câmpuri:**
- `name` (string) - Numele sărbătorii
- `offsetDays` (int) - Offset față de Paște (0 = Paște, -2 = Vinerea Mare, +49 = Rusalii)
- `duration` (int) - Număr de zile consecutive (1 sau 2)
- `since` (int, opțional) - Anul de introducere
- `addedBy` (string, opțional) - Legea care a introdus sărbătoarea

**Exemple offset:**
- `-2` = Vinerea Mare (2 zile înainte de Paște)
- `0` = Paștele (duminică)
- `+1` = Lunea de Paște
- `+49` = Rusaliile (duminică, 50 zile după Paște)
- `+50` = Lunea de Rusalii

---

### 3. Paște Precalculat (`precomputedEaster`)

```json
{
  "precomputedEaster": {
    "dates": {
      "2024": "2024-05-05",
      "2025": "2025-04-20",
      "2026": "2026-04-12",
      ...
    }
  }
}
```

**Avantaje:**
- ✅ **Performanță** - evită calculul matematic Gauss
- ✅ **Acuratețe** - folosește date oficiale de la BOR
- ✅ **Fallback** - dacă lipsește anul, se calculează automat

**Cum adaugi ani noi:**

1. Verifică calendarul oficial: https://www.bor.ro/calendar
2. Adaugă anul + data în format `YYYY-MM-DD`

```json
"2035": "2035-04-29"
```

---

### 4. Sărbători Viitoare (`futureHolidays`)

```json
{
  "futureHolidays": {
    "candidates": [
      {
        "name": "2 Mai - Ziua Veteranilor",
        "day": 2,
        "month": 5,
        "status": "propus",
        "note": "În discuție în Parlament (2024)"
      }
    ]
  }
}
```

**Scop:** Tracking sărbători propuse (nu afectează calculele)

Când sărbătoarea devine oficială, mută-o din `futureHolidays` în `fixedHolidays`.

---

### 5. Reguli Speciale (`specialRules`)

```json
{
  "specialRules": {
    "weekendDays": [0, 6],
    "weekendNames": ["Duminică", "Sâmbătă"]
  }
}
```

**Note:**
- `0` = Duminică (JavaScript `Date.getDay()`)
- `6` = Sâmbătă

---

## 🔧 Cum Actualizezi Sărbătorile

### Scenariul 1: Se introduce o sărbătoare nouă (ex: 2 Mai)

**Pași:**

1. **Editează** `src/config/holidays.json`

2. **Adaugă** în `fixedHolidays`:

```json
{
  "name": "Ziua Veteranilor de Război",
  "day": 2,
  "month": 5,
  "since": 2025,
  "note": "Legea 123/2024",
  "addedBy": "Parlament"
}
```

3. **Salvează** fișierul

4. **Rebuild** aplicația (`npm run build`) sau **refresh** pagina (development)

5. **Testează**: Calculează o scadență care include 2 Mai → ar trebui sărit

---

### Scenariul 2: Se schimbă o sărbătoare existentă

**Exemplu:** Sfântul Andrei devine 2 zile (duminică + luni)

1. **Găsește** în `fixedHolidays`:

```json
{
  "name": "Sfântul Andrei",
  "day": 30,
  "month": 11,
  "since": 2012
}
```

2. **Modifică** (dacă devine mobilă, mută în `mobileHolidays`):

```json
// Varianta simplă: 2 zile consecutive
{
  "name": "Sfântul Andrei",
  "day": 30,
  "month": 11,
  "duration": 2,  // ADAUGĂ acest câmp (dacă PaymentService suportă)
  "since": 2012
}
```

**Sau** adaugă a doua zi separat:

```json
{
  "name": "Sfântul Andrei (a doua zi)",
  "day": 1,
  "month": 12,
  "since": 2025
}
```

---

### Scenariul 3: Actualizare Date Paște Precalculate

**Sursă oficială:** https://www.bor.ro/calendar sau https://data.gov.ro

**Pași:**

1. **Descarcă** calendarul oficial pentru 2035-2050

2. **Editează** `precomputedEaster.dates`:

```json
"precomputedEaster": {
  "dates": {
    "2035": "2035-04-29",
    "2036": "2036-04-13",
    "2037": "2037-05-03",
    ...
  }
}
```

3. **Salvează** și **testează**

---

## 🧪 Testare după Modificări

### Test 1: Verifică că sărbătoarea nouă este recunoscută

```javascript
// În consola browser
const paymentService = require('./services/paymentService').default;

// Verifică sărbătorile pentru 2025
const holidays2025 = paymentService.getHolidaysForYear(2025);
console.log(holidays2025);

// Ar trebui să vezi noua sărbătoare (ex: 2 Mai)
```

---

### Test 2: Verifică calculul zilelor lucrătoare

```javascript
// Data de start: 1 aprilie 2025
const startDate = new Date('2025-04-01');

// Adaugă 30 zile lucrătoare
const dueDate = paymentService.addWorkingDays(startDate, 30);
console.log('Scadență:', dueDate.toLocaleDateString('ro-RO'));

// Verifică că sărbătorile noi sunt sărite
const skippedDays = paymentService.getHolidaysInRange(startDate, dueDate);
console.log('Sărbători sărite:', skippedDays);
```

---

### Test 3: Verifică Paștele Ortodox

```javascript
// Verifică că Paștele 2025 este corect
const easter2025 = paymentService.calculateOrthodoxEaster(2025);
console.log('Paște 2025:', easter2025.toLocaleDateString('ro-RO'));
// Ar trebui să fie: 20 aprilie 2025

// Verifică că Rusaliile sunt calculate corect (+49 zile)
const holidays = paymentService.getHolidaysForYear(2025);
const pentecost = holidays.find(h => h._holidayName?.includes('Rusalii'));
console.log('Rusalii 2025:', pentecost.toLocaleDateString('ro-RO'));
// Ar trebui să fie: 8 iunie 2025
```

---

## 📊 API Reference - Funcții Noi

### `getHolidaysInRange(startDate, endDate)`

Returnează toate sărbătorile dintr-un interval de date.

**Parametri:**
- `startDate` (Date) - Data de start
- `endDate` (Date) - Data de final

**Returnează:**
```javascript
[
  {
    date: Date,
    name: "Paștele Ortodox (prima zi)",
    formatted: "20.04.2025"
  },
  ...
]
```

**Exemplu:**

```javascript
const start = new Date('2025-04-01');
const end = new Date('2025-05-31');

const holidays = paymentService.getHolidaysInRange(start, end);
console.log(holidays);
// [
//   { date: ..., name: "Paștele Ortodox", formatted: "20.04.2025" },
//   { date: ..., name: "Lunea de Paște", formatted: "21.04.2025" },
//   { date: ..., name: "Ziua Muncii", formatted: "01.05.2025" }
// ]
```

---

### `clearHolidaysCache()`

Golește cache-ul de sărbători mobile.

**Când folosești:**
- După actualizarea `holidays.json`
- Când vrei să forțezi recalculare

**Exemplu:**

```javascript
paymentService.clearHolidaysCache();
// 🗑️ Cache sărbători mobile golit
```

---

### `reloadHolidaysConfig()` (experimental)

Reîncarcă configurarea din JSON (necesită webpack hot reload).

**Exemplu:**

```javascript
await paymentService.reloadHolidaysConfig();
// 🔄 Configurare sărbători reîncărcată
```

---

## 🚨 Atenție! Probleme Frecvente

### Problemă 1: Sărbătoarea nouă nu apare

**Cauză:** Cache-ul nu s-a actualizat

**Soluție:**

```javascript
paymentService.clearHolidaysCache();
```

Sau reîncarcă pagina (Ctrl+F5 / Cmd+Shift+R).

---

### Problemă 2: Data Paștelui este greșită

**Cauză:** Eroare în `precomputedEaster` sau formulă Gauss

**Verificare:**

1. Compară cu sursa oficială: https://www.bor.ro/calendar
2. Verifică consola browser pentru log-uri:

```
✅ Paște 2025 din cache precalculat: 20.04.2025
```

sau

```
🔢 Paște 2025 calculat cu formula Gauss: 20.04.2025
```

**Soluție:** Actualizează `precomputedEaster.dates` cu data corectă.

---

### Problemă 3: Sărbătoarea apare în ani greșiți

**Cauză:** Câmpul `since` lipsește sau este greșit

**Exemplu problemă:**

```json
{
  "name": "Ziua Copilului",
  "day": 1,
  "month": 6,
  "since": 2017  // ← Introdus în 2017, nu 1990!
}
```

**Verificare:**

```javascript
const holidays2015 = paymentService.getHolidaysForYear(2015);
// Ziua Copilului NU ar trebui să apară (introdusă din 2017)

const holidays2020 = paymentService.getHolidaysForYear(2020);
// Ziua Copilului ar trebui să apară
```

**Soluție:** Verifică anul de introducere în legislație și actualizează `since`.

---

## 📚 Resurse Utile

### Legislație

- **Legea 53/2003** - Codul Muncii (art. 139)
- **Legea 202/2008** - Zilele de sărbătoare legală
- **Portal legislație:** https://legislatie.just.ro/

### Calendar Oficial

- **BOR Calendar:** https://www.bor.ro/calendar
- **BNR Zile nelucratoare:** https://www.bnr.ro/Calendarul-zilelor-nelucratoare-pentru-operatiuni-ale-BNR-13869-Mobile.aspx

### Calculator Paște Ortodox

- **Calculator online:** https://www.timeanddate.com/calendar/determining-easter-date.html
- **Formula Gauss:** https://en.wikipedia.org/wiki/Date_of_Easter#Anonymous_Gregorian_algorithm

---

## 🎯 Best Practices

### 1. **Verifică sursa oficială**

Înainte de orice modificare, verifică:
- Monitorul Oficial
- Site-ul BOR (pentru Paște)
- Site-ul Guvernului

### 2. **Documentează modificările**

Adaugă `note` și `addedBy` pentru tracking:

```json
{
  "name": "Nouă Sărbătoare",
  "note": "Legea 123/2024 - Monitorul Oficial nr. 456",
  "addedBy": "Parlament",
  "since": 2025
}
```

### 3. **Testează în dezvoltare**

Înainte de deployment:
- Testează calculul zilelor pentru anul curent
- Verifică că Paștele/Rusaliile sunt corecte
- Testează cu intervale care includ sărbătoarea nouă

### 4. **Backup înainte de modificări**

```bash
cp src/config/holidays.json src/config/holidays.json.backup
```

### 5. **Versioning**

Actualizează câmpurile din JSON după fiecare modificare:

```json
{
  "version": "1.1.0",  // Incrementare versiune
  "lastUpdate": "2025-01-15",  // Data ultimei modificări
  ...
}
```

---

## 🔄 Changelog Template

Când actualizezi `holidays.json`, documentează în comentarii Git:

```
feat(holidays): Adaugă Ziua Veteranilor (2 Mai) - Legea 123/2024

- Adaugat sărbătoare fixă: 2 Mai (din 2025)
- Actualizat version: 1.1.0
- Sursa: Monitorul Oficial nr. 456/2024
```

---

## 📞 Support

Pentru întrebări sau probleme:
1. Verifică acest ghid
2. Consultă legislația actualizată
3. Contactează echipa de dezvoltare

**Happy Holidays Configuration! 📅✨**

