interface StatCardProps {
  label: string;
  value: string | number;
  accent?: string;
}

export function StatCard({ label, value, accent = 'bg-brand-100 text-brand-700' }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className={`mt-4 text-3xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
