import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PaymentCard from '../components/payments/PaymentCard';
import SearchBar from '../components/common/SearchBar';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { usePayments } from '../hooks/usePayments';
import { formatMonthYear, monthName } from '../utils/formatters';

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'PAID', label: 'Paid' },
  { id: 'PENDING', label: 'Pending' },
];

export default function Payments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    payments,
    summary,
    month,
    year,
    setMonth,
    setYear,
    query,
    setQuery,
    status,
    setStatus,
    loading,
    error,
    reload,
    markPaid,
  } = usePayments();

  useEffect(() => {
    const initial = searchParams.get('status');
    if (initial === 'PAID' || initial === 'PENDING') setStatus(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = {};
    if (status !== 'ALL') params.status = status;
    if (query) params.q = query;
    setSearchParams(params, { replace: true });
  }, [status, query, setSearchParams]);

  const shiftMonth = (delta) => {
    const date = new Date(year, month - 1 + delta, 1);
    setMonth(date.getMonth() + 1);
    setYear(date.getFullYear());
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-semibold text-nest-navy">Payments</h1>
        <p className="mt-1 text-sm text-nest-muted">
          Record keeping only · Cash / UPI / Card collected outside the app
        </p>
      </header>

      <div className="flex items-center justify-between rounded-2xl border border-nest-line bg-white px-3 py-3 shadow-soft">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="min-h-10 min-w-10 rounded-lg text-nest-navy"
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="font-medium text-nest-navy">{formatMonthYear(month, year)}</p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="min-h-10 min-w-10 rounded-lg text-nest-navy"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-nest-line bg-nest-greenSoft/50 p-4">
          <p className="text-xs text-nest-green">Paid</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{summary.paid}</p>
        </div>
        <div className="rounded-2xl border border-nest-line bg-nest-amberSoft/60 p-4">
          <p className="text-xs text-nest-amber">Pending</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{summary.pending}</p>
        </div>
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search resident or room..."
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setStatus(f.id)}
            className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-medium ${
              status === f.id
                ? 'bg-nest-navy text-white'
                : 'border border-nest-line bg-white text-nest-navy'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading payments..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : payments.length === 0 ? (
        <EmptyState
          title="No payment records."
          description={`Nothing for ${monthName(month)} ${year} with this filter.`}
        />
      ) : (
        <ul className="space-y-3">
          {payments.map((payment) => (
            <li key={payment.id}>
              <PaymentCard payment={payment} onMarkPaid={markPaid} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
