import { useCallback, useRef, useState } from 'react';
import { normalizeCep } from '../lib/format';
import {
  GeocodingServiceError,
  searchCitiesByCep,
  searchCitiesByName,
} from '../services/geocodingService';
import { resolveCep, ViaCepServiceError } from '../services/viacepService';
import { getWeather, WeatherServiceError } from '../services/weatherService';
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

function normalizeQuery(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function isCepQuery(value: string): boolean {
  return /\d/.test(value);
}

export function useWeather(): UseWeatherState {
  const requestId = useRef(0);
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [lastAction, setLastAction] = useState<LastAction | null>(null);

  const selectCity = useCallback(async (city: City) => {
    const activeRequestId = ++requestId.current;
    setStatus('loading');
    setError(null);
    setLastAction({ type: 'select', city });

    try {
      const weather = await getWeather(city);
      if (activeRequestId !== requestId.current) {
        return;
      }

      setData(weather);
      setStatus('success');
    } catch (caughtError) {
      if (activeRequestId !== requestId.current) {
        return;
      }

      const message =
        caughtError instanceof WeatherServiceError
          ? caughtError.message
          : 'Não foi possível concluir a consulta.';
      setError(message);
      setStatus('error');
    }
  }, []);

  const search = useCallback(async (name: string) => {
    const trimmed = normalizeQuery(name);
    const activeRequestId = ++requestId.current;
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
      let results: City[];

      if (isCepQuery(trimmed)) {
        if (!normalizeCep(trimmed)) {
          setError('Informe um CEP válido.');
          setStatus('error');
          return;
        }

        const location = await resolveCep(trimmed);
        if (activeRequestId !== requestId.current) {
          return;
        }

        results = await searchCitiesByCep(location);
      } else {
        results = await searchCitiesByName(trimmed);
      }

      if (activeRequestId !== requestId.current) {
        return;
      }

      setCities(results);

      if (!results.length) {
        setStatus('empty');
        setData(null);
        return;
      }

      setStatus('success');
      setData(null);
    } catch (caughtError) {
      if (activeRequestId !== requestId.current) {
        return;
      }

      if (caughtError instanceof ViaCepServiceError && caughtError.code === 'not-found') {
        setStatus('empty');
        setError(null);
        setCities([]);
        setData(null);
        return;
      }

      const message =
        caughtError instanceof ViaCepServiceError || caughtError instanceof GeocodingServiceError
          ? caughtError.message
          : caughtError instanceof WeatherServiceError
            ? caughtError.message
            : 'Não foi possível concluir a busca.';
      setError(message);
      setStatus('error');
    }
  }, []);

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
