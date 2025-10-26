# 🇷🇴 Ghid Rapid - Funcționalități Specifice România

## Ce este nou?

InvoiceGenerator are acum **3 funcționalități specifice România**:

1. **💱 Cursuri BNR** - Conversie automată la cursul oficial
2. **📅 Calculator zile lucrătoare** - Scadență precisă (exclude weekend + sărbători)
3. **📱 Cod QR plată** - Scanează & plătește instant

---

## 1. 💱 Cursuri BNR - Cum funcționează?

### Afișare automată

Când intri în InvoiceGenerator, **widget-ul BNR** apare automat sub "Date factură":

```
┌──────────────────────────────────────────────┐
│ 💱 Cursuri Valutare BNR (2024-10-26)        │
│ [EUR: 4.97 RON] [USD: 4.52 RON] [GBP: 5.78] │
│                           [Conversie→RON] [🔄]│
└──────────────────────────────────────────────┘
```

### Cum folosești:

**Opțiunea 1: Conversie rapidă** (click pe chip)
1. Click pe **EUR/USD/GBP**
2. Vezi conversie instant: `100 EUR = 497.50 RON (curs: 4.9750)`

**Opțiunea 2: Conversie total factură**
1. Completează factura (produse + cantități)
2. Click **"Conversie → RON"**
3. Vezi totalul convertit la cursul BNR

**Opțiunea 3: Reîmprospătare cursuri**
- Click **🔄 Refresh** → Preia ultimele cursuri de la BNR

### ⚡ Avantaje:
- ✅ **Gratuit** - fără API key sau costuri
- ✅ **Cursuri oficiale** - direct de la Banca Națională
- ✅ **Actualizare zilnică** - cursurile BNR se actualizează la 13:00
- ✅ **Cache inteligent** - nu solicită serverul BNR de fiecare dată

---

## 2. 📅 Calculator Zile Lucrătoare - Cum funcționează?

### Butoane rapide

Sub câmpul **"Data scadenței"** găsești butoane pentru calcul automat:

```
┌─────────────────────────────────────────┐
│ Data scadenței: [2024-11-25]           │
│ [15z.l.] [30z.l.] [45z.l.] [60z.l.]    │
│ z.l. = zile lucrătoare                 │
└─────────────────────────────────────────┘
```

### Cum folosești:

**Pasul 1: Setează data emiterii**
- Ex: 26 octombrie 2024

**Pasul 2: Click pe numărul de zile dorit**
- Click **"30z.l."** (30 zile lucrătoare)

**Pasul 3: Vezi rezultatul**
- Scadența se setează automat: **5 decembrie 2024**
- Apare butonul **"Detalii"**

**Pasul 4: (Opțional) Vezi detaliile**
- Click **"Detalii"** → Vezi lista completă de zile sărite:

```
📅 Calculul zilelor lucrătoare:

🎯 Scadență: 05.12.2024
📆 Zile lucrătoare: 30
⏭️ Zile sărite: 12

Detalii zile sărite:
• 26.10.2024 - Weekend (sâmbătă)
• 27.10.2024 - Weekend (duminică)
• 02.11.2024 - Weekend
• 30.11.2024 - Sfântul Andrei (sărbătoare)
• 01.12.2024 - Ziua Națională (sărbătoare)
• 25.12.2024 - Crăciunul (sărbătoare)
```

### 🎯 Ce exclude automat:

**Weekend-uri:**
- Sâmbăta și duminica (toate)

**Sărbători legale fixe:**
- 1-2 Ian - Anul Nou
- 24 Ian - Unirea Principatelor
- 1 Mai - Ziua Muncii
- 1 Iun - Ziua Copilului
- 15 Aug - Adormirea Maicii Domnului
- 30 Nov - Sfântul Andrei
- 1 Dec - Ziua Națională
- 25-26 Dec - Crăciunul

**Sărbători mobile (calculate automat):**
- Vinerea Mare
- Paștele Ortodox (duminică + luni)
- Rusaliile (duminică + luni)

### ⚡ Avantaje:
- ✅ **Acuratețe juridică** - respectă legislația română
- ✅ **Calcul instant** - nu mai numeri manual zilele
- ✅ **Transparență** - vezi exact ce zile sunt sărite și de ce

---

## 3. 📱 Cod QR Plată - Cum funcționează?

### Generare QR

În secțiunea **"Butoane Export"** găsești opțiunea pentru QR:

```
┌────────────────────────────┐
│ [Descarcă PDF]            │
│ [Descarcă Excel]          │
│ [Descarcă XML]            │
│ ────── Cod QR Plată ────── │
│ [Generează Cod QR Plată]  │
└────────────────────────────┘
```

### Cum folosești:

**Pasul 1: Completează datele obligatorii**
- ✅ **Nume furnizor** (câmp "Furnizor")
- ✅ **IBAN furnizor** (câmp "IBAN" în secțiunea Furnizor)
- ✅ **Suma totală** (se calculează automat din produse)

**Pasul 2: Click "Generează Cod QR Plată"**

**Pasul 3: Se deschide dialog-ul cu QR-ul generat**

```
┌──────────────────────────────────────────────┐
│ 🔲 Cod QR Plată                     [X]     │
├──────────────────────────────────────────────┤
│ ✅ Cod QR generat cu succes!                │
│                                             │
│        ┌───────────────────┐               │
│        │   █▀▀▀▀▀█ ▀█▀█   │               │
│        │   █ ███ █ ▄▄▀▄   │               │
│        │   █ ▀▀▀ █ ▀▀██   │               │
│        │   QR CODE         │               │
│        └───────────────────┘               │
│                                             │
│ Detalii plată:                              │
│ Beneficiar: FIRMA MEA SRL                  │
│ IBAN: RO49 AAAA 1B31 0075 9384 0000        │
│ Sumă: 150.00 RON                           │
│ Referință: Factura FAC001                  │
│                                             │
│ ℹ️ Format: EPC QR Code (SEPA)              │
├──────────────────────────────────────────────┤
│              [Închide] [Descarcă QR Code]   │
└──────────────────────────────────────────────┘
```

**Pasul 4: Descarcă QR-ul**
- Click **"Descarcă QR Code"** → salvează PNG (300x300px)

### Cum plătește clientul?

1. **Deschide aplicația de banking** (George, BT Pay, ING, etc.)
2. **Scanează codul QR** cu camera telefonului
3. **Confirmă plata** - toate detaliile sunt completate automat:
   - IBAN beneficiar
   - Suma de plată
   - Referința (ex: "Factura FAC001")
4. **Trimite plata** - instant!

### ⚡ Avantaje:
- ✅ **Zero erori** - clientul nu mai introduce manual IBAN/sumă
- ✅ **Plată instant** - scanează & plătește în 10 secunde
- ✅ **Standard european** - EPC QR Code (compatibil SEPA)
- ✅ **Funcționează peste tot** - majoritatea băncilor din RO și UE

### 🏦 Bănci compatibile (România):

- ✅ **BCR** (George)
- ✅ **BT** (BT Pay, BT24)
- ✅ **ING** (ING Home'Bank)
- ✅ **Raiffeisen** (Smart Mobile)
- ✅ **UniCredit** (Mobile Banking)
- ✅ **Banca Transilvania** (BT Pay)
- ✅ **Alpha Bank** (myAlpha Mobile)
- ✅ **Revolut** (Revolut App)
- ✅ Majoritatea băncilor din UE

---

## 🎯 Scenarii de Utilizare

### Scenariul 1: Factură EUR pentru client din Germania

**Problema:** Trebuie să știu echivalentul în RON pentru contabilitate.

**Soluție:**
1. Completezi factura în **EUR** (moneda clientului)
2. Click pe chip-ul **"EUR: 4.97 RON"** în widget BNR
3. Vezi instant: `1,500 EUR = 7,455 RON (curs BNR: 4.9700)`
4. Noteză cursul pentru contabilitate

---

### Scenariul 2: Contract cu scadență 30 zile lucrătoare

**Problema:** Trebuie să calculez scadența conform contractului (30 zile lucrătoare).

**Soluție:**
1. Setezi **Data emiterii**: 1 noiembrie 2024
2. Click **"30z.l."**
3. Scadența se setează automat: **10 decembrie 2024**
4. Click **"Detalii"** → Vezi că s-au sărit:
   - 9-10 nov: Weekend
   - 16-17 nov: Weekend
   - 23-24 nov: Weekend
   - 30 nov: Sfântul Andrei
   - 1 dec: Ziua Națională
   - 7-8 dec: Weekend

---

### Scenariul 3: Factură cu plată QR pentru client modern

**Problema:** Clientul vrea să plătească rapid, fără să introducă manual IBAN-ul.

**Soluție:**
1. Completezi **IBAN-ul tău** în secțiunea Furnizor
2. Generezi factura (PDF/Excel)
3. Click **"Generează Cod QR Plată"**
4. Descărci QR-ul PNG
5. Îl incluzi în PDF sau îl trimiți separat pe WhatsApp/Email
6. Clientul scanează cu banking app → plătește instant

---

## 🔧 FAQ - Întrebări Frecvente

### Q1: Cursurile BNR se actualizează automat?

**R:** Da, dar cu cache de 6 ore. BNR publică cursurile zilnic la **13:00** (zile lucrătoare). Dacă vrei să forțezi actualizarea, apasă **🔄 Refresh**.

---

### Q2: Ce se întâmplă dacă BNR este offline?

**R:** Aplicația folosește **cursuri statice de rezervă** (ultima zi lucrătoare cunoscută). Vei vedea un mesaj: "⚠️ Folosesc cursuri statice (eroare conectare BNR)".

---

### Q3: Calculatorul de zile lucrătoare ține cont de Paște?

**R:** Da! Paștele Ortodox este calculat automat cu formula Gauss (pentru calendar Iulian convertit la Gregorian). Include:
- Vinerea Mare
- Paștele (duminică + luni)
- Rusaliile (duminică + luni)

---

### Q4: Codul QR funcționează cu orice bancă?

**R:** Funcționează cu **majoritatea băncilor din România și UE** care suportă **EPC QR Code** (standard SEPA). Bănci confirmate: BCR, BT, ING, Raiffeisen, UniCredit, Alpha, Revolut.

Dacă banca clientului nu suportă QR, va trebui să plătească clasic (introducere manuală IBAN).

---

### Q5: Pot genera QR pentru facturi în EUR/USD?

**R:** Da! QR-ul suportă **orice monedă SEPA**: RON, EUR, USD, GBP, CHF, etc. Formatul QR include automat moneda: `EUR150.00` sau `RON500.00`.

---

### Q6: QR-ul este securizat?

**R:** Da! QR-ul este generat **local în browser** (nu se urcă pe niciun server). Conține doar:
- IBAN public (oricum apare pe factură)
- Suma de plată
- Referință factură
- Nume beneficiar

Nu conține informații sensibile (parole, date personale, etc.).

---

### Q7: Pot personaliza numărul de zile lucrătoare?

**R:** Momentan sunt disponibile butoane pentru: **15, 30, 45, 60 zile**. Pentru alte valori, calculează manual sau modifică data scadenței direct în câmp.

---

### Q8: Cum descarc QR-ul pentru a-l include în factură?

**R:**
1. Generează QR-ul (buton "Generează Cod QR Plată")
2. Click **"Descarcă QR Code"** în dialog
3. Se salvează PNG (300x300px)
4. Incluzi imaginea în PDF (copy-paste sau insert image)

**Alternativ:** Trimite QR-ul separat pe WhatsApp/Email către client.

---

## 🎉 Concluzie

Cele 3 funcționalități noi fac **InvoiceGenerator** mult mai puternic pentru utilizatorii din România:

✅ **Cursuri BNR** → Conversie precisă, oficială, automată
✅ **Calculator zile** → Conformitate juridică, zero erori
✅ **Cod QR plată** → Experiență modernă, plăți instant

**Toate sunt gratuite, fără costuri suplimentare!**

---

## 📞 Ai nevoie de ajutor?

Contactează echipa de suport sau consultă documentația completă în:
- `FUNCTIONALITATI_RO.md` (detalii tehnice)

**Succes cu facturile! 🧾💰**

