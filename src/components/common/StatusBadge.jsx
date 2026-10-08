export default function StatusBadge({ status, children, className = '' }) {
  const styles = {
    PAID: 'bg-nest-greenSoft text-nest-green',
    PENDING: 'bg-nest-amberSoft text-nest-amber',
    FULL: 'bg-nest-greenSoft text-nest-green',
    PARTIAL: 'bg-nest-amberSoft text-nest-amber',
    VACANT: 'bg-slate-100 text-slate-600',
    OCCUPIED: 'bg-nest-greenSoft text-nest-green',
    BLOCKED: 'bg-slate-100 text-slate-600',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide ${styles[status] || 'bg-slate-100 text-slate-700'} ${className}`}
    >
      {children}
    </span>
  );
}
