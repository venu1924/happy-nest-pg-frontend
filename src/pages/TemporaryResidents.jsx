import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatPhone } from '../utils/formatters';
import { stayCountdown } from '../utils/stayUtils';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';

export default function TemporaryResidents() {
  const { temporaryResidents } = useApp();
  const list = [...(temporaryResidents || [])].sort((a, b) => Number(a.daysLeft) - Number(b.daysLeft));

  return (
    <div className="space-y-5">
      <Link to="/" className="inline-flex min-h-10 items-center gap-1 text-sm text-nest-muted">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Dashboard
      </Link>
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-nest-navy">Temporary residents</h1>
          <p className="mt-1 text-sm text-nest-muted">Few-day stays. Not counted as monthly residents.</p>
        </div>
        <Link to="/temporary/new" className="shrink-0 rounded-xl bg-blue-700 px-3 py-2 text-sm font-semibold text-white">
          Add
        </Link>
      </header>
      {list.length === 0 ? (
        <EmptyState title="No temporary residents" description="Add a few-day stay from the dashboard." />
      ) : (
        <ul className="space-y-3">
          {list.map((stay) => (
            <li key={stay.id}>
              <Link to={`/temporary/${stay.id}`} className="block rounded-2xl border border-blue-100 bg-white p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-nest-navy">{stay.name}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-700">Temporary stay</p>
                    <p className="mt-1 text-sm text-nest-muted">
                      Room {stay.roomNumber} · {formatPhone(stay.phone)}
                    </p>
                    <p className="mt-1 text-sm font-medium text-nest-navy">{stayCountdown(stay)}</p>
                  </div>
                  <StatusBadge status={stay.paymentStatus}>
                    {stay.paymentStatus === 'PAID' ? 'Paid' : 'Unpaid'}
                  </StatusBadge>
                </div>
                <p className="mt-2 text-sm tabular-nums text-nest-navy">
                  {formatCurrency(stay.amountPerDay)} / day · {stay.stayDays} days · {formatCurrency(stay.amount)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
