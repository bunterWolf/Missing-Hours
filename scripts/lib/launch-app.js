// Starts the built app for screenshots, in one UI language and that language's typical region (the
// Store package language, e.g. en-US: 12-hour clock). Shared by scripts/screenshots.js and
// scripts/store-screenshots.js.
//
// Touches no real data: each start gets its own temporary userData folder, and the start is stopped
// if the app uses another folder. Callers pass --mock-data, so nothing is tracked or saved.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { _electron: electron } = require('playwright-core');
const { build } = require('../../package.json');

const ROOT = path.join(__dirname, '..', '..');
const LOCALES_DIR = path.join(ROOT, 'src', 'locales');
// Chromium stops painting covered or background windows; screenshots and input would then hang
// while someone works in other windows.
const KEEP_PAINTING = [
  '--disable-features=CalculateNativeWinOcclusion',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-background-timer-throttling',
];
// Somewhere the pointer hovers nothing, so no button shows its hover state.
const NEUTRAL_POINTER = { x: 2, y: 300 };

// One language per JSON file in src/locales (the same list as SUPPORTED_LANGUAGES, checked by tests).
const ALL_LANGUAGES = fs.readdirSync(LOCALES_DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
const CHINESE_REGIONS = { 'zh-Hans': 'zh-CN', 'zh-Hant': 'zh-TW' };

// The language's Store package locale (build.appx.languages), which also sets the region.
function localeFor(language) {
  const tag = CHINESE_REGIONS[language]
    || build.appx.languages.find((t) => t === language || t.startsWith(`${language}-`));
  if (!tag) throw new Error(`No Store package language for ${language} in package.json build.appx.languages.`);
  return tag;
}

// Intl locale of the app for a language and its package locale (as formatLocale in src/i18n/languages.js).
function formatLocaleFor(language) {
  return new Intl.Locale(language, { region: new Intl.Locale(localeFor(language)).region }).toString();
}

// Throws for languages without a file in src/locales; returns all languages when none are requested.
function pickLanguages(requested) {
  const unknown = requested.filter((language) => !ALL_LANGUAGES.includes(language));
  if (unknown.length) throw new Error(`Unknown language(s): ${unknown.join(', ')}. Available: ${ALL_LANGUAGES.join(', ')}`);
  return requested.length ? requested : ALL_LANGUAGES;
}

async function launchApp({ language, args = [] }) {
  const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'missing-hours-screenshots-'));
  const app = await electron.launch({
    cwd: ROOT,
    args: ['.', `--lang=${localeFor(language)}`, `--user-data-dir=${userData}`, ...KEEP_PAINTING, ...args],
  });
  const close = async () => {
    await app.close();
    fs.rmSync(userData, { recursive: true, force: true });
  };
  try {
    const actualUserData = await app.evaluate(({ app: electronApp }) => electronApp.getPath('userData'));
    if (path.resolve(actualUserData) !== path.resolve(userData)) {
      throw new Error(`The app uses ${actualUserData} instead of the temporary folder; stopping so no real data is touched.`);
    }
    const page = await app.firstWindow();
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].webContents.setBackgroundThrottling(false));
    await page.waitForSelector('.wm-app');
    const documentLanguage = await page.evaluate(() => document.documentElement.lang);
    if (documentLanguage !== language) throw new Error(`Expected <html lang="${language}">, got "${documentLanguage}".`);
    return { app, page, close };
  } catch (error) {
    await close();
    throw error;
  }
}

module.exports = {
  ROOT, KEEP_PAINTING, NEUTRAL_POINTER, ALL_LANGUAGES, localeFor, formatLocaleFor, pickLanguages, launchApp,
};
