// Import folders for Partner Center: "Import listings" > "Upload folder" takes a folder with one .csv and
// the images. scripts/store-screenshots.js writes them; the steps and what Partner Center accepts are in
// docs/MICROSOFT-STORE.md ("Store-Einträge per Import aktualisieren"). Rules found on the import of
// 2026-11-20:
// - The CSV has the rows of an export ("Export listings"): Field, ID and Type must stay as exported. A
//   missing row keeps what Partner Center has (except the trailer rows, which must stay), an empty text
//   cell falls back to the empty default column (clears the text), an empty image cell keeps the image.
// - Image paths start with the name of the uploaded folder: <folder>/<language>/<file>.png.
// - Big folders outlast the sign-in session (109 MB of 4K images failed), hence 1920 x 1080 images and
//   folders of BATCH_SIZE languages (about 17 MB each).
const { MOTIFS, HERO } = require('./motifs');

// Partner Center column per UI language: the package language (src/i18n/languages.js APPX_LANGUAGES)
// in lower case. CommonJS here because the Node scripts load this file.
const LANGUAGE_CODES = {
  en: 'en-us',
  de: 'de-de',
  fr: 'fr-fr',
  es: 'es-es',
  it: 'it-it',
  'pt-BR': 'pt-br',
  nl: 'nl-nl',
  pl: 'pl-pl',
  ja: 'ja-jp',
  ko: 'ko-kr',
  'zh-Hans': 'zh-cn',
  'zh-Hant': 'zh-tw',
};
const BATCH_SIZE = 4;
const FOLDER_PREFIX = 'missing-hours-store-';
const PRODUCT_NAME = 'Missing Hours'; // the Store title, not translated

const TEXT = 'Text';
const FILE = 'Relative path (or URL to file in Partner Center)';
const MAX_FEATURES = 20;
const MAX_SEARCH_TERMS = 7;

/** Field, ID and Type of every row the import writes, in the order of the export. */
function fieldRows() {
  const numbered = (name, firstId, count, type) => Array.from({ length: count }, (_, i) => [`${name}${i + 1}`, String(firstId + i), type]);
  return [
    ['Description', '2', TEXT],
    ['Title', '4', TEXT],
    ['ShortDescription', '8', TEXT],
    ['DevStudio', '9', TEXT],
    ['CopyrightTrademarkInformation', '12', TEXT],
    ...numbered('DesktopScreenshot', 100, MOTIFS.length, FILE),
    ...numbered('DesktopScreenshotCaption', 150, MOTIFS.length, TEXT),
    ['PromoImage1920x1080', '606', FILE], // the 16:9 Super hero art
    ...numbered('Feature', 700, MAX_FEATURES, TEXT),
    ...numbered('SearchTerm', 900, MAX_SEARCH_TERMS, TEXT),
    ['TrailerToPlayAtTopOfListing', '999', FILE],
    ...numbered('Trailer', 1000, 15, FILE),
    ...numbered('TrailerTitle', 1020, 15, TEXT),
    ...numbered('TrailerThumbnail', 1040, 15, FILE),
    ...numbered('TrailerClosedCaption', 1055, 15, FILE),
    ...numbered('TrailerAudioDescription', 1070, 15, FILE),
  ];
}

/**
 * The import folders: BATCH_SIZE languages each, named missing-hours-store-1, -2, ...
 * @param {string[]} languages - UI languages whose images go into the folders
 * @returns {{ folder: string, languages: string[] }[]}
 */
function importBatches(languages) {
  const batches = [];
  for (let i = 0; i < languages.length; i += BATCH_SIZE) {
    batches.push({ folder: `${FOLDER_PREFIX}${batches.length + 1}`, languages: languages.slice(i, i + BATCH_SIZE) });
  }
  return batches;
}

/**
 * The CSV rows of one import folder: the texts of every listing, the images of imageLanguages.
 * @param {object} args
 * @param {Object<string, object>} args.listings - store/listing/<language>.json per UI language
 * @param {object} args.common - store/listing/common.json
 * @param {string} args.folder - Name of the import folder (start of every image path)
 * @param {string[]} args.imageLanguages - Languages whose images are in <folder>/<language>/
 * @returns {string[][]} Header row first
 */
function importRows({ listings, common, folder, imageLanguages }) {
  const languages = Object.keys(listings);
  const rows = fieldRows().map((row) => [...row, '', ...languages.map(() => '')]);
  const rowOf = new Map(rows.map((row) => [row[0], row]));
  languages.forEach((language, i) => {
    const col = 4 + i;
    const listing = listings[language];
    const set = (field, value) => { rowOf.get(field)[col] = value; };
    set('Description', listing.description);
    set('Title', PRODUCT_NAME);
    set('ShortDescription', listing.shortDescription);
    set('DevStudio', common.developer);
    set('CopyrightTrademarkInformation', common.copyright);
    for (let n = 1; n <= MAX_FEATURES; n++) set(`Feature${n}`, listing.features[n - 1] ?? '');
    for (let n = 1; n <= MAX_SEARCH_TERMS; n++) set(`SearchTerm${n}`, listing.searchTerms[n - 1] ?? '');
    MOTIFS.forEach((motif, n) => set(`DesktopScreenshotCaption${n + 1}`, listing.screenshots[motif.key].caption));
    if (!imageLanguages.includes(language)) return;
    const image = (file) => `${folder}/${language}/${file}.png`;
    MOTIFS.forEach((motif, n) => set(`DesktopScreenshot${n + 1}`, image(motif.file)));
    set('PromoImage1920x1080', image(HERO.file));
  });
  return [['Field', 'ID', 'Type (Type)', 'default', ...languages.map((language) => LANGUAGE_CODES[language])], ...rows];
}

/** UTF-8 CSV with BOM and CRLF, like the export of Partner Center. */
function toCsv(rows) {
  const cell = (value) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  return `﻿${rows.map((row) => row.map(cell).join(',')).join('\r\n')}\r\n`;
}

module.exports = { LANGUAGE_CODES, BATCH_SIZE, importBatches, importRows, toCsv };
