// Layout check in every UI language: starts the built app with sample data (--mock-data) once per
// language, in that language's typical region (the Store package language, e.g. en-US: 12-hour
// clock), takes screenshots of today, the sample day (tracking and paused), the open zoom choice, a
// long day (longest date label of the language, long footer values) and the settings (also as in
// the Microsoft Store package) in light and dark, and reports UI texts that are cut off, wrap, or
// are covered.
// Run via `npm run screenshots` (builds first); `node scripts/screenshots.js de ja` checks only some
// languages.
//
// Touches no real data: each run gets its own temporary userData folder, sample data is never saved,
// and the script only looks and navigates (no setting is changed).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { _electron: electron } = require('playwright-core');
const { build } = require('../package.json');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'screenshots');
const LOCALES_DIR = path.join(ROOT, 'src', 'locales');
const THEMES = ['light', 'dark'];
// A long working day for the footer (active, inactive, tracked); the sample data only has short durations.
const LONG_DAY = [{ hours: 8, minutes: 45 }, { hours: 1, minutes: 50 }, { hours: 10, minutes: 35 }];
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

// Single-line UI texts that come from the language files. User data such as window titles may be
// shortened with an ellipsis by design and is not checked, nor is the sample-data hint in the footer
// (development only; it gives way first by design).
const CHECKED_TEXT = [
  '.wm-titlebar-title',
  '.wm-date-nav-label',
  '.wm-button-label',
  '.wm-segmented-option',
  '.wm-interval-pill-label',
  '.wm-timeline-empty',
  '.wm-timeline-event--inactive .wm-timeline-event-title',
  '.wm-tracking-status',
  '.wm-timeline-event-duration',
  '.wm-timeline-hour-label',
  '.wm-day-summary-value',
  '.wm-day-summary-label',
  '.wm-settings-title',
  '.wm-setting-row-title',
  '.wm-settings-website',
  '.wm-settings-version',
];

// Runs in the page: texts that are cut off, wrap onto a second line, stick out of the window, or
// lie under another element. Widths are compared unrounded: an ellipsis appears even when the text
// is only a fraction of a pixel too wide, which scrollWidth/clientWidth (whole pixels) miss.
function findLayoutProblems(selectors) {
  const problems = [];
  const describe = (el) => `${el.className.split(' ')[0]} "${el.textContent.trim()}"`;
  // Measured with the ellipsis switched off: an ellipsized text reports only its visible part.
  const textRects = (el) => {
    const { textOverflow } = el.style;
    el.style.textOverflow = 'clip';
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0);
    el.style.textOverflow = textOverflow;
    return rects;
  };
  // Next to the sample-data hint (development only) the footer is narrower than in the real app;
  // the long-day shot checks the footer without it.
  const devFooter = Boolean(document.querySelector('.wm-footer-mock'));
  const visibleArea = (el) => {
    const scroller = el.closest('.wm-timeline');
    return scroller ? scroller.getBoundingClientRect() : { top: 0, left: 0, right: innerWidth, bottom: innerHeight };
  };

  for (const el of document.querySelectorAll(selectors.join(','))) {
    const rects = textRects(el);
    const style = getComputedStyle(el);
    if (!el.textContent.trim() || !rects.length || style.visibility !== 'visible') continue;
    if (devFooter && el.closest('.wm-footer')) continue;
    const box = el.getBoundingClientRect();
    const contentWidth = box.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const textWidth = Math.max(...rects.map((r) => r.right)) - Math.min(...rects.map((r) => r.left));
    const lines = new Set(rects.map((r) => Math.round(r.bottom))).size;

    // A clipping parent cuts at its padding box; a button (fixed width, overflow: hidden) must keep
    // its padding too, or the label looks squeezed against the edge.
    let parentOverflow = 0;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ps = getComputedStyle(p);
      if (ps.overflowX === 'visible') continue;
      const pr = p.getBoundingClientRect();
      const keepPadding = p.classList.contains('wm-button');
      const left = pr.left + parseFloat(ps.borderLeftWidth) + (keepPadding ? parseFloat(ps.paddingLeft) : 0);
      const right = pr.right - parseFloat(ps.borderRightWidth) - (keepPadding ? parseFloat(ps.paddingRight) : 0);
      const textLeft = Math.min(...rects.map((r) => r.left));
      const textRight = Math.max(...rects.map((r) => r.right));
      parentOverflow = Math.max(left - textLeft, textRight - right);
      break;
    }

    if (lines > 1) problems.push(`wraps: ${describe(el)}`);
    else if (style.overflow !== 'visible' && textWidth > contentWidth + 0.05) {
      problems.push(`cut off by ${(textWidth - contentWidth).toFixed(1)}px: ${describe(el)}`);
    } else if (parentOverflow > 0.05) {
      problems.push(`cut off by its container by ${parentOverflow.toFixed(1)}px: ${describe(el)}`);
    }
    if (box.right > innerWidth + 1 || box.left < -1) problems.push(`outside the window: ${describe(el)}`);

    // Covered: the end of the text must be the topmost element there. The open zoom choice covers
    // the date on purpose, and it lets the pointer through, so hit testing cannot check its own texts.
    if (el.closest('.wm-interval-pill')) continue;
    const last = rects[rects.length - 1];
    const x = Math.min(last.right, box.right) - 1;
    const y = last.top + last.height / 2;
    const area = visibleArea(el);
    if (x < area.left || x > area.right || y < area.top || y > area.bottom) continue;
    const hit = document.elementFromPoint(x, y);
    // An ancestor as hit means el lets the pointer through (pointer-events: none); it is not covered.
    if (hit && !el.contains(hit) && !hit.contains(el) && !hit.closest('.wm-interval-pill')) {
      problems.push(`covered by ${hit.className.split(' ')[0] || hit.tagName}: ${describe(el)}`);
    }
  }
  if (document.documentElement.scrollWidth > innerWidth + 1) problems.push('page scrolls horizontally');
  return problems;
}

async function shoot(page, language, view, theme, report) {
  await page.mouse.move(NEUTRAL_POINTER.x, NEUTRAL_POINTER.y);
  const file = path.join(OUT_DIR, language, `${view}-${theme}.png`);
  // Waiting for fonts occasionally hangs once; a second attempt succeeds.
  await page.screenshot({ path: file }).catch(() => page.screenshot({ path: file }));
  const problems = await page.evaluate(findLayoutProblems, CHECKED_TEXT);
  for (const problem of problems) report.push(`${language} ${view} ${theme}: ${problem}`);
}

// Runs in the page: puts the widest date label of the language into the toolbar (every month, every
// weekday). The options mirror dateLabel in src/i18n/formats.js (an ES module the script cannot load).
function showLongestDate(locale) {
  const label = document.querySelector('.wm-date-nav-label');
  const weekday = new Intl.Locale(locale).language === 'pt' ? 'short' : 'long';
  const format = new Intl.DateTimeFormat(locale, { weekday, month: 'short', day: 'numeric' });
  const year = new Date().getFullYear();
  const probe = label.cloneNode();
  probe.style.cssText = 'position:absolute;visibility:hidden;width:auto;max-width:none';
  label.parentElement.appendChild(probe);
  let widest = '';
  let widestWidth = 0;
  for (let month = 0; month < 12; month += 1) {
    for (let day = 22; day <= 28; day += 1) {
      probe.textContent = format.format(new Date(year, month, day));
      if (probe.getBoundingClientRect().width > widestWidth) {
        widestWidth = probe.getBoundingClientRect().width;
        widest = probe.textContent;
      }
    }
  }
  probe.remove();
  label.textContent = widest;
}

// Intl locale of the app for a language and its package locale (as formatLocale in src/i18n/languages.js).
function formatLocaleFor(language) {
  return new Intl.Locale(language, { region: new Intl.Locale(localeFor(language)).region }).toString();
}

// The footer values of LONG_DAY in this language, from its language file.
function longDayValues(language) {
  const locale = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, `${language}.json`), 'utf8'));
  return LONG_DAY.map(({ hours, minutes }) => locale.timeFormats.durationHoursMinutes
    .replace('{{hours}}', hours)
    .replace('{{minutes}}', minutes));
}

async function checkLanguage(language, report) {
  const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'missing-hours-screenshots-'));
  const app = await electron.launch({
    cwd: ROOT,
    args: ['.', '--mock-data', `--lang=${localeFor(language)}`, `--user-data-dir=${userData}`, ...KEEP_PAINTING],
  });
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
    fs.mkdirSync(path.join(OUT_DIR, language), { recursive: true });

    // Today has no sample data: the running block when tracking, otherwise the empty state.
    // Ready once the dates have loaded (the sample day enables the back arrow).
    await page.waitForSelector('.wm-date-nav-arrows .wm-button:first-child:not([disabled])');
    await page.waitForSelector('.wm-timeline-empty, .wm-timeline-event');
    for (const theme of THEMES) {
      await page.emulateMedia({ colorScheme: theme });
      await shoot(page, language, 'today', theme, report);
    }

    // The sample data lies in the past: go back to it.
    await page.click('.wm-date-nav-arrows .wm-button >> nth=0');
    await page.waitForSelector('.wm-timeline-event');

    for (const theme of THEMES) {
      await page.emulateMedia({ colorScheme: theme });

      await shoot(page, language, 'day', theme, report);

      // Paused (in mock data mode the button only switches a flag), then tracking again.
      await page.click('.wm-tracking-button');
      await page.waitForSelector('.wm-tracking-button:not(.is-tracking)');
      await shoot(page, language, 'paused', theme, report);
      await page.click('.wm-tracking-button');
      await page.waitForSelector('.wm-tracking-button.is-tracking');

      await page.click('.wm-interval-picker .wm-button');
      await page.waitForSelector('.wm-interval-pill');
      await shoot(page, language, 'zoom', theme, report);
      await page.keyboard.press('Escape');
      await page.waitForSelector('.wm-interval-pill', { state: 'detached' });

      // Long day: the longest date label and long footer values, set in the page only (not in any data);
      // the sample-data hint goes away as in the real app. Leaving for the settings re-renders both.
      await page.evaluate(showLongestDate, formatLocaleFor(language));
      await page.evaluate((values) => {
        document.querySelectorAll('.wm-day-summary-value').forEach((el, i) => { el.textContent = values[i]; });
        document.querySelector('.wm-footer-mock')?.remove();
      }, longDayValues(language));
      await shoot(page, language, 'day-long', theme, report);

      await page.click('.wm-titlebar-button-settings');
      await page.waitForSelector('.wm-setting-row');
      await shoot(page, language, 'settings', theme, report);
      await page.click('.wm-settings-toolbar .wm-button');
      await page.waitForSelector('.wm-timeline-event');
    }

    // Settings as in the Microsoft Store package: only this app instance's answer changes.
    await app.evaluate(({ ipcMain }) => {
      ipcMain.removeHandler('get-settings');
      ipcMain.handle('get-settings', () => ({ allowPrerelease: false, isWindowsStore: true }));
    });
    await page.click('.wm-titlebar-button-settings');
    await page.waitForSelector('.wm-settings-row-action');
    for (const theme of THEMES) {
      await page.emulateMedia({ colorScheme: theme });
      await shoot(page, language, 'settings-store', theme, report);
    }
  } finally {
    await app.close();
    fs.rmSync(userData, { recursive: true, force: true });
  }
}

async function main() {
  const requested = process.argv.slice(2);
  const unknown = requested.filter((language) => !ALL_LANGUAGES.includes(language));
  if (unknown.length) throw new Error(`Unknown language(s): ${unknown.join(', ')}. Available: ${ALL_LANGUAGES.join(', ')}`);
  const languages = requested.length ? requested : ALL_LANGUAGES;

  const report = [];
  for (const language of languages) {
    console.log(`Screenshots: ${language} (${localeFor(language)})`);
    await checkLanguage(language, report);
  }
  console.log(`\nSaved to ${OUT_DIR}`);
  if (report.length) {
    console.error(`\nLayout problems (${report.length}):\n${report.map((line) => `  ${line}`).join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log('No layout problems found.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
