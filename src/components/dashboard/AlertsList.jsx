import { AlertTriangle, BedDouble, ArrowRightLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AlertsList({ alerts = [] }) {
  if (!alerts.length) return null;

  const iconFor = (id) => {
    if (id === 'pending') return AlertTriangle;
    if (id === 'transfer') return ArrowRightLeft;
    return BedDouble;
  };

  const linkFor = (id) => {
    if (id === 'pending') return '/payments?status=PENDING';
    if (id === 'vacant') return '/rooms';
    return '/rooms';
  };

  return (
    <section>
      <h2 className="font-display text-base font-semibold text-nest-navy">Alerts</h2>
      <ul className="mt-3 space-y-2">
        {alerts.map((alert) => {
          const Icon = iconFor(alert.id);
          return (
            <li key={alert.id}>
              <Link
                to={linkFor(alert.id)}
                className="flex items-center gap-3 rounded-xl border border-nest-line bg-white px-3 py-3 shadow-soft"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    alert.type === 'warning'
                      ? 'bg-nest-amberSoft text-nest-amber'
                      : 'bg-nest-soft text-nest-navy'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="text-sm font-medium text-nest-navy">{alert.message}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
