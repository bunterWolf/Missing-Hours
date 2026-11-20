// Electron main script: renders Store images from store/template/index.html.
//   electron store/template/render.js <jobs.json>
// jobs.json: [{ out, importOut?, layout: 'screenshot' | 'hero', theme, lang, headline?, subline?, windows: [{ src, theme }] }]
// with absolute file paths for out, importOut and src. Writes each out (PNG, 3840 x 2160), importOut
// (the same image at 1920 x 1080, for the Partner Center import, store/partner-center.js) and
// <jobs.json>.result.json = { problems: [...] }. Exit code 0 also with problems (the caller reports
// them), 1 on a crash.
//
// Runs in its own process because the app is captured with --force-device-scale-factor=2.5, while this
// page needs scale 1 plus an emulated device scale of 2.5. Found while trying it out (2026-11-19):
// capturePage only returns screen size, offscreen windows crashed with the emulation, hidden windows do
// not paint, and Chromium keeps the zoom of file:// pages between runs (hence a fresh partition).
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { app, BrowserWindow } = require('electron');

const CANVAS = { width: 1536, height: 864 };
const SCALE = 2.5; // 1536 x 864 -> 3840 x 2160
const IMPORT_SCALE = 0.5; // of the capture: 3840 x 2160 -> 1920 x 1080
const JOB_TIMEOUT_MS = 30000;

const jobsFile = path.resolve(process.argv[process.argv.length - 1]);

app.commandLine.appendSwitch('force-device-scale-factor', '1');
for (const flag of ['disable-backgrounding-occluded-windows', 'disable-renderer-backgrounding', 'disable-background-timer-throttling']) {
  app.commandLine.appendSwitch(flag);
}
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

const fail = (error) => {
  console.error(error && error.stack ? error.stack : error);
  app.exit(1);
};
process.on('uncaughtException', fail);
process.on('unhandledRejection', fail);

const withTimeout = (promise, what) => Promise.race([
  promise,
  new Promise((resolve, reject) => setTimeout(() => reject(new Error(`Timed out: ${what}`)), JOB_TIMEOUT_MS)),
]);

app.whenReady().then(async () => {
  const jobs = JSON.parse(fs.readFileSync(jobsFile, 'utf8'));
  // Visible but off screen: only a shown window paints.
  const win = new BrowserWindow({
    x: -6000, y: 0, ...CANVAS, useContentSize: true, show: true, frame: false, skipTaskbar: true, focusable: false,
    webPreferences: { partition: `store-render-${process.pid}-${Date.now()}` },
  });
  await win.loadURL('about:blank');
  const cdp = win.webContents.debugger;
  cdp.attach('1.3');
  await cdp.sendCommand('Emulation.setDeviceMetricsOverride', { ...CANVAS, deviceScaleFactor: SCALE, mobile: false });
  await win.loadFile(path.join(__dirname, 'index.html'));
  win.webContents.setZoomFactor(1);

  const problems = [];
  for (const job of jobs) {
    const pageJob = { ...job, windows: job.windows.map((w) => ({ ...w, src: pathToFileURL(w.src).href })) };
    const found = await withTimeout(
      win.webContents.executeJavaScript(`window.renderJob(${JSON.stringify(pageJob)})`),
      `render ${job.out}`,
    );
    found.forEach((problem) => problems.push(`${job.lang} ${path.basename(job.out)}: ${problem}`));
    const capture = async (file, scale) => {
      const shot = await withTimeout(
        cdp.sendCommand('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, ...CANVAS, scale } }),
        `capture ${file}`,
      );
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
    };
    await capture(job.out, 1);
    if (job.importOut) await capture(job.importOut, IMPORT_SCALE);
  }
  fs.writeFileSync(`${jobsFile}.result.json`, JSON.stringify({ problems }, null, 2));
  win.destroy();
  app.quit();
}).catch(fail);
