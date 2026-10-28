export default function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-slate-200 shadow-glass backdrop-blur-md"
    >
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-accent-400 border-t-transparent" />
      <p className="mt-4 text-lg font-medium">Buscando condições climáticas...</p>
    </div>
  );
}
