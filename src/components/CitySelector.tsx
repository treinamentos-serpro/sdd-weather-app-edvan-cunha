import type { City } from '../types/weather';

interface CitySelectorProps {
  cities: City[];
  onSelectCity: (city: City) => void;
}

export default function CitySelector({ cities, onSelectCity }: CitySelectorProps) {
  return (
    <section
      aria-label="Resultados da busca"
      className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Selecione a cidade</h2>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">
          {cities.length} resultado{cities.length === 1 ? '' : 's'}
        </span>
      </div>

      <ul className="mt-4 space-y-2" aria-live="polite">
        {cities.map((city) => {
          const cityKey = `${city.id}-${city.name}-${city.state}-${city.country}`;

          return (
            <li key={cityKey}>
              <button
                type="button"
                onClick={() => onSelectCity(city)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-night-800/40 px-4 py-3 text-left transition hover:border-accent-400/60 hover:bg-accent-500/10 focus:outline-none focus:ring-2 focus:ring-accent-400/60"
              >
                <span>
                  <span className="block text-base font-medium text-white">{city.name}</span>
                  <span className="mt-1 block text-sm text-slate-300">
                    {city.state || 'Localidade'} · {city.country}
                  </span>
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200">
                  Selecionar
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
