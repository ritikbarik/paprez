interface TagProps {
  label: string;
  variant?: 'success' | 'danger' | 'brand' | 'neutral';
}

const classes: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  danger: 'bg-rose-100 text-rose-700',
  brand: 'bg-brand-100 text-brand-700',
  neutral: 'bg-slate-100 text-slate-700'
};

export function Tag({ label, variant = 'neutral' }: TagProps) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes[variant]}`}>{label}</span>;
}
