// Date and time formats of the UI, one Intl pattern each, so every language gets its own order
// and punctuation. Used through the `{{value, <format>}}` keys in src/locales (timeFormats.*).
import { hourLabelOptions } from './languages';

// Languages whose full weekday names do not fit next to the tracking button ("segunda-feira");
// a short weekday is common there.
const SHORT_WEEKDAY_LANGUAGES = ['pt'];

const FORMATS = {
  // Hour labels of the timeline gutter
  time: (locale) => hourLabelOptions(locale),
  // Date in the toolbar: weekday in full, month short, no year (only the last 30 days are kept, so
  // the year is never ambiguous), so it fits next to the tracking button.
  dateLabel: (locale) => ({
    weekday: SHORT_WEEKDAY_LANGUAGES.includes(new Intl.Locale(locale).language) ? 'short' : 'long',
    month: 'short',
    day: 'numeric',
  }),
};

/**
 * @param {string} format - Name used in the language files, e.g. 'dateLabel'
 * @param {Date} date
 * @param {string} locale - From formatLocale
 * @returns {string|null} null for an unknown format
 */
export function formatDate(format, date, locale) {
  const options = FORMATS[format];
  return options ? new Intl.DateTimeFormat(locale, options(locale)).format(date) : null;
}
