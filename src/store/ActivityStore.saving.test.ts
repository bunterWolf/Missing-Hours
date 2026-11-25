import fs from 'fs';
import os from 'os';
import path from 'path';
import ActivityStore from './ActivityStore';

jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/tmp/jest-user-data'),
    getAppPath: jest.fn(() => '/mock/app/path'),
  },
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
    removeHandler: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  BrowserWindow: {
    getAllWindows: jest.fn(() => []),
  },
}), { virtual: true });

// The whole store is written on every save, so it is saved on a fixed schedule only:
// every 10 minutes while tracking, on pause, on a system sleep, on a day change and on quit.
describe('ActivityStore saving', () => {
  let dir: string;
  let store: ActivityStore;
  let save: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    // 3 minutes before the end of a 15-minute interval, so one interval ends within the next 10 minutes
    jest.setSystemTime(new Date('2026-11-25T10:12:00'));
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mh-saving-'));
    store = new ActivityStore({ useMockData: false, storagePath: path.join(dir, 'activity.json') });
    store.startTracking();
    save = jest.spyOn(store.persistence, 'saveData');
  });

  afterEach(() => {
    store.cleanup();
    jest.useRealTimers();
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('saves once every 10 minutes while tracking, also across an interval end', () => {
    jest.advanceTimersByTime(10 * 60 * 1000 - 1);
    expect(save).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(save).toHaveBeenCalledTimes(1);
  });

  test('the end of an aggregation interval does not save again', () => {
    (store as any).handleIntervalEnd();

    expect(save).not.toHaveBeenCalled();
  });

  test('pausing saves', () => {
    store.pauseTracking();

    expect(save).toHaveBeenCalledTimes(1);
  });

  // The PC may not wake up again (battery empty, hard reset), so a sleep saves like a pause,
  // also when input right before the sleep keeps it from counting as an absence.
  test('a system sleep saves', () => {
    store.markSuspend(Date.now(), 0);

    expect(save).toHaveBeenCalledTimes(1);
  });

  test('a system sleep while paused does not save again', () => {
    store.pauseTracking();
    store.markSuspend(Date.now(), Infinity);

    expect(save).toHaveBeenCalledTimes(1);
  });
});
