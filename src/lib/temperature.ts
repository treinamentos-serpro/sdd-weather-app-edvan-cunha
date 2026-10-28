import type { Unit } from '../types/weather';

export function convertTemperature(value: number | null, unit: Unit): number | null {
  if (value === null || Number.isNaN(value)) {
    return null;
  }

  if (unit === 'celsius') {
    return value;
  }

  return (value * 9) / 5 + 32;
}

export function toFahrenheit(valueC: number | null): number | null {
  return convertTemperature(valueC, 'fahrenheit');
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function formatTemperature(valueC: number | null, unit: Unit): string {
  const converted = convertTemperature(valueC, unit);

  if (converted === null || Number.isNaN(converted)) {
    return '—';
  }

  return `${Math.round(converted)}${unitLabel(unit)}`;
}
