import type { City, CurrentWeather as CurrentWeatherType, Unit } from '../types/weather';
import { formatTemperature } from '../lib/temperature';
import { getWeatherMeta } from '../lib/weatherCodes';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherType;
  unit: Unit;
}

function formatObservationTime(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'Hora indisponível';
  }

  return parsed.toLocaleString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const weatherMeta = getWeatherMeta(current.weatherCode);
  const temperatureText = formatTemperature(current.temperatureC, unit);
  const feelsLikeText = formatTemperature(current.apparentTemperatureC, unit);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Clima agora</p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{city.name}</h2>
          <p className="text-sm text-slate-300">
            {city.state || 'Localidade'} · {city.country}
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-night-800/60 px-3 py-1 text-xs text-slate-200">
          Atualizado em {formatObservationTime(current.time)}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 text-5xl shadow-inner shadow-white/10">
            {weatherMeta.icon}
          </div>
          <div>
            <div className="text-6xl font-semibold tracking-tight text-white">{temperatureText}</div>
            <p className="mt-2 text-lg text-slate-200">{weatherMeta.label}</p>
            <p className="text-sm text-slate-300">Sensação térmica: {feelsLikeText}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-night-800/50 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Umidade</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {current.relativeHumidity ?? '—'}%
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-night-800/50 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Vento</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {current.windSpeedKmh ?? '—'} km/h
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-night-800/50 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Chuva</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {current.precipitationMm ?? '—'} mm
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-night-800/50 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pressão</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {current.pressureHpa ?? '—'} hPa
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-200">
        {current.temperatureMaxC !== null ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            Máxima: {formatTemperature(current.temperatureMaxC, unit)}
          </span>
        ) : null}
        {current.temperatureMinC !== null ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            Mínima: {formatTemperature(current.temperatureMinC, unit)}
          </span>
        ) : null}
      </div>
    </section>
  );
}
