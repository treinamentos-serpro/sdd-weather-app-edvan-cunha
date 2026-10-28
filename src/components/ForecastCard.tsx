import type { ForecastDay, Unit } from '../types/weather';
import { formatDayLabel } from '../lib/format';
import { getWeatherMeta } from '../lib/weatherCodes';
import { formatTemperature } from '../lib/temperature';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const weatherMeta = getWeatherMeta(day.weatherCode);

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-glass backdrop-blur-md">
      <p className="text-center text-sm text-slate-200">{formatDayLabel(day.date)}</p>
      <div aria-hidden="true" className="my-3 flex justify-center text-3xl">
        {weatherMeta.icon}
      </div>
      <p className="mb-3 text-center text-xs text-slate-300">{weatherMeta.label}</p>
      <div className="flex justify-between text-sm text-slate-200">
        <span>Máx</span>
        <span>{formatTemperature(day.temperatureMaxC, unit)}</span>
      </div>
      <div className="mt-1 flex justify-between text-sm text-slate-300">
        <span>Mín</span>
        <span>{formatTemperature(day.temperatureMinC, unit)}</span>
      </div>
      <div className="mt-3 border-t border-white/10 pt-3 text-center text-xs text-slate-200">
        <p>Chuva {day.precipitationProbability ?? '—'}%</p>
        <p className="mt-1">Volume {day.precipitationSumMm ?? '—'} mm</p>
      </div>
    </article>
  );
}
