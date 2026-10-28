interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-rose-100 shadow-glass backdrop-blur-md"
    >
      <h3 className="text-xl font-semibold">Não foi possível carregar o clima</h3>
      <p className="mt-2 text-sm text-rose-100/90">{message ?? 'Tente novamente em instantes.'}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-full bg-rose-500 px-4 py-2 font-medium text-white transition hover:bg-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
      >
        Tentar novamente
      </button>
    </div>
  );
}
