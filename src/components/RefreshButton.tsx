interface RefreshButtonProps {
  onRefresh: () => void;
  disabled?: boolean;
}

export default function RefreshButton({ onRefresh, disabled = false }: RefreshButtonProps) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={disabled}
      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-100 transition hover:border-accent-400/60 hover:bg-accent-500/10 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-accent-400/60"
    >
      Atualizar
    </button>
  );
}
