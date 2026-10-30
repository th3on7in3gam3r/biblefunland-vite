import { describe, it, expect } from 'vitest';
import { localDateStr, localDateDaysAgo, weekdayOf } from '../lib/dates';

describe('check-in dates use the local calendar day', () => {
  it('a Saturday 9 pm check-in in New York stays on Saturday', () => {
    // Saturday Oct 31 2026, 9:30 pm local (already Sunday in UTC).
    const satNight = new Date(2026, 9, 31, 21, 30);
    expect(localDateStr(satNight)).toBe('2026-10-31');
    expect(weekdayOf(localDateStr(satNight))).toBe(6);
  });

  it('yesterday is the previous local day, across month ends', () => {
    expect(localDateDaysAgo(1, new Date(2026, 10, 1, 8))).toBe('2026-10-31');
  });

  it('weekdayOf reads the date as local, not UTC', () => {
    expect(weekdayOf('2026-11-01')).toBe(0); // Sunday
  });
});
