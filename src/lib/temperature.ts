import type { Unit } from '../types/weather';

export function toFahrenheit(valueC: number | null): number | null {
  if (valueC === null || Number.isNaN(valueC)) {
    return null;
  }

  return (valueC * 9) / 5 + 32;
}

export function formatTemperature(valueC: number | null, unit: Unit): string {
  if (valueC === null || Number.isNaN(valueC)) {
    return '—';
  }

  const converted = unit === 'fahrenheit' ? toFahrenheit(valueC) : valueC;

  if (converted === null || Number.isNaN(converted)) {
    return '—';
  }

  return `${Math.round(converted)}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
}
