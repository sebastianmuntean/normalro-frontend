// Template Service - localStorage management for products and clients
// Salvează și gestionează template-uri pentru produse și clienți

const STORAGE_KEY_PRODUCTS = 'normalro_product_templates';
const STORAGE_KEY_CLIENTS = 'normalro_client_templates';
const STORAGE_KEY_CATEGORIES = 'normalro_product_categories';

class TemplateService {
  // ============ TEMPLATE-URI PRODUSE ============

  // Salvează un template de produs
  saveProductTemplate(product) {
    try {
      const templates = this.getAllProductTemplates();
      
      // Folosește valoarea din .env ca fallback (dacă nu e definită, 21)
      const defaultVatRate = process.env.REACT_APP_DEFAULT_TVA || '21';
      
      const template = {
        guid: product.guid || '', // Păstrează GUID-ul dacă există
        id: Date.now(),
        name: product.name || product.product || '',
        category: product.category || 'General',
        unitNetPrice: product.unitNetPrice || '0.00',
        vatRate: product.vatRate || defaultVatRate,
        unitGrossPrice: product.unitGrossPrice || '0.00',
        description: product.description || '',
        defaultQuantity: product.defaultQuantity || '1',
        isFavorite: product.isFavorite || false,
        usageCount: 0,
        createdAt: Date.now(),
        lastUsed: null
      };

      // Verifică duplicate
      const exists = templates.find(t => 
        t.name.toLowerCase() === template.name.toLowerCase()
      );

      if (exists) {
        // Actualizează template existent
        const updated = templates.map(t => 
          t.id === exists.id ? { ...t, ...template, id: exists.id, usageCount: exists.usageCount } : t
        );
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
      } else {
        // Adaugă template nou
        templates.push(template);
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(templates));
      }

      return true;
    } catch (error) {
      console.error('Eroare salvare template produs:', error);
      return false;
    }
  }

  // Obține toate template-urile de produse
  getAllProductTemplates() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Eroare citire template-uri produse:', error);
      return [];
    }
  }

  // Obține template-uri produse filtrate
  getProductTemplates({ search = '', category = 'all', onlyFavorites = false } = {}) {
    let templates = this.getAllProductTemplates();

    // Filtrare după căutare
    if (search) {
      const searchLower = search.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filtrare după categorie
    if (category && category !== 'all') {
      templates = templates.filter(t => t.category === category);
    }

    // Doar favorite
    if (onlyFavorites) {
      templates = templates.filter(t => t.isFavorite);
    }

    // Sortare: favorite primele, apoi după usage count, apoi alfabetic
    templates.sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return b.isFavorite - a.isFavorite;
      if (a.usageCount !== b.usageCount) return b.usageCount - a.usageCount;
      return a.name.localeCompare(b.name);
    });

    return templates;
  }

  // Șterge un template de produs
  deleteProductTemplate(id) {
    try {
      const templates = this.getAllProductTemplates();
      const filtered = templates.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Eroare ștergere template produs:', error);
      return false;
    }
  }

  // Marchează un produs ca favorit
  toggleProductFavorite(id) {
    try {
      const templates = this.getAllProductTemplates();
      const updated = templates.map(t =>
        t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
      );
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Eroare toggle favorit:', error);
      return false;
    }
  }

  // Incrementează usage count pentru un produs
  incrementProductUsage(id) {
    try {
      const templates = this.getAllProductTemplates();
      const updated = templates.map(t =>
        t.id === id ? { ...t, usageCount: (t.usageCount || 0) + 1, lastUsed: Date.now() } : t
      );
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Eroare increment usage:', error);
      return false;
    }
  }

  // Actualizează un template de produs existent
  updateProductTemplate(id, productData) {
    try {
      const templates = this.getAllProductTemplates();
      const templateIndex = templates.findIndex(t => t.id === id);
      
      if (templateIndex === -1) {
        console.error('Template produs nu a fost găsit:', id);
        return false;
      }

      // Păstrează datele importante (id, usageCount, etc.) și actualizează restul
      const existingTemplate = templates[templateIndex];
      const updatedTemplate = {
        ...existingTemplate,
        name: productData.name || existingTemplate.name,
        category: productData.category !== undefined ? productData.category : existingTemplate.category,
        purchasePrice: productData.purchasePrice || existingTemplate.purchasePrice,
        markup: productData.markup || existingTemplate.markup,
        unitNetPrice: productData.unitNetPrice || existingTemplate.unitNetPrice,
        vatRate: productData.vatRate || existingTemplate.vatRate,
        unitGrossPrice: productData.unitGrossPrice || existingTemplate.unitGrossPrice,
        description: productData.description !== undefined ? productData.description : existingTemplate.description,
        defaultQuantity: productData.defaultQuantity || existingTemplate.defaultQuantity,
        updatedAt: Date.now()
      };

      templates[templateIndex] = updatedTemplate;
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(templates));
      return true;
    } catch (error) {
      console.error('Eroare actualizare template produs:', error);
      return false;
    }
  }

  // Actualizează GUID-ul pentru un produs
  updateProductGuid(id, guid) {
    try {
      const templates = this.getAllProductTemplates();
      const updated = templates.map(t =>
        t.id === id ? { ...t, guid: guid } : t
      );
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Eroare actualizare GUID produs:', error);
      return false;
    }
  }

  // ============ CATEGORII PRODUSE ============

  // Obține toate categoriile
  getAllCategories() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      const categories = data ? JSON.parse(data) : ['General', 'Servicii', 'Produse', 'Consultanță'];
      return [...new Set(categories)]; // Remove duplicates
    } catch (error) {
      return ['General', 'Servicii', 'Produse', 'Consultanță'];
    }
  }

  // Adaugă o categorie nouă
  addCategory(categoryName) {
    try {
      const categories = this.getAllCategories();
      if (!categories.includes(categoryName)) {
        categories.push(categoryName);
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
      }
      return true;
    } catch (error) {
      console.error('Eroare adăugare categorie:', error);
      return false;
    }
  }

  // ============ TEMPLATE-URI CLIENȚI ============

  // Salvează un template de client
  saveClientTemplate(client) {
    try {
      const templates = this.getAllClientTemplates();
      
      const template = {
        guid: client.guid || '', // Păstrează GUID-ul dacă există
        id: Date.now(),
        name: client.name || client.clientName || '',
        cui: client.cui || client.clientCUI || '',
        regCom: client.regCom || client.clientRegCom || '',
        address: client.address || client.clientAddress || '',
        city: client.city || client.clientCity || '',
        county: client.county || client.clientCounty || '',
        country: client.country || client.clientCountry || 'Romania',
        phone: client.phone || client.clientPhone || '',
        email: client.email || client.clientEmail || '',
        vatPrefix: client.vatPrefix || client.clientVatPrefix || 'RO',
        bankAccounts: client.bankAccounts || client.clientBankAccounts || [{ bank: '', iban: '', currency: 'RON' }],
        isFavorite: client.isFavorite || false,
        usageCount: 0,
        createdAt: Date.now(),
        lastUsed: null
      };

      // Verifică duplicate după CUI sau nume
      const exists = templates.find(t => 
        (t.cui && template.cui && t.cui === template.cui) ||
        (t.name.toLowerCase() === template.name.toLowerCase())
      );

      if (exists) {
        // Actualizează template existent
        const updated = templates.map(t => 
          t.id === exists.id ? { ...t, ...template, id: exists.id, usageCount: exists.usageCount } : t
        );
        localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(updated));
      } else {
        // Adaugă template nou
        templates.push(template);
        localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(templates));
      }

      return true;
    } catch (error) {
      console.error('Eroare salvare template client:', error);
      return false;
    }
  }

  // Obține toate template-urile de clienți
  getAllClientTemplates() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CLIENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Eroare citire template-uri clienți:', error);
      return [];
    }
  }

  // Obține template-uri clienți filtrate
  getClientTemplates({ search = '', onlyFavorites = false } = {}) {
    let templates = this.getAllClientTemplates();

    // Filtrare după căutare
    if (search) {
      const searchLower = search.toLowerCase().trim();
      const searchNumbers = search.replace(/\D/g, ''); // Doar cifre pentru CUI
      
      templates = templates.filter(t => {
        // Căutare în nume
        if (t.name?.toLowerCase().includes(searchLower)) return true;
        
        // Căutare în CUI (cu și fără caractere speciale)
        if (t.cui) {
          const cuiStr = String(t.cui).toLowerCase();
          const cuiNumbers = String(t.cui).replace(/\D/g, ''); // Doar cifre
          if (cuiStr.includes(searchLower) || (searchNumbers && cuiNumbers.includes(searchNumbers))) {
            return true;
          }
        }
        
        // Căutare în email
        if (t.email?.toLowerCase().includes(searchLower)) return true;
        
        return false;
      });
    }

    // Doar favorite
    if (onlyFavorites) {
      templates = templates.filter(t => t.isFavorite);
    }

    // Sortare: favorite primele, apoi după usage count, apoi alfabetic
    templates.sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return b.isFavorite - a.isFavorite;
      if (a.usageCount !== b.usageCount) return b.usageCount - a.usageCount;
      return a.name.localeCompare(b.name);
    });

    return templates;
  }

  // Actualizează un template de client existent
  updateClientTemplate(id, clientData) {
    try {
      const templates = this.getAllClientTemplates();
      const templateIndex = templates.findIndex(t => t.id === id);
      
      if (templateIndex === -1) {
        console.error('Template client nu a fost găsit:', id);
        return false;
      }

      // Păstrează datele importante (id, usageCount, etc.) și actualizează restul
      const existingTemplate = templates[templateIndex];
      const updatedTemplate = {
        ...existingTemplate,
        name: clientData.name || clientData.clientName || existingTemplate.name,
        cui: clientData.cui || clientData.clientCUI || existingTemplate.cui,
        regCom: clientData.regCom || clientData.clientRegCom || existingTemplate.regCom,
        address: clientData.address || clientData.clientAddress || existingTemplate.address,
        city: clientData.city || clientData.clientCity || existingTemplate.city,
        county: clientData.county || clientData.clientCounty || existingTemplate.county,
        country: clientData.country || clientData.clientCountry || existingTemplate.country,
        phone: clientData.phone || clientData.clientPhone || existingTemplate.phone,
        email: clientData.email || clientData.clientEmail || existingTemplate.email,
        vatPrefix: clientData.vatPrefix || clientData.clientVatPrefix || existingTemplate.vatPrefix,
        bankAccounts: clientData.bankAccounts || existingTemplate.bankAccounts || [],
        updatedAt: Date.now()
      };

      templates[templateIndex] = updatedTemplate;
      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(templates));
      return true;
    } catch (error) {
      console.error('Eroare actualizare template client:', error);
      return false;
    }
  }

  // Șterge un template de client
  deleteClientTemplate(id) {
    try {
      const templates = this.getAllClientTemplates();
      const filtered = templates.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Eroare ștergere template client:', error);
      return false;
    }
  }

  // Marchează un client ca favorit
  toggleClientFavorite(id) {
    try {
      const templates = this.getAllClientTemplates();
      const updated = templates.map(t =>
        t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
      );
      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Eroare toggle favorit client:', error);
      return false;
    }
  }

  // Incrementează usage count pentru un client
  incrementClientUsage(id) {
    try {
      const templates = this.getAllClientTemplates();
      const updated = templates.map(t =>
        t.id === id ? { ...t, usageCount: (t.usageCount || 0) + 1, lastUsed: Date.now() } : t
      );
      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Eroare increment usage client:', error);
      return false;
    }
  }

  // Actualizează GUID-ul pentru un client
  updateClientGuid(id, guid) {
    try {
      const templates = this.getAllClientTemplates();
      const updated = templates.map(t =>
        t.id === id ? { ...t, guid: guid } : t
      );
      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Eroare actualizare GUID client:', error);
      return false;
    }
  }

  // ============ IMPORT/EXPORT TEMPLATE-URI ============

  // Export toate template-urile în JSON
  exportAllTemplates() {
    return {
      products: this.getAllProductTemplates(),
      clients: this.getAllClientTemplates(),
      categories: this.getAllCategories(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Import template-uri din JSON
  importTemplates(data) {
    try {
      if (data.products) {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(data.products));
      }
      if (data.clients) {
        localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(data.clients));
      }
      if (data.categories) {
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(data.categories));
      }
      return true;
    } catch (error) {
      console.error('Eroare import template-uri:', error);
      return false;
    }
  }

  // Clear all templates
  clearAllTemplates() {
    try {
      localStorage.removeItem(STORAGE_KEY_PRODUCTS);
      localStorage.removeItem(STORAGE_KEY_CLIENTS);
      localStorage.removeItem(STORAGE_KEY_CATEGORIES);
      return true;
    } catch (error) {
      console.error('Eroare ștergere template-uri:', error);
      return false;
    }
  }
}

// Export singleton instance
const templateService = new TemplateService();
export default templateService;

