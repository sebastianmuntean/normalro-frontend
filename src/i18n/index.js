import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../locales/en/common.json';
import roCommon from '../locales/ro/common.json';

const resources = {
  en: {
    common: enCommon
  },
  ro: {
    common: roCommon
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ro'],
    defaultNS: 'common',
    ns: ['common'],
    debug: false,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language'
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 