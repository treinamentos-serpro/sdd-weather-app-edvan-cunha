import type { WeatherData } from '../types/weather';

export const MOCK_WEATHER: WeatherData = {
  city: {
    id: 1,
    name: 'São Paulo',
    state: 'São Paulo',
    stateCode: 'SP',
    country: 'Brasil',
    latitude: -23.55,
    longitude: -46.64,
    timezone: 'America/Sao_Paulo',
  },
  current: {
    time: '2026-10-28T12:00:00-03:00',
    temperatureC: 22,
    apparentTemperatureC: 24,
    relativeHumidity: 60,
    windSpeedKmh: 12,
    precipitationMm: 2.4,
    pressureHpa: 1017,
    temperatureMaxC: 25,
    temperatureMinC: 18,
    weatherCode: 1,
    isDay: true,
  },
  forecast: [
    { date: '2026-10-28', weatherCode: 1, temperatureMaxC: 25, temperatureMinC: 18, precipitationProbability: 18, precipitationSumMm: 2.4 },
    { date: '2026-10-29', weatherCode: 61, temperatureMaxC: 24, temperatureMinC: 17, precipitationProbability: 86, precipitationSumMm: 8.1 },
    { date: '2026-10-30', weatherCode: 80, temperatureMaxC: 23, temperatureMinC: 16, precipitationProbability: 62, precipitationSumMm: 6.2 },
    { date: '2026-10-31', weatherCode: 2, temperatureMaxC: 26, temperatureMinC: 19, precipitationProbability: 20, precipitationSumMm: 1.1 },
    { date: '2026-11-01', weatherCode: 0, temperatureMaxC: 27, temperatureMinC: 20, precipitationProbability: 5, precipitationSumMm: 0.1 },
  ],
  fetchedAt: '2026-10-28T12:00:00-03:00',
};
