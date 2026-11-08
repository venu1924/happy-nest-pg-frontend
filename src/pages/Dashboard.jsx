import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightLeft } from 'lucide-react';
import { stayCountdown } from '../utils/stayUtils';
import DashboardCard from '../components/dashboard/DashboardCard';
import PaymentSummary from '../components/dashboard/PaymentSummary';
import QuickActions from '../components/dashboard/QuickActions';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { getDashboardStats } from '../services/dashboardService';
import { getGreeting } from '../utils/formatters';
import { subscribe } from '../data/mockStore';
import { USE_MOCK } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Unable to load dashboard.');
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

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats) return null;

  const { paymentSummary } = stats;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-nest-navy sm:text-3xl">
          {getGreeting()} 👋
        </h1>
        <p className="mt-1 text-sm text-nest-muted">Here&apos;s what&apos;s happening in your PG.</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <DashboardCard label="Residents" value={stats.totalResidents} hint="Monthly stays only" />
        <DashboardCard
          label="Temporary residents"
          value={stats.temporaryResidents ?? 0}
          hint="Few-day stays"
        />
        <DashboardCard
          label="Vacant beds"
          value={stats.vacantBeds}
          hint="Ignores temporary stays"
        />
        <DashboardCard
          label="Vacant beds (P+T)"
          value={stats.vacantBedsPT ?? stats.vacantBeds}
          hint="Monthly and temporary"
        />
      </div>

      <PaymentSummary
        month={paymentSummary.month}
        year={paymentSummary.year}
        paid={paymentSummary.paid}
        pending={paymentSummary.pending}
        temporaryUnpaid={paymentSummary.temporaryUnpaid ?? 0}
      />

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-semibold text-nest-navy">Temporary residents</h2>
          <Link to="/temporary" className="text-sm font-medium text-blue-700">
            View all
          </Link>
        </div>
        {(stats.temporaryStayAlerts || []).length === 0 ? (
          <p className="mt-2 text-sm text-nest-muted">No temporary stays right now.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {stats.temporaryStayAlerts.map((stay) => (
              <li key={stay.id}>
                <Link
                  to={`/temporary/${stay.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-soft"
                >
                  <span>
                    <span className="block text-sm font-semibold text-nest-navy">{stay.name}</span>
                    <span className="mt-0.5 block text-xs text-nest-muted">
                      Room {stay.roomNumber} · Temporary stay
                    </span>
                  </span>
                  <span className="text-sm font-medium text-blue-700">{stayCountdown(stay)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <QuickActions />

      <section>
        <h2 className="font-display text-base font-semibold text-nest-navy">Recent transfers</h2>
        <Link
          to="/transfers"
          className="mt-3 flex min-h-14 items-center gap-3 rounded-2xl border border-nest-line bg-white px-4 py-3 shadow-soft transition active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nest-soft text-nest-navy">
            <ArrowRightLeft className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-nest-navy">View recent transfers</span>
            <span className="mt-0.5 block text-xs text-nest-muted">
              See last transfers and filter by date
            </span>
          </span>
        </Link>
      </section>
    </div>
  );
}
