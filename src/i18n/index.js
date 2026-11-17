// i18next setup for the renderer: picks the UI language from the system and formats dates and
// times with the system region. Texts live in src/locales; the rules are in ./languages.js.
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import locales from '../locales';
import { formatLocale, hourLabelOptions, resolveLanguage } from './languages';

const remote = require('electron').remote || require('@electron/remote');

function tryRead(read) {
  try {
    return read();
  } catch {
    return undefined;
  }
}

// `--lang=<locale>` on the command line (screenshots, testing a language) wins over the system;
// with a region (`--lang=ko-KR`) it also sets the date and time formats.
const forcedLocale = (tryRead(() => remote.process.argv) || [])
  .find((arg) => arg.startsWith('--lang='))?.slice('--lang='.length);

// The forced locale, then the Windows display languages in order of preference, then Chromium's
// locale, then the browser's.
function languageCandidates() {
  return [
    forcedLocale,
    ...(tryRead(() => remote.app.getPreferredSystemLanguages()) || []),
    tryRead(() => remote.app.getLocale()),
    typeof navigator !== 'undefined' ? navigator.language : undefined,
  ];
}

const systemLocale = tryRead(() => new Intl.Locale(forcedLocale).region)
  ? forcedLocale
  : tryRead(() => remote.app.getSystemLocale());

const formatters = {
  // Hour labels of the timeline gutter
  time: (value, locale) => hourLabelOptions(locale),
  weekday: () => ({ weekday: 'long' }),
  // Year only when it is not the current year
  dateShort: (value) => (value.getFullYear() === new Date().getFullYear()
    ? { month: 'long', day: 'numeric' }
    : { month: 'long', day: 'numeric', year: 'numeric' }),
};

i18next
  .use(initReactI18next)
  .init({
    resources: Object.fromEntries(Object.entries(locales).map(([lng, translation]) => [lng, { translation }])),
    lng: resolveLanguage(languageCandidates()),
    fallbackLng: 'en',
    load: 'currentOnly',
    interpolation: {
      escapeValue: false, // React escapes
      format(value, format, lng) {
        const options = formatters[format];
        if (!options || !(value instanceof Date)) return value;
        const locale = formatLocale(lng, systemLocale);
        return new Intl.DateTimeFormat(locale, options(value, locale)).format(value);
      },
    },
  });

// Screen readers and the CJK font choice (Chinese vs. Japanese glyphs) depend on the document language.
if (typeof document !== 'undefined') document.documentElement.lang = i18next.language;

export default i18next;
