import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

type JsonObject = Record<string, unknown>;

function isRecord(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 10000,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (isRecord(error) && error.name === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais.');
    }

    if (error instanceof TypeError) {
      throw new WeatherServiceError('Falha de rede.');
    }

    throw error;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

async function readJson(response: Response, errorMessage: string): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new WeatherServiceError(errorMessage);
  }
}

function mapCity(result: unknown): City | null {
  if (!isRecord(result)) {
    return null;
  }

  const id = result.id;
  const name = stringOrNull(result.name);
  const state = stringOrNull(result.admin1) ?? '';
  const country = stringOrNull(result.country);
  const latitude = numberOrNull(result.latitude);
  const longitude = numberOrNull(result.longitude);
  const timezone = stringOrNull(result.timezone);

  if (
    (typeof id !== 'number' && typeof id !== 'string') ||
    !name ||
    !country ||
    latitude === null ||
    longitude === null ||
    !timezone
  ) {
    return null;
  }

  return {
    id,
    name,
    state,
    country,
    latitude,
    longitude,
    timezone,
  };
}

export async function searchCities(name: string): Promise<City[]> {
  const trimmed = name.trim();

  if (!trimmed) {
    return [];
  }

  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}` +
    '&count=10&language=pt&format=json&countryCode=BR';
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível buscar cidades.');
  }

  const payload = await readJson(response, 'Resposta inválida ao buscar cidades.');

  if (!isRecord(payload) || !Array.isArray(payload.results)) {
    return [];
  }

  return payload.results.map(mapCity).filter((city): city is City => city !== null);
}

function mapCurrentWeather(current: JsonObject): CurrentWeather {
  const time = stringOrNull(current.time);

  if (!time) {
    throw new WeatherServiceError('Resposta incompleta do serviço de clima.');
  }

  return {
    time,
    temperatureC: numberOrNull(current.temperature_2m),
    apparentTemperatureC: numberOrNull(current.apparent_temperature),
    relativeHumidity: numberOrNull(current.relative_humidity_2m),
    windSpeedKmh: numberOrNull(current.wind_speed_10m),
    precipitationMm: numberOrNull(current.precipitation),
    pressureHpa: numberOrNull(current.pressure_msl),
    temperatureMaxC: null,
    temperatureMinC: null,
    weatherCode: numberOrNull(current.weather_code),
    isDay: current.is_day === 1 ? true : current.is_day === 0 ? false : null,
  };
}

function mapForecast(daily: JsonObject): ForecastDay[] {
  if (!Array.isArray(daily.time) || daily.time.length < 5) {
    throw new WeatherServiceError('Resposta incompleta do serviço de clima.');
  }

  const dates = daily.time.slice(0, 5);

  if (!dates.every((date): date is string => typeof date === 'string' && date.length > 0)) {
    throw new WeatherServiceError('Resposta incompleta do serviço de clima.');
  }

  const weatherCodes = Array.isArray(daily.weather_code) ? daily.weather_code : [];
  const maxTemps = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : [];
  const minTemps = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min : [];
  const probabilities = Array.isArray(daily.precipitation_probability_max)
    ? daily.precipitation_probability_max
    : [];
  const sums = Array.isArray(daily.precipitation_sum) ? daily.precipitation_sum : [];

  return dates.map((date, index) => ({
    date,
    weatherCode: numberOrNull(weatherCodes[index]),
    temperatureMaxC: numberOrNull(maxTemps[index]),
    temperatureMinC: numberOrNull(minTemps[index]),
    precipitationProbability: numberOrNull(probabilities[index]),
    precipitationSumMm: numberOrNull(sums[index]),
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,pressure_msl,weather_code,is_day',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum',
    timezone: 'auto',
    forecast_days: '5',
  });
  const response = await fetchWithTimeout(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
  );

  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível carregar o clima.');
  }

  const payload = await readJson(response, 'Resposta inválida do serviço de clima.');

  if (!isRecord(payload) || !isRecord(payload.current) || !isRecord(payload.daily)) {
    throw new WeatherServiceError('Resposta incompleta do serviço de clima.');
  }

  const current = mapCurrentWeather(payload.current);
  const forecast = mapForecast(payload.daily);
  current.temperatureMaxC = forecast[0].temperatureMaxC;
  current.temperatureMinC = forecast[0].temperatureMinC;

  return {
    city,
    current,
    forecast,
    fetchedAt: new Date().toISOString(),
  };
}
