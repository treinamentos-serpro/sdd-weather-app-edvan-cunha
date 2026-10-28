import type { KeyboardEvent } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const options: Unit[] = ['celsius', 'fahrenheit'];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: Unit) => {
    const currentIndex = options.indexOf(current);

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % options.length;
      const nextUnit = options[nextIndex];
      onChange(nextUnit);
      const nextButton = document.getElementById(`unit-toggle-${nextUnit}`);
      nextButton?.focus();
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const previousIndex = (currentIndex - 1 + options.length) % options.length;
      const previousUnit = options[previousIndex];
      onChange(previousUnit);
      const previousButton = document.getElementById(`unit-toggle-${previousUnit}`);
      previousButton?.focus();
    }
  };

  return (
    <div role="group" aria-label="Unidade de temperatura" className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md shadow-glass">
      {options.map((option) => {
        const isActive = unit === option;
        const label = option === 'celsius' ? '°C' : '°F';

        return (
          <button
            key={option}
            id={`unit-toggle-${option}`}
            type="button"
            aria-pressed={isActive}
            aria-label={`Selecionar ${label}`}
            onClick={() => onChange(option)}
            onKeyDown={(event) => handleKeyDown(event, option)}
            className={`min-w-12 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              isActive ? 'bg-accent-500 text-white shadow-md shadow-accent-500/30' : 'text-slate-300 hover:text-white'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
