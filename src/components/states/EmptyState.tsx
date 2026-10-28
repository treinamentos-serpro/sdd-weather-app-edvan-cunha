interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = 'Nenhuma cidade encontrada',
  description = 'Tente outra busca por cidade ou CEP.',
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-slate-200 shadow-glass backdrop-blur-md">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  );
}
