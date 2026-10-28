import { describe, expect, it } from 'vitest';
import { normalizeCep } from '../../src/lib/format';

describe('normalizeCep', () => {
  it.each([
    '01001-000',
    '01001000',
    ' 01001-000 ',
  ])('normalizes valid CEP input %s to eight digits', (value) => {
    expect(normalizeCep(value)).toBe('01001000');
  });

  it.each([
    '',
    '   ',
    '1234567',
    '123456789',
    '0100A-000',
    '01001--000',
    '01001 000',
  ])('rejects invalid CEP input %s', (value) => {
    expect(normalizeCep(value)).toBeNull();
  });
});
