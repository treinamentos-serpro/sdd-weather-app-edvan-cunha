import { brazilianStates } from '../lib/brazilianStates';
import type { City } from '../types/weather';
import type { ViaCepLocation } from './viacepService';

const GEOCODING_TIMEOUT_MS = 10_000;

type JsonRecord = Record<string, unknown>;

export class GeocodingServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeocodingServiceError';
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeLocationName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
    .replace(/\s+/g, ' ');
}

function mapCity(value: unknown): City {
  if (!isRecord(value)) {
    throw new GeocodingServiceError('O geocoding retornou uma localidade inválida.');
  }

  const id = value.id;
  const name = nonEmptyString(value.name);
  const state = nonEmptyString(value.admin1);
  const country = nonEmptyString(value.country);
  const latitude = finiteNumber(value.latitude);
  const longitude = finiteNumber(value.longitude);
  const timezone = nonEmptyString(value.timezone);

  if (
    (typeof id !== 'number' && typeof id !== 'string') ||
    !name ||
    !state ||
    !country ||
    latitude === null ||
    longitude === null ||
    !timezone ||
    value.country_code !== 'BR'
  ) {
    throw new GeocodingServiceError('O geocoding retornou uma localidade inválida.');
  }

  return {
    id,
    name,
    state,
    stateCode: typeof value.admin1_code === 'string' ? value.admin1_code : undefined,
    country,
    latitude,
    longitude,
    timezone,
  };
}

async function fetchGeocodingResults(name: string): Promise<unknown[]> {
  const params = new URLSearchParams({
    name,
    count: '10',
    language: 'pt',
    format: 'json',
    countryCode: 'BR',
  });
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = globalThis.setTimeout(() => {
      controller.abort();
      reject(new GeocodingServiceError('A busca de localidades excedeu o tempo limite.'));
    }, GEOCODING_TIMEOUT_MS);
  });

  const request = async (): Promise<unknown[]> => {
    let response: Response;

    try {
      response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`,
        { signal: controller.signal },
      );
    } catch {
      throw new GeocodingServiceError('Não foi possível conectar ao serviço de localidades.');
    }

    if (!response.ok) {
      throw new GeocodingServiceError('Não foi possível buscar localidades.');
    }

    let payload: unknown;

    try {
      payload = await response.json();
    } catch {
      throw new GeocodingServiceError('O serviço de localidades retornou uma resposta inválida.');
    }

    if (!isRecord(payload)) {
      throw new GeocodingServiceError('O serviço de localidades retornou uma resposta inválida.');
    }

    if (Array.isArray(payload.results)) {
      return payload.results;
    }

    if (payload.results === undefined && finiteNumber(payload.generationtime_ms) !== null) {
      return [];
    }

    throw new GeocodingServiceError('O serviço de localidades retornou uma resposta inválida.');
  };

  try {
    return await Promise.race([request(), timeoutPromise]);
  } catch (error) {
    if (error instanceof GeocodingServiceError) {
      throw error;
    }

    throw new GeocodingServiceError('Não foi possível concluir a busca de localidades.');
  } finally {
    if (timeoutId !== undefined) {
      globalThis.clearTimeout(timeoutId);
    }
  }
}

export async function searchCitiesByName(name: string): Promise<City[]> {
  const query = name.trim().replace(/\s+/g, ' ');

  if (!query) {
    return [];
  }

  const normalizedName = normalizeLocationName(query);
  const results = await fetchGeocodingResults(query);
  return results.map(mapCity).filter((city) => normalizeLocationName(city.name) === normalizedName);
}

export async function searchCitiesByCep(location: ViaCepLocation): Promise<City[]> {
  const city = location.city.trim().replace(/\s+/g, ' ');
  const stateCode = location.stateCode.trim().toUpperCase();
  const expectedState = brazilianStates[stateCode];

  if (!city || !expectedState) {
    throw new GeocodingServiceError('A cidade ou UF resolvida pelo ViaCEP é inválida.');
  }

  const results = await fetchGeocodingResults(city);
  return results
    .map(mapCity)
    .filter(
      (result) => normalizeLocationName(result.state) === normalizeLocationName(expectedState),
    );
}
