import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters';

export default function BedCard({
  bed,
  resident,
  temporary,
  roomNumber,
  singleSharingTwoBed = false,
  tripleTwoMember = false,
  nextBooking,
}) {
  const occupied = bed.status === 'OCCUPIED';
  const blocked = bed.status === 'BLOCKED';
  const isTemporary = bed.occupantType === 'TEMPORARY' || Boolean(temporary);
  const vacating = Boolean(resident?.vacateDate);

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

      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-nest-muted">Now</p>
      {occupied && isTemporary ? (
        <Link
          to={temporary ? `/temporary/${temporary.id}` : '/temporary'}
          className="mt-1 block rounded-xl bg-blue-100 px-3 py-3 transition hover:bg-blue-200"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Temporary</p>
          <p className="mt-1 text-sm font-medium text-nest-navy">{temporary?.name || 'Temporary resident'}</p>
          {temporary?.phone ? <p className="mt-0.5 text-xs text-nest-muted">{formatPhone(temporary.phone)}</p> : null}
          <p className="mt-1 text-xs text-nest-navy">
            {temporary?.paymentStatus === 'PAID' ? 'Paid' : 'Unpaid'}
            {temporary?.stayDays ? ` · ${temporary.stayDays} days` : ''}
            {temporary?.joiningDate ? ` · from ${formatDate(temporary.joiningDate)}` : ''}
          </p>
        </Link>
      ) : occupied && resident ? (
        <Link
          to={`/residents/${resident.id}`}
          className={`mt-1 block rounded-xl px-3 py-3 transition ${
            vacating ? 'bg-red-100 hover:bg-red-200' : 'bg-emerald-100 hover:bg-emerald-200'
          }`}
        >
          <p className={`text-xs font-semibold uppercase tracking-wide ${vacating ? 'text-red-800' : 'text-emerald-800'}`}>
            {vacating ? 'Vacating' : 'Staying'}
          </p>
          <p className="mt-1 text-sm font-medium text-nest-navy">{resident.name}</p>
          <p className="mt-0.5 text-xs text-nest-muted">{formatPhone(resident.phone)}</p>
          <p className="mt-1 text-xs text-nest-navy">
            Joined {formatDate(resident.joiningDate)} · {formatCurrency(resident.monthlyRent)}
          </p>
          {vacating ? (
            <p className="mt-1 text-xs font-medium text-red-900">Vacates {formatDate(resident.vacateDate)}</p>
          ) : singleSharingTwoBed ? (
            <p className="mt-1 text-xs text-nest-muted">Both beds given for single sharing</p>
          ) : null}
          {resident.notes ? <p className="mt-1 text-xs text-nest-muted">{resident.notes}</p> : null}
        </Link>
      ) : blocked ? (
        <p className="mt-1 text-sm text-nest-muted">
          {singleSharingTwoBed
            ? 'Held for single sharing — this room has only one resident.'
            : tripleTwoMember
              ? 'Not in use — triple room opted for 2 members only (room full at 2).'
              : 'Not available for assignment.'}
        </p>
      ) : (
        <div className="mt-1 rounded-xl bg-slate-50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Empty</p>
          <p className="mt-1 text-sm text-nest-muted">No one is staying on this bed now.</p>
          <Link
            to={`/residents/new?room=${roomNumber}&bed=${bed.bedId}`}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-nest-navy px-3 py-2.5 text-sm font-semibold text-white"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            Assign Resident
          </Link>
        </div>
      )}

      {nextBooking && (
        <Link
          to={`/residents/${nextBooking.id}`}
          className={`mt-2 block rounded-xl px-3 py-3 ${
            occupied ? 'bg-pink-100 text-pink-950 hover:bg-pink-200' : 'bg-yellow-100 text-yellow-950 hover:bg-yellow-200'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide">
            {occupied ? 'Next month · bed taken' : 'Next month · bed booked'}
          </p>
          <p className="mt-1 text-sm font-medium text-nest-navy">{nextBooking.name}</p>
          <p className="mt-0.5 text-xs text-nest-muted">{formatPhone(nextBooking.phone)}</p>
          <p className="mt-1 text-xs text-nest-navy">
            Joins {formatDate(nextBooking.joiningDate)} · {formatCurrency(nextBooking.monthlyRent)}
            {nextBooking.deposit != null ? ` · deposit ${formatCurrency(nextBooking.deposit)}` : ''}
          </p>
          {nextBooking.notes ? <p className="mt-1 text-xs text-nest-muted">{nextBooking.notes}</p> : null}
        </Link>
      )}
    </div>
  );
}
