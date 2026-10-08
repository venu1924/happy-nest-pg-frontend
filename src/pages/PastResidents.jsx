import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { getPastResidents } from '../services/residentService';
import { formatCurrency, formatDate, formatPhone } from '../utils/formatters';
import { subscribe } from '../data/mockStore';
import { USE_MOCK } from '../services/api';

export default function PastResidents() {
  const [pastResidents, setPastResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPastResidents();
      setPastResidents(data);
    } catch (err) {
      setError(err.message || 'Unable to load past residents.');
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pastResidents;
    return pastResidents.filter((r) => {
      const hay = `${r.name} ${r.phone} ${r.lastRoomNumber}`.toLowerCase();
      return hay.includes(q);
    });
  }, [pastResidents, query]);

  if (loading) return <LoadingState message="Loading past residents..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <Link
        to="/"
        className="inline-flex min-h-10 items-center gap-1 text-sm text-nest-muted"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Dashboard
      </Link>

      <header>
        <h1 className="font-display text-2xl font-semibold text-nest-navy">Past residents</h1>
        <p className="mt-1 text-sm text-nest-muted">
          People who stayed earlier and are not currently living here
        </p>
      </header>

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search by name, phone, or room..."
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No past residents found."
          description="When a resident leaves (deleted), they appear here."
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-nest-line bg-white p-4 shadow-soft"
            >
              <p className="font-medium text-nest-navy">{r.name}</p>
              <p className="mt-1 text-sm text-nest-muted">
                Last room {r.lastRoomNumber}
                {r.lastBedId ? ` · Bed ${String(r.lastBedId).split('-').pop()}` : ''}
              </p>
              <p className="mt-1 text-sm tabular-nums text-nest-muted">{formatPhone(r.phone)}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-nest-muted">
                <span>Joined {formatDate(r.joiningDate)}</span>
                <span>Left {formatDate(r.checkoutDate)}</span>
              </div>
              {r.deposit != null && r.deposit !== '' ? (
                <p className="mt-2 text-xs text-nest-muted">
                  Deposit: {formatCurrency(r.deposit)}
                  {r.depositRefundable === false ? ' · Non-refundable' : ' · Refundable'}
                </p>
              ) : null}
              {r.deletionReason ? (
                <p className="mt-2 text-xs text-nest-muted">Left reason: {r.deletionReason}</p>
              ) : null}
              {r.notes ? (
                <p className="mt-1 text-xs text-nest-muted">Note: {r.notes}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}