import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightLeft } from 'lucide-react';
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DashboardCard label="Residents" value={stats.totalResidents} />
        <DashboardCard label="Rooms" value={stats.totalRooms} />
        <DashboardCard label="Vacant Beds" value={stats.vacantBeds} />
        <DashboardCard label="Pending Payments" value={stats.pendingPayments} />
      </div>

      <PaymentSummary
        month={paymentSummary.month}
        year={paymentSummary.year}
        paid={paymentSummary.paid}
        pending={paymentSummary.pending}
      />

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
