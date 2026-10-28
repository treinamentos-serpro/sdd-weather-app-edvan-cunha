import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchWithTimeout,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as Response;
}

const city: City = {
  id: 1,
  name: 'São Paulo',
  state: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.64,
  timezone: 'America/Sao_Paulo',
};

const forecast = {
  current: {
    time: '2026-10-28T12:00',
    temperature_2m: 22,
    apparent_temperature: 24,
    relative_humidity_2m: 60,
    wind_speed_10m: 12,
    precipitation: 2.4,
    pressure_msl: 1017,
    weather_code: 1,
    is_day: 1,
  },
  daily: {
    time: ['2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01'],
    weather_code: [1, 61, 80, 2, 0],
    temperature_2m_max: [25, 24, 23, 26, 27],
    temperature_2m_min: [18, 17, 16, 19, 20],
    precipitation_probability_max: [18, null, 62, 20, 5],
    precipitation_sum: [2.4, null, 6.2, 1.1, 0.1],
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('weatherService', () => {
  it('does not make a request for an empty city search', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('encodes the query and maps valid geocoding results', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL) =>
      jsonResponse({
        results: [
          {
            id: 1,
            name: 'São Paulo',
            admin1: 'São Paulo',
            country: 'Brasil',
            latitude: -23.55,
            longitude: -46.64,
            timezone: 'America/Sao_Paulo',
          },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('São Paulo & Região')).resolves.toEqual([city]);
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      'name=S%C3%A3o%20Paulo%20%26%20Regi%C3%A3o',
    );
  });

  it('returns an empty list when geocoding has no results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({})),
    );

    await expect(searchCities('Cidade inexistente')).resolves.toEqual([]);
  });

  it('throws a typed error for unsuccessful HTTP responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({}, false)),
    );

    await expect(searchCities('São Paulo')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('maps current weather and exactly five daily forecast entries', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL) => jsonResponse(forecast));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);
    const url = new URL(String(fetchMock.mock.calls[0][0]));

    expect(result.city).toEqual(city);
    expect(result.current.temperatureC).toBe(22);
    expect(result.current.temperatureMaxC).toBe(25);
    expect(result.current.temperatureMinC).toBe(18);
    expect(result.current.isDay).toBe(true);
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[1].precipitationProbability).toBeNull();
    expect(result.forecast[1].precipitationSumMm).toBeNull();
    expect(url.searchParams.get('latitude')).toBe(String(city.latitude));
    expect(url.searchParams.get('longitude')).toBe(String(city.longitude));
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.searchParams.get('forecast_days')).toBe('5');
  });

  it('rejects incomplete forecast responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ current: {} })),
    );

    await expect(getWeather(city)).rejects.toThrow('Resposta incompleta');
  });

  it('converts abort and network failures to typed, user-facing errors', async () => {
    const aborted = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(aborted)),
    );

    await expect(fetchWithTimeout('/weather')).rejects.toThrow('A requisição demorou demais.');

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('offline'))),
    );

    await expect(fetchWithTimeout('/weather')).rejects.toThrow('Falha de rede.');
  });
});
