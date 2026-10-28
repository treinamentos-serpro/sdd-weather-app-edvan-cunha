export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number | string;
  name: string;
  state: string;
  stateCode?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface CurrentWeather {
  time: string;
  temperatureC: number | null;
  apparentTemperatureC: number | null;
  relativeHumidity: number | null;
  windSpeedKmh: number | null;
  precipitationMm: number | null;
  pressureHpa: number | null;
  temperatureMaxC: number | null;
  temperatureMinC: number | null;
  weatherCode: number | null;
  isDay: boolean | null;
}

export interface ForecastDay {
  date: string;
  weatherCode: number | null;
  temperatureMaxC: number | null;
  temperatureMinC: number | null;
  precipitationProbability: number | null;
  precipitationSumMm: number | null;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
  fetchedAt: string;
}
