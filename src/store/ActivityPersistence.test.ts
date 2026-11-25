import fs from 'fs';
import os from 'os';
import path from 'path';
import { ActivityPersistence } from './ActivityPersistence';
import { StoreData } from './ActivityStore';

const storeData = (): StoreData => ({
  version: 1,
  startTime: 1700000000000,
  lastCleanup: 1700000000000,
  aggregationInterval: 15,
  days: {
    '2026-11-25': {
      heartbeats: [
        { timestamp: 1795203285957, data: { userActivity: 'active', appWindow: { app: 'Code', title: 'main.ts', path: 'C:\\Code.exe' } } },
        { timestamp: 1795203315957, data: { userActivity: 'may_be_inactive', appWindow: null } },
      ],
    },
  },
});

describe('ActivityPersistence', () => {
  let dir: string;
  let file: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mh-persistence-'));
    file = path.join(dir, 'chronflow-activity-store.json');
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('saves compact JSON without indentation', () => {
    new ActivityPersistence(file).saveData(storeData());

    expect(fs.readFileSync(file, 'utf8')).toBe(JSON.stringify(storeData()));
  });

  test('loads what it saved', () => {
    const persistence = new ActivityPersistence(file);
    persistence.saveData(storeData());

    expect(persistence.loadData()).toEqual(storeData());
  });

  test('loads indented files of older versions', () => {
    fs.writeFileSync(file, JSON.stringify(storeData(), null, 2), 'utf8');

    expect(new ActivityPersistence(file).loadData()).toEqual(storeData());
  });
});
