import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function BedCard({
  bed,
  resident,
  roomNumber,
  singleSharingTwoBed = false,
  tripleTwoMember = false,
}) {
  const occupied = bed.status === 'OCCUPIED';
  const blocked = bed.status === 'BLOCKED';

  return (
    <div className="rounded-2xl border border-nest-line bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-base font-semibold text-nest-navy">
          Bed {bed.bedLabel}
        </p>
        <StatusBadge status={occupied ? 'OCCUPIED' : blocked ? 'BLOCKED' : 'VACANT'}>
          {occupied ? 'Occupied' : blocked ? 'Held' : 'Vacant'}
        </StatusBadge>
      </div>

      {occupied && resident ? (
        <Link
          to={`/residents/${resident.id}`}
          className="mt-3 block rounded-xl bg-nest-soft px-3 py-3 transition hover:bg-slate-100"
        >
          <p className="text-sm font-medium text-nest-navy">{resident.name}</p>
          <p className="mt-0.5 text-xs text-nest-muted">
            {singleSharingTwoBed
              ? 'Both beds given for single sharing'
              : 'View resident details'}
          </p>
        </Link>
      ) : blocked ? (
        <p className="mt-3 text-sm text-nest-muted">
          {singleSharingTwoBed
            ? 'Held for single sharing — this room has only one resident.'
            : tripleTwoMember
              ? 'Not in use — triple room opted for 2 members only (room full at 2).'
              : 'Not available for assignment.'}
        </p>
      ) : (
        <div className="mt-3">
          <p className="text-sm text-nest-muted">Vacant</p>
          <Link
            to={`/residents/new?room=${roomNumber}&bed=${bed.bedId}`}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-nest-navy px-3 py-2.5 text-sm font-semibold text-white"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            Assign Resident
          </Link>
        </div>
      )}
    </div>
  );
}
