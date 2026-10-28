import { describe, expect, it } from 'vitest';
import { formatTemperature, toFahrenheit } from '../../src/lib/temperature';

describe('temperature conversion', () => {
  it('converts celsius to fahrenheit correctly', () => {
    expect(toFahrenheit(0)).toBe(32);
    expect(toFahrenheit(20)).toBe(68);
    expect(toFahrenheit(-10)).toBe(14);
  });

  it('formats temperatures according to the selected unit', () => {
    expect(formatTemperature(0, 'celsius')).toBe('0°C');
    expect(formatTemperature(0, 'fahrenheit')).toBe('32°F');
    expect(formatTemperature(null, 'celsius')).toBe('—');
  });
});
