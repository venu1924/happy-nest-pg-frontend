export default function DashboardCard({ label, value, hint, onClick }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`rounded-2xl border border-nest-line bg-white p-4 text-left shadow-soft ${
        onClick ? 'transition active:scale-[0.99]' : ''
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-nest-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-nest-navy">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-nest-muted">{hint}</p>}
    </Comp>
  );
}
