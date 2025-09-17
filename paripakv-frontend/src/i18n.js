import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationHI from './locales/hi/translation.json';
import translationMR from './locales/mr/translation.json';
// import translationTA from './locales/ta/translation.json';
// import translationKN from './locales/kn/translation.json';
// import translationTE from './locales/te/translation.json';

const resources = {
    en: { translation: translationEN },
    hi: { translation: translationHI },
    mr: { translation: translationMR },
    // ta: { translation: translationTA },
    // kn: { translation: translationKN },
    // te: { translation: translationTE },
};

i18n
    .use(LanguageDetector) // Detect language from browser or localStorage
    .use(initReactI18next) // Pass i18n instance to react-i18next
    .init({
        resources,
        fallbackLng: 'en', // Default language if not found

        interpolation: {
            escapeValue: false, // React already protects from XSS
        }
    });

export default i18n;
