/**
 * Serviciu pentru preluarea cursurilor valutare de la BNR (Banca Națională a României)
 * Scraping gratuit din XML-ul public BNR (fără API key necesar)
 */

class BNRService {
  constructor() {
    this.xmlUrl = 'https://www.bnr.ro/nbrfxrates.xml';
    this.corsProxy = 'https://api.allorigins.win/raw?url='; // Proxy CORS gratuit
    this.cache = {
      rates: null,
      date: null,
      timestamp: null
    };
    this.cacheExpiry = 6 * 60 * 60 * 1000; // 6 ore (BNR se actualizează zilnic la 13:00)
  }

  /**
   * Preia cursurile valutare de la BNR
   * @returns {Promise<Object>} Obiect cu cursuri: { date, rates: { EUR: 4.97, USD: 4.52, ... } }
   */
  async getExchangeRates() {
    try {
      // Verifică cache-ul
      if (this.isCacheValid()) {
        console.log('✅ Returnez cursuri BNR din cache');
        return {
          date: this.cache.date,
          rates: this.cache.rates,
          cached: true
        };
      }

      console.log('🔄 Preluare cursuri BNR...');
      
      // Încearcă direct (fără CORS proxy) - funcționează pe unele browsere/configurații
      let xmlText;
      try {
        const directResponse = await fetch(this.xmlUrl);
        if (directResponse.ok) {
          xmlText = await directResponse.text();
          console.log('✅ Cursuri BNR preluate direct (fără CORS proxy)');
        } else {
          throw new Error('Direct fetch failed');
        }
      } catch (directError) {
        console.log('⚠️ CORS direct eșuat, folosesc proxy...');
        // Fallback la CORS proxy
        const proxyResponse = await fetch(this.corsProxy + encodeURIComponent(this.xmlUrl));
        if (!proxyResponse.ok) {
          throw new Error(`Eroare preluare date BNR: ${proxyResponse.status}`);
        }
        xmlText = await proxyResponse.text();
        console.log('✅ Cursuri BNR preluate prin CORS proxy');
      }

      // Parseză XML-ul
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      // Verifică erori de parsing
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Eroare parsing XML BNR');
      }

      // Extrage data publicării
      const dateElement = xmlDoc.querySelector('PublishingDate, Cube[date]');
      const publishDate = dateElement?.getAttribute('date') || 
                         dateElement?.textContent || 
                         new Date().toISOString().split('T')[0];

      // Extrage cursurile valutare
      const rates = {};
      const currencyNodes = xmlDoc.querySelectorAll('Rate');

      currencyNodes.forEach(node => {
        const currency = node.getAttribute('currency');
        const multiplier = parseFloat(node.getAttribute('multiplier')) || 1;
        const value = parseFloat(node.textContent);

        if (currency && !isNaN(value)) {
          // Ajustează pentru multiplicator (ex: 1 JPY = 0.0285 RON, dar în XML apare 100 JPY = 2.85 RON)
          rates[currency] = (value / multiplier).toFixed(4);
        }
      });

      // Adaugă RON (cursul propriu e mereu 1.0000)
      rates['RON'] = '1.0000';

      // Salvează în cache
      this.cache = {
        rates,
        date: publishDate,
        timestamp: Date.now()
      };

      console.log(`✅ Cursuri BNR actualizate (${publishDate}):`, rates);

      return {
        date: publishDate,
        rates: rates,
        cached: false
      };

    } catch (error) {
      console.error('❌ Eroare preluare cursuri BNR:', error);
      
      // Returnează cursuri statice de rezervă (ultima zi lucrătoare cunoscută)
      const fallbackRates = {
        'EUR': '4.9750',
        'USD': '4.5200',
        'GBP': '5.7800',
        'CHF': '5.2100',
        'JPY': '0.0285',
        'CAD': '3.2500',
        'AUD': '2.9500',
        'RON': '1.0000'
      };

      console.warn('⚠️ Folosesc cursuri BNR statice (fallback)');

      return {
        date: new Date().toISOString().split('T')[0],
        rates: fallbackRates,
        error: error.message,
        fallback: true
      };
    }
  }

  /**
   * Verifică dacă cache-ul este încă valid
   */
  isCacheValid() {
    if (!this.cache.rates || !this.cache.timestamp) {
      return false;
    }

    const age = Date.now() - this.cache.timestamp;
    return age < this.cacheExpiry;
  }

  /**
   * Convertește o sumă între 2 monede
   * @param {number} amount - Suma de convertit
   * @param {string} from - Moneda sursă (ex: 'EUR')
   * @param {string} to - Moneda destinație (ex: 'RON')
   * @returns {Promise<number>} Suma convertită
   */
  async convertCurrency(amount, from, to) {
    const { rates } = await this.getExchangeRates();

    if (!rates[from] || !rates[to]) {
      throw new Error(`Moneda ${from} sau ${to} nu este suportată de BNR`);
    }

    // Conversie: sumă → RON → moneda destinație
    const amountInRON = amount * parseFloat(rates[from]);
    const convertedAmount = amountInRON / parseFloat(rates[to]);

    return parseFloat(convertedAmount.toFixed(2));
  }

  /**
   * Golește cache-ul (forțează refresh la următoarea solicitare)
   */
  clearCache() {
    this.cache = {
      rates: null,
      date: null,
      timestamp: null
    };
    console.log('🗑️ Cache cursuri BNR șters');
  }

  /**
   * Returnează lista de monede suportate
   */
  async getSupportedCurrencies() {
    const { rates } = await this.getExchangeRates();
    return Object.keys(rates).sort();
  }

  /**
   * Formatare sumă cu moneda
   */
  formatAmount(amount, currency) {
    return `${parseFloat(amount).toFixed(2)} ${currency}`;
  }
}

// Singleton
const bnrService = new BNRService();

export default bnrService;

