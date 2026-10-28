import { describe, expect, it } from 'vitest';
import { formatDayLabel, getShortDate } from '../../src/lib/format';

describe('format helpers', () => {
  it('labels the first two forecast days as today and tomorrow', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    expect(formatDayLabel(today.toISOString().slice(0, 10))).toBe('Hoje');
    expect(formatDayLabel(tomorrow.toISOString().slice(0, 10))).toBe('Amanhã');
  });

  it('formats later dates by weekday and short date', () => {
    const future = new Date('2026-10-30T12:00:00');
    const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(future);

    expect(formatDayLabel('2026-10-30')).toBe(weekday);
    expect(getShortDate('2026-10-30')).toBe('30/10');
  });
});
