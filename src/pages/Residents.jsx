import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ResidentCard from '../components/residents/ResidentCard';
import SearchBar from '../components/common/SearchBar';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { useResidents } from '../hooks/useResidents';
import { useApp } from '../context/AppContext';
import { getPayments } from '../services/paymentService';
import { getCurrentMonthYear } from '../utils/formatters';

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'PAID', label: 'Paid' },
  { id: 'PENDING', label: 'Pending' },
];

export default function Residents() {
  const { loading, error, refresh, floors } = useApp();

  const roomByNumber = (roomNumber) => {
    for (const floor of floors) {
      const room = floor.rooms.find((r) => r.roomNumber === roomNumber);
      if (room) return room;
    }
    return null;
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const { month, year } = getCurrentMonthYear();
    getPayments({ month, year }).then(setPayments).catch(() => setPayments([]));
  }, []);

  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    if (status !== 'ALL') params.status = status;
    setSearchParams(params, { replace: true });
  }, [query, status, setSearchParams]);

  const { residents, paymentMap } = useResidents({
    query,
    paymentStatus: status,
    payments,
  });

  if (loading) return <LoadingState message="Loading residents..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-nest-navy">Residents</h1>
        <Link
          to="/residents/new"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-nest-navy px-3 py-2 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add
        </Link>
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search residents..."
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
                : 'bg-white text-nest-navy border border-nest-line'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {residents.length === 0 ? (
        <EmptyState
          title="No residents found."
          description="Try a different search or filter."
        />
      ) : (
        <ul className="space-y-3">
          {residents.map((resident) => (
            <li key={resident.id}>
              <ResidentCard
                resident={resident}
                room={roomByNumber(resident.roomNumber)}
                paymentStatus={paymentMap.get(resident.id)?.status}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
