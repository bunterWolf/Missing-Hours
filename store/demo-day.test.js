// The demo day of the Store screenshots runs through the real aggregation, so what the screenshots
// show is what the app makes of these heartbeats. Jest runs in Europe/Berlin (jest.globalSetup.js).
import TimelineGenerator from '../src/store/TimelineGenerator';
import en from './listing/en.json';
import {
  APPS, SCHEDULE, demoDate, expandWindowsPath, resolveAppPaths, buildDemoStoreData,
} from './demo-day';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DATE = new Date(2026, 10, 17); // a Tuesday
const DAY_KEY = '2026-11-17';
const at = (h, m) => new Date(2026, 10, 17, h, m).getTime();
const paths = Object.fromEntries(Object.keys(APPS).map((id) => [id, `C:\\Apps\\${id}.exe`]));

function events(interval) {
  const data = buildDemoStoreData({ date: DATE, titles: en.demoDay.titles, paths });
  const generator = new TimelineGenerator(interval);
  return generator.generateTimelineEvents(data.days[DAY_KEY].heartbeats, at(23, 59) + 1 * HOUR);
}

it('demoDate returns the last Tuesday before today', () => {
  expect(demoDate(new Date(2026, 10, 19, 10))).toEqual(new Date(2026, 10, 17));
  expect(demoDate(new Date(2026, 10, 17, 10))).toEqual(new Date(2026, 10, 10));
});

it('expandWindowsPath replaces %VARS%', () => {
  expect(expandWindowsPath('%LOCALAPPDATA%\\Figma\\Figma.exe', { LOCALAPPDATA: 'C:\\U\\L' }))
    .toBe('C:\\U\\L\\Figma\\Figma.exe');
  expect(() => expandWindowsPath('%NOPE%\\x.exe', {})).toThrow('NOPE');
});

it('resolveAppPaths reports missing programs', () => {
  const env = { ProgramFiles: 'C:\\PF', 'ProgramFiles(x86)': 'C:\\PF86', LOCALAPPDATA: 'C:\\L', WINDIR: 'C:\\W' };
  const { paths: resolved, missing } = resolveAppPaths(env, (p) => !p.includes('Figma'));
  expect(missing).toEqual(['figma']);
  expect(resolved.figma).toBe('C:\\L\\Figma\\Figma.exe');
  expect(Object.keys(resolved).sort()).toEqual(Object.keys(APPS).sort());
});

it('every schedule entry uses a known app and a title of the listing', () => {
  SCHEDULE.filter((s) => s.app).forEach((s) => {
    expect(APPS[s.app]).toBeDefined();
    expect(en.demoDay.titles[s.title]).toBeDefined();
  });
});

it('the demo day aggregates to round totals', () => {
  const summary = new TimelineGenerator(15).calculateSummary(events(15));
  expect(summary.totalActiveDuration).toBe(7.75 * HOUR);
  expect(summary.totalInactiveDuration).toBe(45 * MIN);
  expect(summary.activeTrackingDuration).toBe(8.5 * HOUR);
});

it('the lunch break is one inactive block at 15 minutes', () => {
  const inactive = events(15).filter((e) => e.type === 'inactive');
  expect(inactive).toHaveLength(1);
  expect(inactive[0].timestamp).toBe(at(12, 30));
  expect(inactive[0].duration).toBe(45 * MIN);
});

it('the short Edge visit only shows at 5 minutes', () => {
  const research = (list) => list.filter((e) => e.type === 'appWindow' && e.data.title === en.demoDay.titles.research
    && e.timestamp >= at(9, 45) && e.timestamp < at(10, 0));
  expect(research(events(15))).toHaveLength(0);
  const fine = research(events(5));
  expect(fine).toHaveLength(1);
  expect(fine[0].timestamp).toBe(at(9, 50));
  expect(fine[0].duration).toBe(5 * MIN);
});

it('every heartbeat carries app, title and path', () => {
  const data = buildDemoStoreData({ date: DATE, titles: en.demoDay.titles, paths });
  const { heartbeats } = data.days[DAY_KEY];
  expect(data.aggregationInterval).toBe(15);
  heartbeats.forEach((hb) => {
    const seconds = new Date(hb.timestamp).getSeconds();
    expect([15, 45]).toContain(seconds);
    const { app, title, path } = hb.data.appWindow;
    const id = Object.keys(APPS).find((key) => APPS[key].name === app);
    expect(path).toBe(paths[id]);
    expect(Object.values(en.demoDay.titles)).toContain(title);
  });
  expect(heartbeats[0].timestamp).toBe(at(8, 45) + 15000);
  expect(heartbeats[heartbeats.length - 1].timestamp).toBe(at(17, 14) + 45000);
});
