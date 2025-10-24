/**
 * Date formatting services for the application
 */

/**
 * Format date for display with localization support
 * @param {string} dateString - The date string to format
 * @param {string} language - The current language ('en' or 'ro')
 * @param {object} options - Additional formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, language = 'en', options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };

  const locale = language === 'ro' ? 'ro-RO' : 'en-US';
  return new Date(dateString).toLocaleDateString(locale, defaultOptions);
};

/**
 * Format date for compact display (used in lists)
 * @param {string} dateString - The date string to format
 * @param {string} language - The current language ('en' or 'ro')
 * @returns {string} Compact formatted date string
 */
export const formatCompactDate = (dateString, language = 'en') => {
  return formatDate(dateString, language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format date for page headers (used in article details)
 * @param {string} dateString - The date string to format
 * @param {string} language - The current language ('en' or 'ro')
 * @returns {string} Detailed formatted date string
 */
export const formatDetailedDate = (dateString, language = 'en') => {
  return formatDate(dateString, language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format date for homepage header (used for current date)
 * @param {string} dateString - The date string to format
 * @param {string} language - The current language ('en' or 'ro')
 * @returns {string} Header formatted date string
 */
export const formatHeaderDate = (dateString, language = 'en') => {
  return formatDate(dateString, language, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}; 