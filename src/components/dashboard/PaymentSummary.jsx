import { Link } from 'react-router-dom';
import { formatMonthYear } from '../../utils/formatters';

export default function PaymentSummary({ month, year, paid, pending, temporaryUnpaid = 0 }) {
  const total = paid + pending;
  const pct = total === 0 ? 0 : Math.round((paid / total) * 100);

  return (
    <section className="rounded-2xl border border-nest-line bg-white p-4 shadow-soft sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-nest-navy">
            Payment summary
          </h2>
          <p className="mt-0.5 text-sm text-nest-muted">{formatMonthYear(month, year)}</p>
        </div>
        <p className="text-sm font-medium text-nest-navy">{pct}% paid</p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-nest-green transition-all duration-300"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-nest-greenSoft/70 px-3 py-3">
          <p className="text-xs text-nest-green">Paid</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-nest-navy">{paid}</p>
        </div>
        <div className="rounded-xl bg-nest-amberSoft/80 px-3 py-3">
          <p className="text-xs text-nest-amber">Pending</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-nest-navy">{pending}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-nest-muted">
        Monthly residents only. Payments are collected outside the app (Cash / UPI / Card).
      </p>
      {temporaryUnpaid > 0 && (
        <Link to="/payments?status=UNPAID_T" className="mt-2 block text-sm font-medium text-blue-700">
          {temporaryUnpaid} temporary stay {temporaryUnpaid === 1 ? 'person has' : 'people have'} not paid
        </Link>
      )}
    </section>
  );
}
