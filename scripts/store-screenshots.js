// Microsoft Store images in every UI language, from the real app: starts the built app with the demo
// day (store/demo-day.js) per language, captures the window at 250 % in the states of store/motifs.js,
// and renders them onto the 3840 x 2160 Store images (store/template/render.js). Also writes the
// listing texts as listing.md for copying into Partner Center. Fails on cut-off, wrapping or covered
// texts in the app, cut-off window titles of the demo day, and headlines that do not fit.
// Run via `npm run store-screenshots` (builds first); `node scripts/store-screenshots.js de ja` makes
// only some languages. Output: store-screenshots/microsoft/<language>/ (not in git).
//
// Touches no real data: the app runs with --mock-data (no tracking, no saving) in a temporary userData
// folder; the demo day only lives in a temporary file. Icons and brand colors come from the programs
// installed on this machine; a missing program shows in the default event style.
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const electronPath = require('electron');
const { ROOT, NEUTRAL_POINTER, localeFor, pickLanguages, launchApp } = require('./lib/launch-app');
const { CHECKED_TEXT, findLayoutProblems } = require('./lib/layout-check');
const { APPS, SCHEDULE, demoDate, resolveAppPaths, buildDemoStoreData } = require('../store/demo-day');
const { MOTIFS, HERO } = require('../store/motifs');

const OUT_DIR = path.join(ROOT, 'store-screenshots', 'microsoft');
const LISTING_DIR = path.join(ROOT, 'store', 'listing');
const RENDER_SCRIPT = path.join(ROOT, 'store', 'template', 'render.js');
// The app window in the images: default width, taller than the start size so more hours show.
const WINDOW = { width: 437, height: 720 };
const DEVICE_SCALE = 2.5; // 437 x 720 -> 1093 x 1800 px, placed 1:1 in the 1536 x 864 template at scale 2.5
const ICON_TIMEOUT_MS = 10000;
const RENDER_TIMEOUT_MS = 180000;
const MIN_BLOCK_HEIGHT = 24; // px per interval, as getHourHeight in src/components/timeline/timelineGeometry.js

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const minutesOf = (time) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };

// Runs in the page: event titles shortened with an ellipsis (measured like findLayoutProblems).
function findCutTitles() {
  const cut = [];
  for (const el of document.querySelectorAll('.wm-timeline-event-title')) {
    const { textOverflow } = el.style;
    el.style.textOverflow = 'clip';
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0);
    el.style.textOverflow = textOverflow;
    if (!rects.length) continue;
    const style = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    const width = box.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const textWidth = Math.max(...rects.map((r) => r.right)) - Math.min(...rects.map((r) => r.left));
    if (textWidth > width + 0.05) cut.push(el.textContent.trim());
  }
  return cut;
}

// Runs in the page: true once every app event has its icon, except events of programs that are missing.
function iconsLoaded(missingTitles) {
  return [...document.querySelectorAll('.wm-timeline-event--app')].every((event) => {
    const title = event.querySelector('.wm-timeline-event-title')?.textContent.trim();
    const img = event.querySelector('img.wm-timeline-event-icon');
    return missingTitles.includes(title) || (img && img.complete && img.naturalWidth > 0);
  });
}

// The minutes on the zoom button ("15m", "15 分" ...), as a number.
const shownInterval = () => Number(document.querySelector('.wm-interval-picker .wm-button').textContent.match(/\d+/)[0]);

// Sets the zoom through the app's own picker. The button shows the new interval before the newly
// aggregated day arrives, so also wait for the timeline to change: the demo day has a different number
// of blocks at every interval (the short Edge visit only shows at 5 minutes).
async function chooseInterval(page, interval) {
  if (await page.evaluate(shownInterval) === interval) return;
  const blocksBefore = await page.locator('.wm-timeline-event').count();
  await page.click('.wm-interval-picker .wm-button');
  await page.waitForSelector('.wm-interval-pill');
  // INTERVALS in src/components/toolbar/IntervalPicker.js: [15, 10, 5]
  await page.click(`.wm-interval-pill .wm-segmented-option >> nth=${[15, 10, 5].indexOf(interval)}`);
  await page.waitForSelector('.wm-interval-pill', { state: 'detached' });
  await page.waitForFunction(`(${shownInterval})() === ${interval}`);
  await page.waitForFunction((n) => document.querySelectorAll('.wm-timeline-event').length !== n, blocksBefore);
}

// Puts `time` at the top of the timeline: the visible range starts with the first block (8:45).
async function scrollTo(page, time, interval) {
  const offset = (minutesOf(time) - minutesOf(SCHEDULE[0].start)) * (MIN_BLOCK_HEIGHT / interval);
  await page.evaluate((top) => { document.querySelector('.wm-timeline').scrollTop = top; }, offset);
}

async function captureMotif({ app, page, motif, language, missingTitles, tmpDir, report }) {
  await page.emulateMedia({ colorScheme: motif.theme });
  if (motif.view === 'day') {
    await chooseInterval(page, motif.interval);
    await page.waitForSelector('.wm-timeline-event');
    await scrollTo(page, motif.scrollTo, motif.interval);
    await page.waitForFunction(iconsLoaded, missingTitles, { timeout: ICON_TIMEOUT_MS }).catch(() => {
      throw new Error(`${language} ${motif.file}: not every program icon loaded within ${ICON_TIMEOUT_MS / 1000} s.`);
    });
    for (const title of await page.evaluate(findCutTitles)) report.push(`${language} ${motif.file}: event title cut off: "${title}"`);
    if (motif.pickerOpen) {
      await page.click('.wm-interval-picker .wm-button');
      await page.waitForSelector('.wm-interval-pill');
    }
  } else {
    // Settings as in the Microsoft Store package: only this app instance's answer changes.
    await app.evaluate(({ ipcMain }) => {
      ipcMain.removeHandler('get-settings');
      ipcMain.handle('get-settings', () => ({ allowPrerelease: false, isWindowsStore: true }));
    });
    await page.click('.wm-titlebar-button-settings');
    await page.waitForSelector('.wm-settings-row-action');
  }
  await page.mouse.move(NEUTRAL_POINTER.x, NEUTRAL_POINTER.y);
  for (const problem of await page.evaluate(findLayoutProblems, CHECKED_TEXT)) report.push(`${language} ${motif.file}: ${problem}`);
  const file = path.join(tmpDir, `${language}-${motif.file}.png`);
  await page.screenshot({ path: file }).catch(() => page.screenshot({ path: file })); // see screenshots.js
  if (motif.pickerOpen) {
    await page.keyboard.press('Escape');
    await page.waitForSelector('.wm-interval-pill', { state: 'detached' });
  }
  return file;
}

async function captureLanguage({ language, listing, paths, missing, tmpDir, report }) {
  const dataFile = path.join(tmpDir, `demo-day-${language}.json`);
  const data = buildDemoStoreData({ date: demoDate(new Date()), titles: listing.demoDay.titles, paths });
  fs.writeFileSync(dataFile, JSON.stringify(data));
  const missingTitles = SCHEDULE.filter((s) => missing.includes(s.app)).map((s) => listing.demoDay.titles[s.title]);

  const { app, page, close } = await launchApp({
    language,
    args: ['--mock-data', `--mock-data-file=${dataFile}`, `--force-device-scale-factor=${DEVICE_SCALE}`],
  });
  try {
    await app.evaluate(({ BrowserWindow }, size) => {
      BrowserWindow.getAllWindows()[0].setContentSize(size.width, size.height);
    }, WINDOW);
    // The sample-data hint is development only; the real app does not show it.
    await page.addStyleTag({ content: '.wm-footer-mock { display: none !important; }' });
    await page.waitForSelector('.wm-date-nav-arrows .wm-button:first-child:not([disabled])');
    await page.click('.wm-date-nav-arrows .wm-button >> nth=0'); // back from today to the demo day
    await page.waitForSelector('.wm-timeline-event');
    const captures = {};
    for (const motif of MOTIFS) {
      captures[motif.file] = await captureMotif({ app, page, motif, language, missingTitles, tmpDir, report });
    }
    const size = await page.evaluate(() => [innerWidth, innerHeight]);
    if (size[0] !== WINDOW.width || size[1] !== WINDOW.height) throw new Error(`Window is ${size.join(' x ')}, expected ${WINDOW.width} x ${WINDOW.height}.`);
    return captures;
  } finally {
    await close();
  }
}

function renderJobs(language, listing, captures) {
  const out = (file) => path.join(OUT_DIR, language, `${file}.png`);
  const themeOf = (file) => MOTIFS.find((m) => m.file === file).theme;
  return [
    { out: out(HERO.file), layout: 'hero', theme: HERO.theme, lang: language, windows: HERO.windows.map((file) => ({ src: captures[file], theme: themeOf(file) })) },
    ...MOTIFS.map((motif) => ({
      out: out(motif.file),
      layout: 'screenshot',
      theme: motif.theme,
      lang: language,
      headline: listing.screenshots[motif.key].headline,
      subline: listing.screenshots[motif.key].subline,
      windows: [{ src: captures[motif.file], theme: motif.theme }],
    })),
  ];
}

function render(jobs, tmpDir, report) {
  const jobsFile = path.join(tmpDir, 'jobs.json');
  fs.writeFileSync(jobsFile, JSON.stringify(jobs));
  const result = spawnSync(electronPath, [RENDER_SCRIPT, jobsFile], { cwd: ROOT, stdio: 'inherit', timeout: RENDER_TIMEOUT_MS });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Rendering the Store images failed (exit ${result.status}).`);
  report.push(...readJson(`${jobsFile}.result.json`).problems);
}

// The texts to copy into the Partner Center Store listing of this language.
function listingMarkdown(language, listing, common) {
  const lines = [
    `# Store listing: ${language}`,
    '',
    `Category: ${common.category} · Developer: ${common.developer} · Copyright: ${common.copyright}`,
    `Website: ${common.website} · Support: ${common.supportUrl}`,
    `Privacy policy: ${common.privacyUrl}`,
    '',
    '## Short description', '', listing.shortDescription, '',
    '## Description', '', listing.description, '',
    '## Product features', '', ...listing.features.map((f) => `- ${f}`), '',
    '## Search terms', '', ...listing.searchTerms.map((t) => `- ${t}`), '',
    '## Images (upload in this order)', '',
    `- ${HERO.file}.png: 16:9 Super hero art (no caption)`,
    ...MOTIFS.map((m) => `- ${m.file}.png: ${listing.screenshots[m.key].caption}`),
    '',
  ];
  return lines.join('\n');
}

async function main() {
  const languages = pickLanguages(process.argv.slice(2));
  const common = readJson(path.join(LISTING_DIR, 'common.json'));
  const { paths, missing } = resolveAppPaths();
  for (const id of missing) console.warn(`Warning: ${APPS[id].name} not found at ${paths[id]}; it shows without icon and brand color.`);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'missing-hours-store-'));
  const report = [];
  try {
    for (const language of languages) {
      console.log(`Store images: ${language} (${localeFor(language)})`);
      const listing = readJson(path.join(LISTING_DIR, `${language}.json`));
      const captures = await captureLanguage({ language, listing, paths, missing, tmpDir, report });
      fs.mkdirSync(path.join(OUT_DIR, language), { recursive: true });
      render(renderJobs(language, listing, captures), tmpDir, report);
      fs.writeFileSync(path.join(OUT_DIR, language, 'listing.md'), listingMarkdown(language, listing, common));
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  console.log(`\nSaved to ${OUT_DIR}`);
  if (report.length) {
    console.error(`\nProblems (${report.length}):\n${report.map((line) => `  ${line}`).join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log('No problems found.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
