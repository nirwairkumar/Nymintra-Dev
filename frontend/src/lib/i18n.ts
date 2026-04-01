import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import { detectRegionLanguage, browserPrefersHindi } from '@/lib/languageDetector';

const LANG_STORAGE_KEY = 'nymintra_lang';

/**
 * Determines the initial language using the cascading detection logic:
 * 1. Explicit user preference (localStorage)
 * 2. Browser navigator.languages check for Hindi
 * 3. Fallback to 'en' (geo-detection is async and applied after init)
 */
function getInitialLanguage(): string {
  // 1. Check stored preference
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored && (stored === 'hi' || stored === 'en')) return stored;

  // 2. Check browser language preference
  if (browserPrefersHindi()) return 'hi';

  // 3. Default to English (geo-detection will override if needed, post-init)
  return 'en';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANG_STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

// Async geo-detection: only runs if user has no stored preference
// and browser doesn't already prefer Hindi
const storedPref = localStorage.getItem(LANG_STORAGE_KEY);
if (!storedPref) {
  detectRegionLanguage().then(geoLang => {
    // Only override if we're currently on 'en' and geo says 'hi'
    if (geoLang === 'hi' && i18n.language === 'en') {
      i18n.changeLanguage('hi');
      localStorage.setItem(LANG_STORAGE_KEY, 'hi');
      document.documentElement.lang = 'hi';
    }
  });
}

// Keep <html lang> in sync
document.documentElement.lang = i18n.language;
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem(LANG_STORAGE_KEY, lng);
});

export default i18n;
export { LANG_STORAGE_KEY };
