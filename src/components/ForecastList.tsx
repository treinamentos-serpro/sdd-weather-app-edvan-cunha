import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section className="mt-6">
      <h3 className="mb-3 text-xl font-semibold text-white">Previsão de 5 dias</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day) => (
          <ForecastCard key={day.date} day={day} unit={unit} />
        ))}
      </div>
    </section>
  );
}
