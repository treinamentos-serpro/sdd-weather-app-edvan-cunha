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
  it('requires explicit city selection and retries the failed weather request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ results: [{ ...city, country_code: 'BR' }] }))
      .mockResolvedValueOnce(jsonResponse({}, false))
      .mockResolvedValueOnce(jsonResponse(forecast));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('São Paulo');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.cities).toHaveLength(1);
    expect(result.current.data).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.selectCity(result.current.cities[0]);
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

  it.each([
    '1234567',
    '0100A-000',
    '01001 000',
  ])('rejects invalid CEP input %s without making a network request', async (query) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search(query);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Informe um CEP válido.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('resolves CEP through ViaCEP, filters by state, and waits for explicit selection', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ localidade: 'São Paulo', uf: 'SP' }))
      .mockResolvedValueOnce(
        jsonResponse({
          results: [
            {
              id: 1,
              name: 'São Paulo',
              admin1: 'São Paulo',
              country: 'Brasil',
              country_code: 'BR',
              latitude: -23.55,
              longitude: -46.64,
              timezone: 'America/Sao_Paulo',
            },
            {
              id: 2,
              name: 'São Paulo',
              admin1: 'Paraná',
              country: 'Brasil',
              country_code: 'BR',
              latitude: -25.42,
              longitude: -49.27,
              timezone: 'America/Sao_Paulo',
            },
          ],
        }),
      )
      .mockResolvedValueOnce(jsonResponse(forecast));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('01001-000');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.cities).toHaveLength(1);
    expect(result.current.cities[0].state).toBe('São Paulo');
    expect(result.current.data).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://viacep.com.br/ws/01001000/json/');
    expect(String(fetchMock.mock.calls[1][0])).toContain('name=S%C3%A3o+Paulo');
    expect(String(fetchMock.mock.calls[1][0])).not.toContain('01001000');

    await act(async () => {
      await result.current.selectCity(result.current.cities[0]);
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data?.city.state).toBe('São Paulo');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('shows an empty state for a CEP that ViaCEP does not resolve without geocoding', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ erro: true }));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('01001-000');
    });

    expect(result.current.status).toBe('empty');
    expect(result.current.cities).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('sets the empty state when no cities match', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ results: [] })),
    );
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Cidade inexistente');
    });

    expect(result.current.status).toBe('empty');
    expect(result.current.cities).toEqual([]);
    expect(result.current.data).toBeNull();
  });

  it('keeps exact normalized city matches and removes approximate geocoding results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          results: [
            {
              id: 1,
              name: 'Salvador',
              admin1: 'Bahia',
              country: 'Brasil',
              country_code: 'BR',
              latitude: -12.97,
              longitude: -38.5,
              timezone: 'America/Bahia',
            },
            {
              id: 2,
              name: 'Salvador do Maranhão',
              admin1: 'Maranhão',
              country: 'Brasil',
              country_code: 'BR',
              latitude: -4.1,
              longitude: -44.0,
              timezone: 'America/Fortaleza',
            },
            {
              id: 3,
              name: 'São Salvador',
              admin1: 'Maranhão',
              country: 'Brasil',
              country_code: 'BR',
              latitude: -4.2,
              longitude: -44.1,
              timezone: 'America/Fortaleza',
            },
          ],
        }),
      ),
    );
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('  SALVADOR  ');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.cities).toHaveLength(1);
    expect(result.current.cities[0].name).toBe('Salvador');
    expect(result.current.cities[0].state).toBe('Bahia');
  });

  it('preserves exact homonyms when query normalization ignores accents and spacing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          results: [
            {
              id: 1,
              name: 'São Paulo',
              admin1: 'São Paulo',
              country: 'Brasil',
              country_code: 'BR',
              latitude: -23.55,
              longitude: -46.64,
              timezone: 'America/Sao_Paulo',
            },
            {
              id: 2,
              name: 'Sao Paulo',
              admin1: 'Rio Grande do Sul',
              country: 'Brasil',
              country_code: 'BR',
              latitude: -29.0,
              longitude: -53.0,
              timezone: 'America/Sao_Paulo',
            },
            {
              id: 3,
              name: 'São Paulo do Potengi',
              admin1: 'Rio Grande do Norte',
              country: 'Brasil',
              country_code: 'BR',
              latitude: -5.9,
              longitude: -35.8,
              timezone: 'America/Fortaleza',
            },
          ],
        }),
      ),
    );
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('  SAO   PAULO ');
    });

    expect(result.current.cities).toHaveLength(2);
    expect(result.current.cities.map((match) => match.name)).toEqual(['São Paulo', 'Sao Paulo']);
  });
});
