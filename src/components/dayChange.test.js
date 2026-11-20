import { applyDayChange } from './dayChange';

describe('applyDayChange', () => {
  const before = {
    today: '2026-11-19',
    selectedDate: '2026-11-19',
    availableDates: ['2026-11-17', '2026-11-19'],
  };

  it('returns the same state while the day has not changed', () => {
    expect(applyDayChange(before, '2026-11-19')).toBe(before);
  });

  it('moves a user who was looking at today on to the new today (e.g. after waking up the next morning)', () => {
    expect(applyDayChange(before, '2026-11-20')).toEqual({
      today: '2026-11-20',
      selectedDate: '2026-11-20',
      availableDates: ['2026-11-17', '2026-11-19', '2026-11-20'],
    });
  });

  it('keeps a past day the user chose, but makes the new today reachable', () => {
    const onPastDay = { ...before, selectedDate: '2026-11-17' };
    expect(applyDayChange(onPastDay, '2026-11-20')).toEqual({
      today: '2026-11-20',
      selectedDate: '2026-11-17',
      availableDates: ['2026-11-17', '2026-11-19', '2026-11-20'],
    });
  });

  it('skips over days without data (several days asleep)', () => {
    expect(applyDayChange(before, '2026-11-23')).toEqual({
      today: '2026-11-23',
      selectedDate: '2026-11-23',
      availableDates: ['2026-11-17', '2026-11-19', '2026-11-23'],
    });
  });

  it('does not list the new today twice when it is already known', () => {
    const known = { ...before, availableDates: ['2026-11-19', '2026-11-20'] };
    expect(applyDayChange(known, '2026-11-20').availableDates).toEqual(['2026-11-19', '2026-11-20']);
  });

  it('keeps the dates sorted when the clock goes back a day (time zone change)', () => {
    expect(applyDayChange(before, '2026-11-18')).toEqual({
      today: '2026-11-18',
      selectedDate: '2026-11-18',
      availableDates: ['2026-11-17', '2026-11-18', '2026-11-19'],
    });
  });

  it('does not change the passed state', () => {
    const state = { ...before, availableDates: [...before.availableDates] };
    applyDayChange(state, '2026-11-20');
    expect(state).toEqual(before);
  });
});
