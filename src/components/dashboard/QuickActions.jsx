import { Link } from 'react-router-dom';
import { Clock, History, Search, UserPlus } from 'lucide-react';

const ACTIONS = [
  { to: '/residents/new', label: 'Add Resident', icon: UserPlus },
  { to: '/temporary/new', label: 'Add Temporary Resident', icon: Clock },
  { to: '/residents', label: 'Find Resident', icon: Search },
  { to: '/residents/past', label: 'View Past Residents', icon: History },
];

export default function QuickActions() {
  return (
    <section>
      <h2 className="font-display text-base font-semibold text-nest-navy">Quick actions</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACTIONS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex min-h-[4.5rem] flex-col items-start justify-between rounded-2xl border border-nest-line bg-white p-3 shadow-soft transition active:scale-[0.99]"
          >
            <Icon className="h-5 w-5 text-nest-navy" aria-hidden />
            <span className="text-sm font-medium leading-snug text-nest-navy">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
