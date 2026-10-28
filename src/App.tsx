import { useState } from 'react';
import CitySelector from './components/CitySelector';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export type AppStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, cities, error, search, retry, selectCity } = useWeather();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(109,124,255,0.18),_transparent_30%),_linear-gradient(180deg,_#0b1020_0%,_#111827_100%)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-accent-400">WeatherApp</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Clima do dia</h1>
            </div>

            <div className="w-full max-w-xl">
              <SearchBar onSearch={search} disabled={status === 'loading'} />
            </div>

            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </header>

        <main className="mt-6">
          {status === 'idle' ? (
            <EmptyState
              title="Pronto para consultar o clima"
              description="Busque sua cidade ou CEP para continuar."
            />
          ) : null}
          {status === 'loading' ? <LoadingState /> : null}
          {status === 'empty' ? (
            <EmptyState
              title="Nenhuma cidade encontrada"
              description="Tente outra busca por nome da cidade ou CEP."
            />
          ) : null}
          {status === 'error' ? <ErrorState message={error ?? undefined} onRetry={retry} /> : null}
          {status === 'success' && !data && cities.length > 0 ? (
            <CitySelector cities={cities} onSelectCity={selectCity} />
          ) : null}
          {status === 'success' && data ? (
            <>
              <CurrentWeather city={data.city} current={data.current} unit={unit} />
              <ForecastList forecast={data.forecast} unit={unit} />
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
