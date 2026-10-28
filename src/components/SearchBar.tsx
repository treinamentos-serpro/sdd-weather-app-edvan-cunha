import { useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedValue = value.replace(/\s+/g, ' ').trim();

    if (!trimmedValue) {
      return;
    }

    onSearch(trimmedValue);
    setValue(trimmedValue);
  };

  return (
    <form role="search" aria-busy={disabled} onSubmit={handleSubmit} className="w-full">
      <label htmlFor="city-search" className="sr-only">
        Buscar cidade ou CEP
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md shadow-glass transition focus-within:border-accent-400/70 focus-within:ring-2 focus-within:ring-accent-400/30">
        <span aria-hidden="true" className="text-lg text-sun">
          🔎
        </span>
        <input
          id="city-search"
          type="search"
          value={value}
          disabled={disabled}
          placeholder="Buscar cidade ou CEP"
          aria-label="Buscar cidade"
          aria-busy={disabled}
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          onChange={(event) => setValue(event.target.value)}
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded-full bg-accent-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-accent-400/60"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
