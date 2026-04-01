/**
 * Custom i18next language detector for Hindi belt geo-detection.
 * Uses ipapi.co to determine user's Indian state on first visit.
 * Caches result in localStorage to avoid repeat API calls.
 */

const HINDI_BELT_REGIONS = new Set([
  // States
  'uttar pradesh', 'madhya pradesh', 'bihar', 'rajasthan',
  'jharkhand', 'chhattisgarh', 'haryana', 'himachal pradesh',
  'uttarakhand',
  // Union Territories
  'delhi', 'chandigarh',
  // Common API variants
  'national capital territory of delhi',
]);

const GEO_CACHE_KEY = 'nymintra_geo_lang';

/**
 * Detects language based on user's geographic region (Hindi belt).
 * Returns 'hi' for Hindi belt states, 'en' otherwise.
 * Result is cached in localStorage after first detection.
 */
export async function detectRegionLanguage(): Promise<string> {
  // Check cache first
  const cached = localStorage.getItem(GEO_CACHE_KEY);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error('Geo API failed');

    const data = await res.json();
    const region = (data.region || '').toLowerCase().trim();
    const country = (data.country_code || '').toUpperCase();

    let lang = 'en';

    // Only apply Hindi belt logic for users in India
    if (country === 'IN' && HINDI_BELT_REGIONS.has(region)) {
      lang = 'hi';
    }

    localStorage.setItem(GEO_CACHE_KEY, lang);
    return lang;
  } catch {
    // Network error, timeout, or API failure — fallback to English
    localStorage.setItem(GEO_CACHE_KEY, 'en');
    return 'en';
  }
}

/**
 * Checks if the browser's preferred languages include Hindi.
 */
export function browserPrefersHindi(): boolean {
  const languages = navigator.languages || [navigator.language];
  return languages.some(lang => lang.toLowerCase().startsWith('hi'));
}
