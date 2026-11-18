import { formatDate } from './formats';

const NOW = new Date(2026, 10, 18);
const sep24 = (year) => new Date(year, 8, 24, 9, 0);

describe('formatDate dateLabel', () => {
  // One Intl pattern per language: CJK puts the weekday last, fr/it/nl have no comma. The weekday
  // stays long, the month is short so the date fits next to the tracking button.
  it.each([
    ['ja-JP', '2024年9月24日火曜日'],
    ['zh-Hans-CN', '2024年9月24日星期二'],
    ['ko-KR', '2024년 9월 24일 화요일'],
    ['fr-FR', 'mardi 24 sept. 2024'],
    ['de-DE', 'Dienstag, 24. Sept. 2024'],
    ['en-US', 'Tuesday, Sep 24, 2024'],
  ])('%s', (locale, expected) => {
    expect(formatDate('dateLabel', sep24(2024), locale, NOW)).toBe(expected);
  });

  it('omits the year in the current year', () => {
    expect(formatDate('dateLabel', sep24(2026), 'de-DE', NOW)).toBe('Donnerstag, 24. Sept.');
  });
});

describe('formatDate time (hour labels)', () => {
  it('follows the clock of the locale', () => {
    expect(formatDate('time', sep24(2024), 'en-US', NOW)).toBe('9 AM');
    expect(formatDate('time', sep24(2024), 'de-DE', NOW)).toBe('09:00');
  });
});

it('returns null for an unknown format', () => {
  expect(formatDate('nope', sep24(2024), 'de-DE', NOW)).toBeNull();
});
