import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatPhone } from '../../utils/formatters';
import { formatResidentBeds } from '../../utils/roomUtils';

export default function ResidentCard({ resident, paymentStatus, room }) {
  const bedAssignment = formatResidentBeds(resident, room);

  return (
    <Link
      to={`/residents/${resident.id}`}
      className="block rounded-2xl border border-nest-line bg-white p-4 shadow-soft transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-nest-navy">{resident.name}</p>
          <p className="mt-1 text-sm text-nest-muted">
            Room {resident.roomNumber} · {bedAssignment}
            {resident.sharingType === 'SINGLE' ? ' · Single sharing' : ''}
          </p>
          <p className="mt-1 text-sm tabular-nums text-nest-muted">
            {formatPhone(resident.phone)}
          </p>
        </div>
        {paymentStatus && (
          <StatusBadge status={paymentStatus}>
            {paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
          </StatusBadge>
        )}
      </div>
    </Link>
  );
}
