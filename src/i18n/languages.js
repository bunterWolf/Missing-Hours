// Which UI language the app uses, and which locale formats dates and times.
// Pure functions without Electron, so they can be tested.

// The UI languages; one file each in src/locales. English is the reference and the fallback.
export const SUPPORTED_LANGUAGES = ['en', 'de', 'fr', 'es', 'it', 'pt-BR', 'nl', 'pl', 'ja', 'ko', 'zh-Hans', 'zh-Hant'];

// Language of the Microsoft Store package (package.json build.appx.languages) per UI language.
export const APPX_LANGUAGES = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT',
  'pt-BR': 'pt-BR',
  nl: 'nl-NL',
  pl: 'pl-PL',
  ja: 'ja-JP',
  ko: 'ko-KR',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
};

const FALLBACK_LANGUAGE = 'en';
// Chinese without a script: these regions write Traditional Chinese, all others Simplified.
const TRADITIONAL_CHINESE_REGIONS = ['TW', 'HK', 'MO'];

function parseLocale(tag) {
  if (typeof tag !== 'string' || tag.trim() === '') return null;
  try {
    return new Intl.Locale(tag.trim().replace(/_/g, '-'));
  } catch {
    return null;
  }
}

function toSupportedLanguage(locale) {
  if (locale.language === 'zh') {
    const script = locale.script || (TRADITIONAL_CHINESE_REGIONS.includes(locale.region) ? 'Hant' : 'Hans');
    return `zh-${script}`;
  }
  // pt-BR is the only Portuguese
  if (locale.language === 'pt') return 'pt-BR';
  return SUPPORTED_LANGUAGES.includes(locale.language) ? locale.language : null;
}

/**
 * The first supported UI language among the candidates (system languages in order of preference),
 * otherwise English.
 * @param {Array<string|undefined|null>} candidates - Locale tags such as 'de-DE' or 'zh-Hant-TW'
 * @returns {string} One of SUPPORTED_LANGUAGES
 */
export function resolveLanguage(candidates) {
  for (const candidate of candidates || []) {
    const locale = parseLocale(candidate);
    const language = locale && toSupportedLanguage(locale);
    if (language && SUPPORTED_LANGUAGES.includes(language)) return language;
  }
  return FALLBACK_LANGUAGE;
}

/**
 * Locale for Intl formatting: the UI language with the region of the system, so the words follow
 * the UI and the clock (12h/24h) follows the region. English UI on a German system gives 'en-DE'.
 * @param {string} language - UI language from resolveLanguage
 * @param {string} [systemLocale] - System region locale such as 'de-DE'
 * @returns {string}
 */
export function formatLocale(language, systemLocale) {
  const region = parseLocale(systemLocale)?.region;
  if (!region) return language;
  try {
    return new Intl.Locale(language, { region }).toString();
  } catch {
    return language;
  }
}
