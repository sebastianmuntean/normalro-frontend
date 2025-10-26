import { useEffect } from 'react';

/**
 * Custom hook to set the document title and meta description for SEO
 * @param {string} title - The page title to set
 * @param {string} description - The meta description for SEO (optional)
 * @param {boolean} appendSiteName - Whether to append " - normal.ro" to the title (default: true)
 */
const useDocumentTitle = (title, description = null, appendSiteName = true) => {
  useEffect(() => {
    // Set document title
    if (title) {
      const fullTitle = appendSiteName ? `${title} - normal.ro` : title;
      document.title = fullTitle;
    }
    
    // Set or update meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      
      metaDescription.setAttribute('content', description);
    }
    
    // Cleanup: reset to default title and description when component unmounts
    return () => {
      document.title = 'normal.ro - Instrumente Online Utile';
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 'normal.ro - Colecție de instrumente online utile: generatoare, convertoare, calculatoare și multe altele. Toate gratuite și ușor de folosit.');
      }
    };
  }, [title, description, appendSiteName]);
};

export default useDocumentTitle;

