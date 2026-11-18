// Every language must be complete: same keys and placeholders as English, no empty texts,
// and listed in the Microsoft Store package. See CLAUDE.md, "Multilingual".
import fs from 'fs';
import path from 'path';
import locales from '../locales';
import { APPX_LANGUAGES, SUPPORTED_LANGUAGES } from './languages';

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const reference = locales.en;

// Flat map 'a.b.c' -> leaf value; arrays count as one leaf.
function flatten(object, prefix = '') {
  return Object.entries(object).reduce((leaves, [key, value]) => {
    const name = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) return { ...leaves, ...flatten(value, name) };
    return { ...leaves, [name]: value };
  }, {});
}

const placeholders = (value) =>
  [].concat(value).flatMap((text) => [...String(text).matchAll(/{{\s*([^,}\s]+)/g)].map((m) => m[1])).sort();

const languages = Object.keys(locales);

it('every supported language has a locale file and nothing else', () => {
  const files = fs.readdirSync(LOCALES_DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
  expect(files.sort()).toEqual([...SUPPORTED_LANGUAGES].sort());
  expect(languages.sort()).toEqual([...SUPPORTED_LANGUAGES].sort());
});

it('the Store package lists every language', () => {
  const appx = require('../../package.json').build.appx.languages;
  expect([...appx].sort()).toEqual(Object.values(APPX_LANGUAGES).sort());
});

describe.each(languages)('%s', (language) => {
  const leaves = flatten(locales[language]);
  const referenceLeaves = flatten(reference);

  it('has exactly the keys of en', () => {
    expect(Object.keys(leaves).sort()).toEqual(Object.keys(referenceLeaves).sort());
  });

  it('has no empty texts', () => {
    const empty = Object.entries(leaves)
      .filter(([, value]) => [].concat(value).some((text) => typeof text !== 'string' || text.trim() === ''))
      .map(([key]) => key);
    expect(empty).toEqual([]);
  });

  it('keeps the placeholders of en', () => {
    const differing = Object.keys(referenceLeaves)
      .filter((key) => key in leaves && key !== 'trackingPhrases')
      .filter((key) => placeholders(leaves[key]).join() !== placeholders(referenceLeaves[key]).join());
    expect(differing).toEqual([]);
  });

  it('has at least two tracking phrases', () => {
    expect(Array.isArray(leaves.trackingPhrases)).toBe(true);
    expect(leaves.trackingPhrases.length).toBeGreaterThanOrEqual(2);
  });
});

// A first-time user must immediately understand that tracking is running.
it('starts the tracking phrases with a plain phrase', () => {
  expect(locales.de.trackingPhrases[0]).toBe('Tracking läuft');
  expect(locales.en.trackingPhrases[0]).toBe('Tracking');
});
