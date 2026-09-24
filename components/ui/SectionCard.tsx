import clsx from 'clsx';

interface SectionCardProps {
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}

export function SectionCard({ title, description, className, children }: SectionCardProps) {
  return (
    <section className={clsx('glass-card rounded-3xl border p-8 shadow-lg', className)}>
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
        <p className="text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}
