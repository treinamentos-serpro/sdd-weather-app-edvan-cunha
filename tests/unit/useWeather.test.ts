import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as Response;
}

const city = {
  id: 1,
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.64,
  timezone: 'America/Sao_Paulo',
};

const forecast = {
  current: { time: '2026-10-28T12:00', temperature_2m: 22 },
  daily: {
    time: ['2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01'],
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useWeather', () => {
  it('loads the first matching city and retries the failed weather request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ results: [city] }))
      .mockResolvedValueOnce(jsonResponse({}, false))
      .mockResolvedValueOnce(jsonResponse(forecast));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('São Paulo');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.cities).toHaveLength(1);
    expect(result.current.query).toBe('São Paulo');

    await act(async () => {
      await result.current.retry();
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data?.city.name).toBe('São Paulo');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('sets the empty state when no cities match', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({})),
    );
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Cidade inexistente');
    });

    expect(result.current.status).toBe('empty');
    expect(result.current.cities).toEqual([]);
    expect(result.current.data).toBeNull();
  });
});
