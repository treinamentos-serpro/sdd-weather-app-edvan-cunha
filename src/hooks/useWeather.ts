import { useCallback, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface UseWeatherState {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

interface LastAction {
  type: 'search' | 'select';
  city?: City;
  query?: string;
}

export function useWeather(): UseWeatherState {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [lastAction, setLastAction] = useState<LastAction | null>(null);

  const selectCity = useCallback(async (city: City) => {
    setStatus('loading');
    setError(null);
    setLastAction({ type: 'select', city });

    try {
      const weather = await getWeather(city);
      setData(weather);
      setStatus('success');
    } catch (caughtError) {
      const message =
        caughtError instanceof WeatherServiceError
          ? caughtError.message
          : 'Não foi possível concluir a consulta.';
      setError(message);
      setStatus('error');
    }
  }, []);

  const search = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      setQuery(trimmed);

      if (!trimmed) {
        setStatus('empty');
        setError('Digite uma cidade ou CEP.');
        setCities([]);
        setData(null);
        setLastAction(null);
        return;
      }

      setStatus('loading');
      setError(null);
      setData(null);
      setCities([]);
      setLastAction({ type: 'search', query: trimmed });

      try {
        const results = await searchCities(trimmed);
        setCities(results);

        if (!results.length) {
          setStatus('empty');
          setData(null);
          return;
        }

        const [firstCity] = results;
        await selectCity(firstCity);
      } catch (caughtError) {
        const message =
          caughtError instanceof WeatherServiceError
            ? caughtError.message
            : 'Não foi possível concluir a busca.';
        setError(message);
        setStatus('error');
      }
    },
    [selectCity],
  );

  const retry = useCallback(async () => {
    if (!lastAction) {
      setStatus('idle');
      return;
    }

    if (lastAction.type === 'search' && lastAction.query) {
      await search(lastAction.query);
      return;
    }

    if (lastAction.type === 'select' && lastAction.city) {
      await selectCity(lastAction.city);
    }
  }, [lastAction, search, selectCity]);

  return {
    status,
    data,
    cities,
    error,
    query,
    search,
    selectCity,
    retry,
  };
}
