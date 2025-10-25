/**
 * Serviciu pentru apelarea API-ului ANAF prin backend proxy
 */

import API_BASE_URL from '../config/api';

export const getCompanyDataByCUI = async (cui, date = null) => {
  if (!cui) {
    throw new Error('CUI este obligatoriu');
  }

  // Curăță CUI-ul (elimină RO, spații, etc)
  const cleanCUI = cui.toString().replace(/[^0-9]/g, '');
  
  if (!cleanCUI) {
    throw new Error('CUI invalid');
  }

  // Data curentă dacă nu e specificată
  const searchDate = date || new Date().toISOString().split('T')[0];

  try {
    // Apelează backend-ul nostru care face proxy către ANAF
    const response = await fetch(`${API_BASE_URL}/anaf/company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cui: cleanCUI,
        date: searchDate
      })
    });

    const data = await response.json();

    // Backend-ul returnează datele deja procesate
    if (data.success) {
      return {
        success: true,
        data: {
          cui: data.data.cui,
          denumire: data.data.denumire,
          nrRegCom: data.data.nrRegCom,
          adresaCompleta: data.data.adresa,
          oras: data.data.oras,
          judet: data.data.judet,
          telefon: data.data.telefon,
          codPostal: data.data.codPostal,
          platitorTVA: data.data.platitorTVA
        }
      };
    } else {
      // Backend-ul returnează deja mesaje user-friendly
      return {
        success: false,
        error: data.error || `Nu s-a găsit o companie cu codul fiscal ${cleanCUI}`
      };
    }
  } catch (error) {
    console.error('Eroare ANAF API:', error);
    return {
      success: false,
      error: `Nu s-a găsit o companie cu codul fiscal ${cleanCUI}`
    };
  }
};

export default {
  getCompanyDataByCUI
};

