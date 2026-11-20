// The import folders for Partner Center ("Import listings" > "Upload folder"). What Partner Center
// accepts was found on the import of 2026-11-20; see docs/MICROSOFT-STORE.md.
import fs from 'fs';
import path from 'path';
import { SUPPORTED_LANGUAGES, APPX_LANGUAGES } from '../src/i18n/languages';
import { MOTIFS, HERO } from './motifs';
import common from './listing/common.json';
import {
  LANGUAGE_CODES, BATCH_SIZE, importBatches, importRows, toCsv,
} from './partner-center';

const listings = Object.fromEntries(SUPPORTED_LANGUAGES.map((language) => [
  language, JSON.parse(fs.readFileSync(path.join(__dirname, 'listing', `${language}.json`), 'utf8')),
]));
const rowsFor = (imageLanguages) => importRows({ listings, common, folder: 'missing-hours-store-1', imageLanguages });
const cell = (rows, field, language) => {
  const row = rows.find((r) => r[0] === field);
  if (!row) throw new Error(`no row ${field}`);
  return row[rows[0].indexOf(LANGUAGE_CODES[language])];
};

it('has a Partner Center language for every UI language, the package language in lower case', () => {
  expect(Object.keys(LANGUAGE_CODES).sort()).toEqual([...SUPPORTED_LANGUAGES].sort());
  SUPPORTED_LANGUAGES.forEach((language) => expect(LANGUAGE_CODES[language]).toBe(APPX_LANGUAGES[language].toLowerCase()));
});

it('splits the languages into folders of BATCH_SIZE, numbered from 1', () => {
  const batches = importBatches(SUPPORTED_LANGUAGES);
  expect(BATCH_SIZE).toBe(4);
  expect(batches.map((b) => b.folder)).toEqual(['missing-hours-store-1', 'missing-hours-store-2', 'missing-hours-store-3']);
  expect(batches.flatMap((b) => b.languages)).toEqual(SUPPORTED_LANGUAGES);
  expect(importBatches(['de'])).toEqual([{ folder: 'missing-hours-store-1', languages: ['de'] }]);
});

it('starts with the header of the Partner Center export', () => {
  const [header] = rowsFor(['de']);
  expect(header.slice(0, 4)).toEqual(['Field', 'ID', 'Type (Type)', 'default']);
  expect(header.slice(4).sort()).toEqual(Object.values(LANGUAGE_CODES).sort());
});

it('writes the texts of every language, also those without images in this folder', () => {
  const rows = rowsFor(['de']);
  SUPPORTED_LANGUAGES.forEach((language) => {
    const listing = listings[language];
    expect(cell(rows, 'Title', language)).toBe('Missing Hours');
    expect(cell(rows, 'Description', language)).toBe(listing.description);
    expect(cell(rows, 'ShortDescription', language)).toBe(listing.shortDescription);
    expect(cell(rows, 'DevStudio', language)).toBe(common.developer);
    expect(cell(rows, 'CopyrightTrademarkInformation', language)).toBe(common.copyright);
    listing.features.forEach((feature, i) => expect(cell(rows, `Feature${i + 1}`, language)).toBe(feature));
    listing.searchTerms.forEach((term, i) => expect(cell(rows, `SearchTerm${i + 1}`, language)).toBe(term));
    MOTIFS.forEach((motif, i) => {
      expect(cell(rows, `DesktopScreenshotCaption${i + 1}`, language)).toBe(listing.screenshots[motif.key].caption);
    });
  });
});

it('clears features past the listing, so a removed feature leaves the Store', () => {
  const rows = rowsFor(['de']);
  expect(cell(rows, 'Feature20', 'de')).toBe('');
  expect(cell(rows, `Feature${listings.de.features.length + 1}`, 'de')).toBe('');
});

it('refers to the images by the folder name, only for the languages in the folder', () => {
  const rows = rowsFor(['de', 'ja']);
  ['de', 'ja'].forEach((language) => {
    MOTIFS.forEach((motif, i) => {
      expect(cell(rows, `DesktopScreenshot${i + 1}`, language)).toBe(`missing-hours-store-1/${language}/${motif.file}.png`);
    });
    expect(cell(rows, 'PromoImage1920x1080', language)).toBe(`missing-hours-store-1/${language}/${HERO.file}.png`);
  });
  // An empty image cell keeps the image Partner Center already has.
  expect(cell(rows, 'DesktopScreenshot1', 'en')).toBe('');
  expect(cell(rows, 'PromoImage1920x1080', 'en')).toBe('');
});

it('keeps the field IDs and types of the export and the trailer rows, which must not be removed', () => {
  const rows = rowsFor(['de']);
  const id = (field) => rows.find((r) => r[0] === field).slice(1, 3);
  expect(id('Description')).toEqual(['2', 'Text']);
  expect(id('Title')).toEqual(['4', 'Text']);
  expect(id('ShortDescription')).toEqual(['8', 'Text']);
  expect(id('DevStudio')).toEqual(['9', 'Text']);
  expect(id('CopyrightTrademarkInformation')).toEqual(['12', 'Text']);
  expect(id('DesktopScreenshot1')).toEqual(['100', 'Relative path (or URL to file in Partner Center)']);
  expect(id('DesktopScreenshotCaption1')).toEqual(['150', 'Text']);
  expect(id('PromoImage1920x1080')).toEqual(['606', 'Relative path (or URL to file in Partner Center)']);
  expect(id('Feature1')).toEqual(['700', 'Text']);
  expect(id('Feature20')).toEqual(['719', 'Text']);
  expect(id('SearchTerm1')).toEqual(['900', 'Text']);
  expect(id('SearchTerm7')).toEqual(['906', 'Text']);
  expect(id('TrailerToPlayAtTopOfListing')).toEqual(['999', 'Relative path (or URL to file in Partner Center)']);
  expect(id('Trailer15')).toEqual(['1014', 'Relative path (or URL to file in Partner Center)']);
  expect(id('TrailerTitle1')).toEqual(['1020', 'Text']);
  expect(id('TrailerThumbnail15')).toEqual(['1054', 'Relative path (or URL to file in Partner Center)']);
  expect(id('TrailerClosedCaption1')).toEqual(['1055', 'Relative path (or URL to file in Partner Center)']);
  expect(id('TrailerAudioDescription15')).toEqual(['1084', 'Relative path (or URL to file in Partner Center)']);
  // Fields the listing does not manage are left out: a missing row keeps what Partner Center has.
  expect(rows.find((r) => r[0] === 'ReleaseNotes')).toBeUndefined();
  expect(rows.every((r) => r.length === rows[0].length)).toBe(true);
});

it('writes UTF-8 CSV with BOM and CRLF, quoting commas, quotes and line breaks', () => {
  const csv = toCsv([['Field', 'ID'], ['Description', 'a, "b"\nc'], ['Title', 'Missing Hours']]);
  expect(csv).toBe('﻿Field,ID\r\nDescription,"a, ""b""\nc"\r\nTitle,Missing Hours\r\n');
});
