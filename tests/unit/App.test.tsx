import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';

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
    precipitation_probability_max: [18, 86, 62, 20, 5],
    precipitation_sum: [2.4, 8.1, 6.2, 1.1, 0.1],
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('App', () => {
  it('starts in the idle state without showing mock weather', () => {
    render(<App />);

    expect(screen.getByText('Pronto para consultar o clima')).toBeInTheDocument();
    expect(screen.queryByText('22°C')).not.toBeInTheDocument();
  });

  it('loads weather from the service and switches displayed units', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      return url.includes('geocoding-api')
        ? jsonResponse({ results: [{ ...city, country_code: 'BR' }] })
        : jsonResponse(forecast);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await user.click(await screen.findByRole('button', { name: /São Paulo/i }));

    expect(await screen.findByText('São Paulo')).toBeInTheDocument();
    expect(screen.getByText('22°C')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole('button', { name: 'Selecionar °F' }));

    expect(screen.getByText('72°F')).toBeInTheDocument();
  });

  it('resolves a CEP before showing matching localities for explicit selection', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('viacep.com.br')) {
        return jsonResponse({ localidade: 'São Paulo', uf: 'SP' });
      }

      if (url.includes('geocoding-api.open-meteo.com')) {
        return jsonResponse({
          results: [
            {
              ...city,
              admin1: 'São Paulo',
              country_code: 'BR',
            },
          ],
        });
      }

      return jsonResponse(forecast);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), '01001-000');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText('Selecione a cidade')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://viacep.com.br/ws/01001000/json/');
    expect(String(fetchMock.mock.calls[1][0])).not.toContain('01001000');

    await user.click(screen.getByRole('button', { name: /São Paulo/i }));

    expect(await screen.findByText('22°C')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('shows a city selector when multiple localities match the query', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('geocoding-api')) {
        return jsonResponse({
          results: [
            {
              ...city,
              id: 1,
              name: 'São Paulo',
              admin1: 'São Paulo',
              country_code: 'BR',
            },
            {
              ...city,
              id: 2,
              name: 'São Paulo',
              admin1: 'Rio Grande do Sul',
              country_code: 'BR',
            },
          ],
        });
      }

      return jsonResponse(forecast);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText('Selecione a cidade')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /São Paulo.*Rio Grande do Sul/i }));

    expect(await screen.findByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
  });
});
