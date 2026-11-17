import { APPX_LANGUAGES, SUPPORTED_LANGUAGES, formatLocale, hourLabelOptions, resolveLanguage } from './languages';

describe('SUPPORTED_LANGUAGES', () => {
  it('lists the twelve languages, English first', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['en', 'de', 'fr', 'es', 'it', 'pt-BR', 'nl', 'pl', 'ja', 'ko', 'zh-Hans', 'zh-Hant']);
    expect(Object.keys(APPX_LANGUAGES)).toEqual(SUPPORTED_LANGUAGES);
  });
});

describe('resolveLanguage', () => {
  it.each([
    [['de-DE'], 'de'], [['de_AT'], 'de'], [['sv-SE', 'fr-CA'], 'fr'], [['ar-SA', 'en-GB'], 'en'],
    [['sv-SE', 'de-DE'], 'de'],
    [['zh-CN'], 'zh-Hans'], [['zh-SG'], 'zh-Hans'], [['zh'], 'zh-Hans'], [['zh-Hans-HK'], 'zh-Hans'],
    [['zh-TW'], 'zh-Hant'], [['zh-HK'], 'zh-Hant'], [['zh-MO'], 'zh-Hant'], [['zh-Hant-CN'], 'zh-Hant'],
    [['pt-PT'], 'pt-BR'], [['pt'], 'pt-BR'], [['ja-JP'], 'ja'], [['ko-KR'], 'ko'],
    [[], 'en'], [['xx'], 'en'], [[undefined, '', null, 'not a tag!'], 'en'], [['sv-SE'], 'en'],
  ])('%j -> %s', (candidates, expected) => expect(resolveLanguage(candidates)).toBe(expected));
});

describe('formatLocale', () => {
  const hourCycle = (loc) => new Intl.DateTimeFormat(loc, { hour: 'numeric' }).resolvedOptions().hourCycle;

  it('combines the UI language with the system region', () => {
    expect(formatLocale('en', 'de-DE')).toBe('en-DE');
    expect(formatLocale('zh-Hans', 'zh-CN')).toBe('zh-Hans-CN');
    expect(formatLocale('en', 'sv-SE')).toBe('en-SE');
  });

  it('uses the clock of the region', () => {
    expect(hourCycle(formatLocale('en', 'de-DE'))).toBe('h23');
    expect(hourCycle(formatLocale('en', 'en-US'))).toBe('h12');
  });

  it('falls back to the language without a usable region', () => {
    expect(formatLocale('de', '')).toBe('de');
    expect(formatLocale('de', undefined)).toBe('de');
    expect(formatLocale('de', 'invalid_!')).toBe('de');
    expect(formatLocale('fr', 'fr')).toBe('fr');
  });
});

describe('hourLabelOptions', () => {
  const nine = new Date(2024, 0, 1, 9, 0);
  const label = (locale) => new Intl.DateTimeFormat(locale, hourLabelOptions(locale)).format(nine);

  // The hour gutter is narrow: 12-hour clocks show only the hour, as calendars do.
  it('shows only the hour on a 12-hour clock', () => {
    expect(label('en-US')).toBe('9 AM');
    expect(label('ko-KR')).toBe('오전 9시');
  });

  it('keeps hours and minutes on a 24-hour clock', () => {
    expect(label('de-DE')).toBe('09:00');
    expect(label('en-DE')).toBe('09:00');
    expect(label('ja-JP')).toBe('09:00');
  });
});
