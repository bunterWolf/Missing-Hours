// Date and time formats of the UI, one Intl pattern each, so every language gets its own order
// and punctuation. Used through the `{{value, <format>}}` keys in src/locales (timeFormats.*).
import { hourLabelOptions } from './languages';

const FORMATS = {
  // Hour labels of the timeline gutter
  time: (date, locale) => hourLabelOptions(locale),
  // Date in the toolbar: weekday in full, month short (room next to the tracking button), the year
  // only when it is not the current year
  dateLabel: (date, locale, now) => (date.getFullYear() === now.getFullYear()
    ? { weekday: 'long', month: 'short', day: 'numeric' }
    : { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
};

/**
 * @param {string} format - Name used in the language files, e.g. 'dateLabel'
 * @param {Date} date
 * @param {string} locale - From formatLocale
 * @param {Date} [now] - For tests; decides whether the year is shown
 * @returns {string|null} null for an unknown format
 */
export function formatDate(format, date, locale, now = new Date()) {
  const options = FORMATS[format];
  return options ? new Intl.DateTimeFormat(locale, options(date, locale, now)).format(date) : null;
}
