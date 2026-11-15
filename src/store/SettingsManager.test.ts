import fs from 'fs';
import os from 'os';
import path from 'path';

const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'missing-hours-settings-'));

jest.mock('electron', () => ({
  app: { getPath: jest.fn(() => userDataDir) },
}), { virtual: true });

import { SettingsManager } from './SettingsManager';

const settingsFile = path.join(userDataDir, 'settings.json');
const writeSettings = (data: object) => fs.writeFileSync(settingsFile, JSON.stringify(data), 'utf8');

afterAll(() => {
  fs.rmSync(userDataDir, { recursive: true, force: true });
});

describe('SettingsManager themeMode', () => {
  afterEach(() => {
    try { fs.unlinkSync(settingsFile); } catch (e) { /* not created */ }
  });

  test('defaults to system without a settings file', () => {
    expect(new SettingsManager().getThemeMode()).toBe('system');
  });

  test('loads a saved light or dark mode', () => {
    writeSettings({ themeMode: 'dark' });
    expect(new SettingsManager().getThemeMode()).toBe('dark');
    writeSettings({ themeMode: 'light' });
    expect(new SettingsManager().getThemeMode()).toBe('light');
  });

  test('ignores an unknown saved value', () => {
    writeSettings({ themeMode: 'blue' });
    expect(new SettingsManager().getThemeMode()).toBe('system');
  });

  test('persists a changed mode without touching other settings', () => {
    writeSettings({ allowPrerelease: true, autoLaunchEnabled: true, activityStoreDirPath: null });
    new SettingsManager().setThemeMode('dark');
    const saved = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    expect(saved).toEqual({ activityStoreDirPath: null, allowPrerelease: true, autoLaunchEnabled: true, themeMode: 'dark' });
    expect(new SettingsManager().getThemeMode()).toBe('dark');
  });
});

// The folder can no longer be chosen, but a folder chosen in an older version must stay in use,
// otherwise the data tracked there would vanish from the timeline.
describe('SettingsManager activity store location', () => {
  const customDir = path.join(userDataDir, 'custom');
  const fileName = 'chronflow-activity-store.json';

  afterEach(() => {
    try { fs.unlinkSync(settingsFile); } catch (e) { /* not created */ }
  });

  test('uses the userData folder without a saved folder', () => {
    expect(new SettingsManager().getActivityStoreFilePath()).toBe(path.join(userDataDir, fileName));
    writeSettings({ activityStoreDirPath: null });
    expect(new SettingsManager().getActivityStoreFilePath()).toBe(path.join(userDataDir, fileName));
  });

  test('keeps using a folder saved by an older version', () => {
    writeSettings({ activityStoreDirPath: customDir });
    expect(new SettingsManager().getActivityStoreFilePath()).toBe(path.join(customDir, fileName));
  });

  test('keeps the saved folder when another setting is saved', () => {
    writeSettings({ activityStoreDirPath: customDir });
    new SettingsManager().setThemeMode('light');
    expect(JSON.parse(fs.readFileSync(settingsFile, 'utf8')).activityStoreDirPath).toBe(customDir);
    expect(new SettingsManager().getActivityStoreFilePath()).toBe(path.join(customDir, fileName));
  });
});
