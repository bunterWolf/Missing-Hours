import i18next from 'i18next';
import locales from '../locales';
import { formatDuration } from './duration';

const MINUTE = 60 * 1000;

function translator(language) {
  const instance = i18next.createInstance();
  instance.init({
    lng: language,
    resources: { [language]: { translation: locales[language] } },
    interpolation: { escapeValue: false },
    initImmediate: false,
  });
  return instance.t;
}

describe('formatDuration', () => {
  const de = translator('de');
  const en = translator('en');

  it.each([
    [0, '0m'], [undefined, '0m'], [NaN, '0m'], [59_999, '0m'],
    [15 * MINUTE, '15m'], [75 * MINUTE, '1h 15m'], [180 * MINUTE, '3h 0m'],
    [75 * MINUTE + 59_999, '1h 15m'],
  ])('de: %p -> %s', (ms, expected) => expect(formatDuration(ms, de)).toBe(expected));

  it('en: hours and minutes', () => {
    expect(formatDuration(75 * MINUTE, en)).toBe('1h 15m');
  });

  it('ja: language-specific wording', () => {
    const ja = translator('ja');
    expect(formatDuration(75 * MINUTE, ja)).toBe('1時間15分');
    expect(formatDuration(5 * MINUTE, ja)).toBe('5分');
  });
});
