import { describe, expect, it } from 'vitest';
import { STALE_AFTER_MS, isDataStale } from '../../src/lib/staleness';

describe('isDataStale', () => {
  const fetchedAt = '2026-10-28T12:00:00.000Z';
  const fetchedTime = new Date(fetchedAt).getTime();

  it('keeps data fresh up to the 40 minute threshold', () => {
    expect(isDataStale(fetchedAt, fetchedTime)).toBe(false);
    expect(isDataStale(fetchedAt, fetchedTime + STALE_AFTER_MS)).toBe(false);
  });

  it('flags data older than 40 minutes as stale', () => {
    expect(isDataStale(fetchedAt, fetchedTime + STALE_AFTER_MS + 1)).toBe(true);
  });

  it('treats invalid timestamps as stale', () => {
    expect(isDataStale('data inválida', fetchedTime)).toBe(true);
  });
});
