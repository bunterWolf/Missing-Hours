// Layout check in every UI language: starts the built app with sample data (--mock-data) once per
// language, in that language's typical region (the Store package language, e.g. en-US: 12-hour
// clock), takes screenshots of today, the sample day, the open zoom choice, a long day and the
// settings in light and dark, and reports UI texts that are cut off, wrap, or are covered.
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
  '.wm-settings-version',
];

// Runs in the page: texts that are cut off, wrap onto a second line, stick out of the window, or
// lie under another element. Widths are compared unrounded: an ellipsis appears even when the text
// is only a fraction of a pixel too wide, which scrollWidth/clientWidth (whole pixels) miss.
function findLayoutProblems(selectors) {
  const problems = [];
  const describe = (el) => `${el.className.split(' ')[0]} "${el.textContent.trim()}"`;
  const textRects = (el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return [...range.getClientRects()].filter((r) => r.width > 0);
  };
  const visibleArea = (el) => {
    const scroller = el.closest('.wm-timeline');
    return scroller ? scroller.getBoundingClientRect() : { top: 0, left: 0, right: innerWidth, bottom: innerHeight };
  };

  for (const el of document.querySelectorAll(selectors.join(','))) {
    const rects = textRects(el);
    const style = getComputedStyle(el);
    if (!el.textContent.trim() || !rects.length || style.visibility !== 'visible') continue;
    const box = el.getBoundingClientRect();
    const contentWidth = box.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const textWidth = Math.max(...rects.map((r) => r.right)) - Math.min(...rects.map((r) => r.left));
    const lines = new Set(rects.map((r) => Math.round(r.bottom))).size;

    if (lines > 1) problems.push(`wraps: ${describe(el)}`);
    else if (style.overflow !== 'visible' && textWidth > contentWidth + 0.05) {
      problems.push(`cut off by ${(textWidth - contentWidth).toFixed(1)}px: ${describe(el)}`);
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

      await page.click('.wm-interval-picker .wm-button');
      await page.waitForSelector('.wm-interval-pill');
      await shoot(page, language, 'zoom', theme, report);
      await page.keyboard.press('Escape');
      await page.waitForSelector('.wm-interval-pill', { state: 'detached' });

      // Long day: only the footer values change (in the page, not in any data), and the sample-data
      // hint goes away as in the real app; leaving for the settings re-renders the footer.
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
