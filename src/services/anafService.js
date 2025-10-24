/**
 * Serviciu pentru apelarea API-ului ANAF
 */

const ANAF_API_URL = 'https://webservicesp.anaf.ro/PlatitorTvaRest/api/v9/ws/tva';

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
    const response = await fetch(ANAF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          cui: parseInt(cleanCUI),
          data: searchDate
        }
      ])
    });

    if (!response.ok) {
      throw new Error('Eroare la apelarea API ANAF');
    }

    const data = await response.json();

    // Verifică dacă au fost găsite rezultate
    if (data.found && data.found.length > 0) {
      const companyData = data.found[0];
      return {
        success: true,
        data: {
          cui: companyData.date_generale?.cui || cleanCUI,
          denumire: companyData.date_generale?.denumire || '',
          nrRegCom: companyData.date_generale?.nrRegCom || '',
          adresa: companyData.date_generale?.adresa || '',
          telefon: companyData.date_generale?.telefon || '',
          codPostal: companyData.date_generale?.codPostal || '',
          
          // Adresă detaliată
          strada: companyData.adresa_sediu_social?.sdenumire_Strada || '',
          numarStrada: companyData.adresa_sediu_social?.snumar_Strada || '',
          localitate: companyData.adresa_sediu_social?.sdenumire_Localitate || '',
          judet: companyData.adresa_sediu_social?.sdenumire_Judet || '',
          
          // Status TVA
          platitorTVA: companyData.inregistrare_scop_Tva?.scpTVA || false,
          dataInceputTVA: companyData.inregistrare_scop_Tva?.perioade_TVA?.[0]?.data_inceput_ScpTVA || '',
          
          // Construiește adresa completă
          adresaCompleta: buildFullAddress(companyData),
          oras: companyData.adresa_sediu_social?.sdenumire_Localitate || ''
        }
      };
    } else if (data.notFound && data.notFound.length > 0) {
      return {
        success: false,
        error: 'CUI-ul nu a fost găsit în baza de date ANAF'
      };
    } else {
      return {
        success: false,
        error: 'Nu s-au găsit date pentru acest CUI'
      };
    }
  } catch (error) {
    console.error('Eroare ANAF API:', error);
    return {
      success: false,
      error: error.message || 'Eroare la apelarea serviciului ANAF'
    };
  }
};

const buildFullAddress = (companyData) => {
  const parts = [];
  
  const adresaSediu = companyData.adresa_sediu_social;
  
  if (adresaSediu?.sdenumire_Strada) {
    parts.push(adresaSediu.sdenumire_Strada);
  }
  if (adresaSediu?.snumar_Strada) {
    parts.push(`Nr. ${adresaSediu.snumar_Strada}`);
  }
  if (adresaSediu?.sdenumire_Localitate) {
    parts.push(adresaSediu.sdenumire_Localitate);
  }
  if (adresaSediu?.sdenumire_Judet) {
    parts.push(adresaSediu.sdenumire_Judet);
  }
  
  return parts.join(', ') || companyData.date_generale?.adresa || '';
};

export default {
  getCompanyDataByCUI
};

