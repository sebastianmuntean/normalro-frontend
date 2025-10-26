/**
 * Serviciu pentru funcționalități de plată specifice României:
 * - Calculator zile lucrătoare (exclude weekend + sărbători legale)
 * - Generare cod QR pentru plată (IBAN + sumă)
 */

import QRCode from 'qrcode';
import holidaysConfig from '../config/holidays.json';

class PaymentService {
  constructor() {
    // Încarcă configurarea sărbătorilor din JSON
    this.config = holidaysConfig;
    this.fixedHolidays = this.config.fixedHolidays;
    this.mobileHolidays = this.config.mobileHolidays;
    this.precomputedEaster = this.config.precomputedEaster.dates;
    
    // Cache pentru sărbători mobile calculate
    this.cachedMobileHolidays = {};
    
    console.log(`✅ PaymentService inițializat cu ${this.fixedHolidays.length} sărbători fixe`);
    console.log(`📅 Configurare versiunea ${this.config.version} (actualizat: ${this.config.lastUpdate})`);
  }

  /**
   * Calculează data Paștelui Ortodox pentru un an dat (formula lui Meeus/Jones/Butcher)
   * @param {number} year - Anul
   * @returns {Date} Data Paștelui
   */
  calculateOrthodoxEaster(year) {
    // Verifică dacă există în cache precalculat (holidays.json)
    if (this.precomputedEaster[year]) {
      const cachedDate = new Date(this.precomputedEaster[year]);
      console.log(`✅ Paște ${year} din cache precalculat: ${cachedDate.toLocaleDateString('ro-RO')}`);
      return cachedDate;
    }

    // Calculează cu formula Gauss pentru calendar Iulian
    const a = year % 4;
    const b = year % 7;
    const c = year % 19;
    const d = (19 * c + 15) % 30;
    const e = (2 * a + 4 * b - d + 34) % 7;
    const month = Math.floor((d + e + 114) / 31);
    const day = ((d + e + 114) % 31) + 1;

    // Conversie Iulian → Gregorian (adaugă 13 zile)
    let easterDate = new Date(year, month - 1, day);
    easterDate.setDate(easterDate.getDate() + 13);

    console.log(`🔢 Paște ${year} calculat cu formula Gauss: ${easterDate.toLocaleDateString('ro-RO')}`);
    return easterDate;
  }

  /**
   * Returnează lista completă de sărbători pentru un an dat
   * @param {number} year - Anul
   * @returns {Array<Date>} Lista de sărbători
   */
  getHolidaysForYear(year) {
    // Verifică cache-ul pentru acest an
    if (this.cachedMobileHolidays[year]) {
      console.log(`✅ Sărbători ${year} din cache`);
      return this.cachedMobileHolidays[year];
    }

    const holidays = [];

    // Adaugă sărbători fixe din configurare
    this.fixedHolidays.forEach(({ name, day, month, since }) => {
      // Verifică dacă sărbătoarea era în vigoare în anul respectiv
      if (since && year < since) {
        console.log(`⏭️ Sărit ${name} pentru ${year} (introdusă din ${since})`);
        return; // Skip dacă sărbătoarea nu era încă în vigoare
      }
      
      const holidayDate = new Date(year, month - 1, day);
      holidayDate._holidayName = name; // Atașează numele pentru debugging
      holidays.push(holidayDate);
    });

    // Adaugă sărbători mobile (calculate relativ la Paște)
    const easter = this.calculateOrthodoxEaster(year);
    
    Object.entries(this.mobileHolidays).forEach(([key, config]) => {
      if (key === 'description' || key === 'note') return;
      
      const { name, offsetDays, duration, since } = config;
      
      // Verifică dacă sărbătoarea era în vigoare
      if (since && year < since) {
        console.log(`⏭️ Sărit ${name} pentru ${year} (introdusă din ${since})`);
        return;
      }
      
      // Calculează data bazată pe offset de la Paște
      for (let i = 0; i < duration; i++) {
        const holidayDate = new Date(easter);
        holidayDate.setDate(easter.getDate() + offsetDays + i);
        holidayDate._holidayName = duration === 1 ? name : `${name} ${i === 0 ? '(prima zi)' : '(a doua zi)'}`;
        holidays.push(holidayDate);
      }
    });

    // Salvează în cache
    this.cachedMobileHolidays[year] = holidays;
    
    console.log(`📅 Generate ${holidays.length} sărbători pentru ${year}`);
    return holidays;
  }

  /**
   * Verifică dacă o dată este sărbătoare legală în România
   * @param {Date} date - Data de verificat
   * @returns {boolean} true dacă e sărbătoare
   */
  isHoliday(date) {
    const year = date.getFullYear();
    const holidays = this.getHolidaysForYear(year);

    return holidays.some(holiday => 
      holiday.getDate() === date.getDate() &&
      holiday.getMonth() === date.getMonth() &&
      holiday.getFullYear() === date.getFullYear()
    );
  }

  /**
   * Verifică dacă o dată este weekend (sâmbătă sau duminică)
   * @param {Date} date - Data de verificat
   * @returns {boolean} true dacă e weekend
   */
  isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = duminică, 6 = sâmbătă
  }

  /**
   * Verifică dacă o dată este zi lucrătoare
   * @param {Date} date - Data de verificat
   * @returns {boolean} true dacă e zi lucrătoare
   */
  isWorkingDay(date) {
    return !this.isWeekend(date) && !this.isHoliday(date);
  }

  /**
   * Adaugă zile lucrătoare la o dată (exclude weekend + sărbători)
   * @param {Date} startDate - Data de start
   * @param {number} workingDays - Numărul de zile lucrătoare de adăugat
   * @returns {Date} Data rezultată
   */
  addWorkingDays(startDate, workingDays) {
    let currentDate = new Date(startDate);
    let daysAdded = 0;

    while (daysAdded < workingDays) {
      currentDate.setDate(currentDate.getDate() + 1);

      if (this.isWorkingDay(currentDate)) {
        daysAdded++;
      }
    }

    return currentDate;
  }

  /**
   * Calculează numărul de zile lucrătoare între două date
   * @param {Date} startDate - Data de start
   * @param {Date} endDate - Data de final
   * @returns {number} Numărul de zile lucrătoare
   */
  countWorkingDays(startDate, endDate) {
    let count = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (this.isWorkingDay(currentDate)) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  }

  /**
   * Generează cod QR pentru plată (format PayBySquare/EPC QR)
   * @param {Object} paymentData - Date plată: { iban, amount, currency, beneficiary, reference }
   * @returns {Promise<string>} Data URL cu imaginea QR (base64)
   */
  async generatePaymentQR(paymentData) {
    const {
      iban = '',
      amount = 0,
      currency = 'RON',
      beneficiary = '',
      reference = '',
      bic = '' // Opțional (Bank Identifier Code)
    } = paymentData;

    // Validare IBAN (simplificată)
    const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
    if (!cleanIBAN.startsWith('RO') || cleanIBAN.length !== 24) {
      throw new Error('IBAN invalid pentru România (trebuie să înceapă cu RO și să aibă 24 caractere)');
    }

    // Format EPC QR Code (European Payments Council - standard european pentru plăți SEPA)
    // Specificație: https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/quick-response-code-guidelines-enable-data-capture-initiation
    const epcData = [
      'BCD',                          // Service Tag
      '002',                          // Version
      '1',                            // Character Set (1 = UTF-8)
      'SCT',                          // Identification (SEPA Credit Transfer)
      bic || '',                      // BIC (opțional pentru România)
      beneficiary.substring(0, 70),   // Beneficiary Name (max 70 caractere)
      cleanIBAN,                      // Beneficiary Account (IBAN)
      `${currency}${amount.toFixed(2)}`, // Amount (ex: EUR12.50 sau RON100.00)
      '',                             // Purpose (opțional)
      reference.substring(0, 35),     // Structured Reference (max 35 caractere)
      '',                             // Unstructured Remittance (opțional)
      ''                              // Beneficiary to Originator Information (opțional)
    ].join('\n');

    try {
      // Generează QR Code ca Data URL (base64)
      const qrDataUrl = await QRCode.toDataURL(epcData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      console.log('✅ Cod QR plată generat cu succes');
      return qrDataUrl;

    } catch (error) {
      console.error('❌ Eroare generare cod QR:', error);
      throw new Error(`Eroare generare cod QR: ${error.message}`);
    }
  }

  /**
   * Descarcă codul QR ca imagine PNG
   * @param {string} qrDataUrl - Data URL cu QR-ul
   * @param {string} filename - Numele fișierului (opțional)
   */
  downloadQRCode(qrDataUrl, filename = 'payment-qr-code.png') {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Formatare IBAN pentru afișare (grupuri de 4 caractere)
   * @param {string} iban - IBAN-ul de formatat
   * @returns {string} IBAN formatat (ex: RO49 AAAA 1B31 0075 9384 0000)
   */
  formatIBAN(iban) {
    const clean = iban.replace(/\s/g, '').toUpperCase();
    return clean.match(/.{1,4}/g)?.join(' ') || clean;
  }

  /**
   * Returnează descrierea unei sărbători pe baza datei
   * @param {Date} date - Data de verificat
   * @returns {string|null} Numele sărbătorii sau null
   */
  getHolidayName(date) {
    const year = date.getFullYear();
    const holidays = this.getHolidaysForYear(year);

    // Caută în lista de sărbători a anului
    const matchingHoliday = holidays.find(holiday => this.isSameDay(date, holiday));
    
    if (matchingHoliday) {
      // Returnează numele atașat sau generează unul generic
      return matchingHoliday._holidayName || 'Sărbătoare legală';
    }

    return null;
  }

  /**
   * Returnează toate sărbătorile dintr-un interval de date
   * @param {Date} startDate - Data de start
   * @param {Date} endDate - Data de final
   * @returns {Array<Object>} Lista sărbătorilor cu detalii
   */
  getHolidaysInRange(startDate, endDate) {
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const holidaysInRange = [];

    // Obține sărbătorile pentru toți anii din interval
    for (let year = startYear; year <= endYear; year++) {
      const yearHolidays = this.getHolidaysForYear(year);
      
      yearHolidays.forEach(holiday => {
        if (holiday >= startDate && holiday <= endDate) {
          holidaysInRange.push({
            date: holiday,
            name: holiday._holidayName || 'Sărbătoare',
            formatted: holiday.toLocaleDateString('ro-RO')
          });
        }
      });
    }

    return holidaysInRange;
  }

  /**
   * Golește cache-ul de sărbători mobile
   * Util când se actualizează configurarea
   */
  clearHolidaysCache() {
    this.cachedMobileHolidays = {};
    console.log('🗑️ Cache sărbători mobile golit');
  }

  /**
   * Reîncarcă configurarea sărbătorilor din JSON
   * (pentru actualizări runtime - experimental)
   */
  async reloadHolidaysConfig() {
    try {
      // Re-import configurare (necesită webpack hot reload sau refresh pagină)
      // În producție, ar trebui să facă fetch la JSON actualizat
      this.clearHolidaysCache();
      console.log('🔄 Configurare sărbători reîncărcată');
    } catch (error) {
      console.error('❌ Eroare reîncărcare configurare sărbători:', error);
    }
  }

  /**
   * Verifică dacă două date sunt aceeași zi
   */
  isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }
}

// Singleton
const paymentService = new PaymentService();

export default paymentService;

