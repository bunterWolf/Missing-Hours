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
const path = require('path');
const {
  ROOT, NEUTRAL_POINTER, localeFor, formatLocaleFor, pickLanguages, launchApp,
} = require('./lib/launch-app');
const { CHECKED_TEXT, findLayoutProblems } = require('./lib/layout-check');

const OUT_DIR = path.join(ROOT, 'screenshots');
const LOCALES_DIR = path.join(ROOT, 'src', 'locales');
const THEMES = ['light', 'dark'];
// A long working day for the footer (active, inactive, tracked); the sample data only has short durations.
const LONG_DAY = [{ hours: 8, minutes: 45 }, { hours: 1, minutes: 50 }, { hours: 10, minutes: 35 }];

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

// The footer values of LONG_DAY in this language, from its language file.
function longDayValues(language) {
  const locale = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, `${language}.json`), 'utf8'));
  return LONG_DAY.map(({ hours, minutes }) => locale.timeFormats.durationHoursMinutes
    .replace('{{hours}}', hours)
    .replace('{{minutes}}', minutes));
}

async function checkLanguage(language, report) {
  const { app, page, close } = await launchApp({ language, args: ['--mock-data'] });
  try {
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
    await close();
  }
}

async function main() {
  const languages = pickLanguages(process.argv.slice(2));

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
