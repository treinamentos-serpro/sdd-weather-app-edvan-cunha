import { describe, expect, it } from 'vitest';
import { getWeatherMeta } from '../../src/lib/weatherCodes';

describe('weatherCodes', () => {
  it('returns the expected label and icon for a known code', () => {
    expect(getWeatherMeta(0)).toEqual({ label: 'Céu limpo', icon: '☀️' });
    expect(getWeatherMeta(61)).toEqual({ label: 'Chuva', icon: '🌧️' });
  });

  it('falls back to an unavailable label for unknown weather codes', () => {
    expect(getWeatherMeta(999)).toEqual({ label: 'Condição indisponível', icon: '—' });
    expect(getWeatherMeta(null)).toEqual({ label: 'Condição indisponível', icon: '—' });
  });
});
