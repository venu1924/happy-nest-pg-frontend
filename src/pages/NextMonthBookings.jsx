import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, formatPhone } from '../utils/formatters';
import { isNextMonthBooking } from '../utils/roomUtils';
import EmptyState from '../components/common/EmptyState';

export default function NextMonthBookings() {
  const { residents } = useApp();
  const list = (residents || [])
    .filter((person) => isNextMonthBooking(person))
    .sort((a, b) => String(a.joiningDate).localeCompare(String(b.joiningDate)) || a.name.localeCompare(b.name));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-semibold text-nest-navy">Next month bookings</h1>
        <p className="mt-1 text-sm text-nest-muted">
          These residents join next month. When that month starts they show with the present residents.
        </p>
      </header>
      {list.length === 0 ? (
        <EmptyState
          title="No next month bookings"
          description="Add a resident with a joining date in next month."
        />
      ) : (
        <ul className="space-y-3">
          {list.map((person) => (
            <li key={person.id}>
              <Link
                to={`/residents/${person.id}`}
                className="block rounded-2xl border border-pink-100 bg-white p-4 shadow-soft"
              >
                <p className="font-medium text-nest-navy">{person.name}</p>
                <p className="mt-1 text-sm text-nest-muted">
                  Room {person.roomNumber} · Bed {String(person.bedId || '').split('-').pop() || '—'} · {formatPhone(person.phone)}
                </p>
                <p className="mt-1 text-sm text-nest-navy">Joins {formatDate(person.joiningDate)}</p>
                <p className="mt-1 text-sm tabular-nums text-nest-muted">
                  Rent {formatCurrency(person.monthlyRent)} · Deposit {formatCurrency(person.deposit ?? 0)}
                </p>
                {person.notes ? <p className="mt-2 text-sm text-nest-muted">{person.notes}</p> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
