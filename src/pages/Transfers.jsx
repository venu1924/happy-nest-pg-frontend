import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft } from 'lucide-react';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { getTransfers } from '../services/transferService';
import { formatDate } from '../utils/formatters';
import { subscribe } from '../data/mockStore';
import { USE_MOCK } from '../services/api';

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [useDateFilter, setUseDateFilter] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransfers();
      setTransfers(data);
    } catch (err) {
      setError(err.message || 'Unable to load transfers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!USE_MOCK) return undefined;
    return subscribe(() => load());
  }, []);

  const visible = useMemo(() => {
    const sorted = [...transfers].sort((a, b) =>
      String(b.transferDate).localeCompare(String(a.transferDate))
    );

    if (useDateFilter && (fromDate || toDate)) {
      return sorted.filter((t) => {
        const d = t.transferDate;
        if (fromDate && d < fromDate) return false;
        if (toDate && d > toDate) return false;
        return true;
      });
    }

    return sorted.slice(0, 5);
  }, [transfers, useDateFilter, fromDate, toDate]);

  if (loading) return <LoadingState message="Loading transfers..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link to="/" className="inline-flex min-h-10 items-center gap-1 text-sm text-nest-muted">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Dashboard
      </Link>

      <header>
        <h1 className="font-display text-2xl font-semibold text-nest-navy">Recent transfers</h1>
        <p className="mt-1 text-sm text-nest-muted">
          {useDateFilter
            ? 'Showing transfers in the selected date range'
            : 'Showing the last 5 transfers'}
        </p>
      </header>

      <section className="rounded-2xl border border-nest-line bg-white p-4 shadow-soft">
        <label className="flex items-center gap-2 text-sm font-medium text-nest-navy">
          <input
            type="checkbox"
            checked={useDateFilter}
            onChange={(e) => setUseDateFilter(e.target.checked)}
            className="h-4 w-4 rounded border-nest-line"
          />
          Filter by duration
        </label>

        {useDateFilter && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-nest-navy">From date</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-xl border border-nest-line px-3 py-2.5 text-sm outline-none focus:border-nest-navy/40 focus:ring-2 focus:ring-nest-navy/10"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-nest-navy">To date</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-xl border border-nest-line px-3 py-2.5 text-sm outline-none focus:border-nest-navy/40 focus:ring-2 focus:ring-nest-navy/10"
              />
            </label>
          </div>
        )}
      </section>

      {visible.length === 0 ? (
        <EmptyState
          title="No transfers found."
          description={
            useDateFilter
              ? 'Try a different from / to date range.'
              : 'Room transfers will appear here.'
          }
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((t) => (
            <li
              key={t.id}
              className="rounded-2xl border border-nest-line bg-white p-4 shadow-soft"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nest-soft text-nest-navy">
                  <ArrowRightLeft className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-nest-navy">{t.residentName || 'Resident'}</p>
                  <p className="mt-1 text-sm text-nest-muted">
                    Room {t.fromRoomNumber}
                    {t.fromBedId ? ` · Bed ${String(t.fromBedId).split('-').pop()}` : ''}
                    {' → '}
                    Room {t.toRoomNumber}
                    {t.toBedId ? ` · Bed ${String(t.toBedId).split('-').pop()}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-nest-muted">{formatDate(t.transferDate)}</p>
                  {t.note ? (
                    <p className="mt-2 text-xs text-nest-muted">Note: {t.note}</p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
