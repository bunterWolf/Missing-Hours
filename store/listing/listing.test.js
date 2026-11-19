// The Store listing must be complete in every UI language: same fields as English, no empty
// texts, and within the limits of Partner Center. See docs/MICROSOFT-STORE.md.
import fs from 'fs';
import path from 'path';
import { SUPPORTED_LANGUAGES } from '../../src/i18n/languages';

// Microsoft Learn, "Add and edit Store listing info" and "Screenshots and images" (MSIX), checked
// 2026-11-19. The docs name no limit for search terms; 7 x 30 is an assumption until Partner Center
// shows one. demoTitleLength keeps the demo day's window titles inside a timeline block (437 px window).
const LIMITS = {
  description: 10000,
  shortDescription: 1000,
  shortDescriptionVisible: 270,
  featureCount: 20,
  featureLength: 200,
  caption: 200,
  searchTermCount: 7,
  searchTermLength: 30,
  demoTitleLength: 32,
};

const LISTING_DIR = __dirname;
const read = (language) => JSON.parse(fs.readFileSync(path.join(LISTING_DIR, `${language}.json`), 'utf8'));

// Flat map 'a.b.c' -> leaf value; arrays count as one leaf.
function flatten(object, prefix = '') {
  return Object.entries(object).reduce((leaves, [key, value]) => {
    const name = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) return { ...leaves, ...flatten(value, name) };
    return { ...leaves, [name]: value };
  }, {});
}

const reference = flatten(read('en'));

it('every supported language has a listing file and nothing else', () => {
  const files = fs.readdirSync(LISTING_DIR)
    .filter((f) => f.endsWith('.json') && f !== 'common.json')
    .map((f) => f.replace(/\.json$/, ''));
  expect(files.sort()).toEqual([...SUPPORTED_LANGUAGES].sort());
});

it('common.json has the language-independent fields', () => {
  const common = JSON.parse(fs.readFileSync(path.join(LISTING_DIR, 'common.json'), 'utf8'));
  expect(Object.keys(common).sort()).toEqual(['category', 'copyright', 'developer', 'privacyUrl']);
  Object.values(common).forEach((value) => expect(String(value).trim()).not.toBe(''));
});

describe.each(SUPPORTED_LANGUAGES)('%s', (language) => {
  const listing = read(language);
  const leaves = flatten(listing);

  it('has exactly the fields of en', () => {
    expect(Object.keys(leaves).sort()).toEqual(Object.keys(reference).sort());
  });

  it('has no empty texts', () => {
    Object.entries(leaves).forEach(([name, value]) => {
      [].concat(value).forEach((text) => {
        expect(typeof text).toBe('string');
        expect([name, text.trim()]).not.toEqual([name, '']);
      });
    });
    expect(listing.features.length).toBeGreaterThan(0);
    expect(listing.searchTerms.length).toBeGreaterThan(0);
  });

  it('respects the Store limits', () => {
    expect(listing.description.length).toBeLessThanOrEqual(LIMITS.description);
    expect(listing.shortDescription.length).toBeLessThanOrEqual(LIMITS.shortDescription);
    expect(listing.features.length).toBeLessThanOrEqual(LIMITS.featureCount);
    listing.features.forEach((f) => expect([f, f.length <= LIMITS.featureLength]).toEqual([f, true]));
    expect(listing.searchTerms.length).toBeLessThanOrEqual(LIMITS.searchTermCount);
    listing.searchTerms.forEach((t) => expect([t, t.length <= LIMITS.searchTermLength]).toEqual([t, true]));
    Object.entries(listing.screenshots).forEach(([motif, { caption }]) => {
      expect([motif, caption.length <= LIMITS.caption]).toEqual([motif, true]);
    });
    Object.entries(listing.demoDay.titles).forEach(([key, title]) => {
      expect([key, title, title.length <= LIMITS.demoTitleLength]).toEqual([key, title, true]);
    });
  });

  it('keeps the short description within the visible 270 characters', () => {
    expect(listing.shortDescription.length).toBeLessThanOrEqual(LIMITS.shortDescriptionVisible);
  });
});
