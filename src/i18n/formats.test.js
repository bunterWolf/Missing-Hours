import { formatDate } from './formats';

const sep24 = new Date(2024, 8, 24, 9, 0);

describe('formatDate dateLabel', () => {
  // One Intl pattern per language: CJK puts the weekday last, fr/it/nl have no comma. Weekday in full,
  // month short, no year (only the last 30 days are kept, so the year is never ambiguous), so the date
  // fits next to the tracking button.
  it.each([
    ['ja-JP', '9月24日火曜日'],
    ['zh-Hans-CN', '9月24日星期二'],
    ['ko-KR', '9월 24일 화요일'],
    ['fr-FR', 'mardi 24 sept.'],
    ['de-DE', 'Dienstag, 24. Sept.'],
    ['en-US', 'Tuesday, Sep 24'],
  ])('%s', (locale, expected) => {
    expect(formatDate('dateLabel', sep24, locale)).toBe(expected);
  });

  // "segunda-feira" and the like are too long for the toolbar; the short weekday is common in Brazil.
  it('uses the short weekday in Portuguese', () => {
    expect(formatDate('dateLabel', sep24, 'pt-BR')).toBe('ter., 24 de set.');
  });
});

describe('formatDate time (hour labels)', () => {
  it('follows the clock of the locale', () => {
    expect(formatDate('time', sep24, 'en-US')).toBe('9 AM');
    expect(formatDate('time', sep24, 'de-DE')).toBe('09:00');
  });
});

it('returns null for an unknown format', () => {
  expect(formatDate('nope', sep24, 'de-DE')).toBeNull();
});
