// The demo day of the Store screenshots: a consultant's workday from 8:45 to 17:15 with a lunch break,
// as the app records it, i.e. as heartbeats every 30 seconds. The app aggregates them like real data
// (loaded via --mock-data --mock-data-file=<file>), and reads icon and brand color from each program's
// executable, so the programs should be installed on the machine that makes the screenshots.
// Window titles come per language from store/listing/<language>.json (demoDay.titles).
const fs = require('fs');

const APPS = {
  outlook: { name: 'Outlook', windowsPath: '%ProgramFiles%\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE' },
  word: { name: 'Word', windowsPath: '%ProgramFiles%\\Microsoft Office\\root\\Office16\\WINWORD.EXE' },
  excel: { name: 'Excel', windowsPath: '%ProgramFiles%\\Microsoft Office\\root\\Office16\\EXCEL.EXE' },
  powerpoint: { name: 'PowerPoint', windowsPath: '%ProgramFiles%\\Microsoft Office\\root\\Office16\\POWERPNT.EXE' },
  edge: { name: 'Microsoft Edge', windowsPath: '%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe' },
  chrome: { name: 'Google Chrome', windowsPath: '%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe' },
  figma: { name: 'Figma', windowsPath: '%LOCALAPPDATA%\\Figma\\Figma.exe' },
  explorer: { name: 'Explorer', windowsPath: '%WINDIR%\\explorer.exe' },
};

// Start inclusive, end exclusive, local time. app null = away from the computer. The totals are round
// on purpose (7h 45m active, 45m inactive, 8h 30m tracked); store/demo-day.test.js pins them.
const SCHEDULE = [
  { start: '08:45', end: '09:15', app: 'outlook', title: 'inbox' },
  { start: '09:15', end: '09:50', app: 'word', title: 'proposal' },
  { start: '09:50', end: '09:55', app: 'edge', title: 'research' }, // only visible at 5 minutes
  { start: '09:55', end: '10:30', app: 'word', title: 'proposal' },
  { start: '10:30', end: '10:45', app: 'edge', title: 'research' },
  { start: '10:45', end: '11:30', app: 'excel', title: 'calculation' },
  { start: '11:30', end: '11:45', app: 'explorer', title: 'projectFolder' },
  { start: '11:45', end: '12:30', app: 'powerpoint', title: 'workshop' },
  { start: '12:30', end: '13:15', app: null, title: null },
  { start: '13:15', end: '13:30', app: 'outlook', title: 'inbox' },
  { start: '13:30', end: '14:45', app: 'figma', title: 'processMap' },
  { start: '14:45', end: '15:15', app: 'chrome', title: 'clientPortal' },
  { start: '15:15', end: '16:15', app: 'powerpoint', title: 'kickoff' },
  { start: '16:15', end: '16:45', app: 'excel', title: 'timesheet' },
  { start: '16:45', end: '17:15', app: 'word', title: 'minutes' },
];

const HEARTBEAT_SECONDS = [15, 45]; // as HeartbeatManager: every minute at :15 and :45

// The last Tuesday at least two days before the local day of `now`, at local midnight. Not yesterday:
// the app labels yesterday "Yesterday" instead of a weekday date.
function demoDate(now) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  do date.setDate(date.getDate() - 1); while (date.getDay() !== 2);
  return date;
}

// Replaces %NAME% with the environment variable; Windows names are case-insensitive.
function expandWindowsPath(windowsPath, env = process.env) {
  return windowsPath.replace(/%([^%]+)%/g, (match, name) => {
    const key = Object.keys(env).find((k) => k.toLowerCase() === name.toLowerCase());
    if (key === undefined) throw new Error(`Environment variable ${name} is not set (in ${windowsPath}).`);
    return env[key];
  });
}

function resolveAppPaths(env = process.env, exists = fs.existsSync) {
  const paths = {};
  const missing = [];
  for (const [id, { windowsPath }] of Object.entries(APPS)) {
    paths[id] = expandWindowsPath(windowsPath, env);
    if (!exists(paths[id])) missing.push(id);
  }
  return { paths, missing };
}

const pad = (n) => String(n).padStart(2, '0');

function buildDemoStoreData({ date, titles, paths }) {
  const at = (time, seconds) => {
    const [hours, minutes] = time.split(':').map(Number);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, seconds).getTime();
  };
  const heartbeats = [];
  let lastWindow = null;
  for (const { start, end, app, title } of SCHEDULE) {
    if (app) lastWindow = { app: APPS[app].name, title: titles[title], path: paths[app] };
    const endMs = at(end, 0);
    for (let minute = at(start, 0); minute < endMs; minute += 60 * 1000) {
      for (const seconds of HEARTBEAT_SECONDS) {
        heartbeats.push({
          timestamp: minute + seconds * 1000,
          data: { userActivity: app ? 'active' : 'inactive', appWindow: { ...lastWindow } },
        });
      }
    }
  }
  const dayKey = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return {
    version: 1,
    startTime: heartbeats[0].timestamp,
    lastCleanup: heartbeats[0].timestamp,
    aggregationInterval: 15,
    days: { [dayKey]: { heartbeats } },
  };
}

module.exports = { APPS, SCHEDULE, demoDate, expandWindowsPath, resolveAppPaths, buildDemoStoreData };
