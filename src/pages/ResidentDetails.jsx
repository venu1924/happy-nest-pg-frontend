import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, Pencil, Trash2 } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { getResidentById, deleteResident } from '../services/residentService';
import { useApp } from '../context/AppContext';
import { formatResidentBeds } from '../utils/roomUtils';
import { getPayments } from '../services/paymentService';
import {
  formatCurrency,
  formatDate,
  formatMonthYear,
  formatPhone,
  getCurrentMonthYear,
} from '../utils/formatters';

export default function ResidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { floors } = useApp();
  const [resident, setResident] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getResidentById(id);
      if (!data) {
        setError('Resident not found.');
        setResident(null);
        return;
      }
      setResident(data);
      const { month, year } = getCurrentMonthYear();
      const payments = await getPayments({ month, year });
      setPayment(payments.find((p) => p.residentId === id) ?? null);
    } catch (err) {
      setError(err.message || 'Unable to load resident.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const room = useMemo(() => {
    if (!resident) return null;
    for (const floor of floors) {
      const found = floor.rooms.find((r) => r.roomNumber === resident.roomNumber);
      if (found) return found;
    }
    return null;
  }, [floors, resident]);

  const bedAssignment = useMemo(
    () => (resident ? formatResidentBeds(resident, room) : '—'),
    [resident, room]
  );

  const bedLabel = useMemo(
    () => resident?.bedId?.split('-').pop() ?? '—',
    [resident]
  );

  const openDeleteDialog = () => {
    setDeleteReason('');
    setConfirmDelete(true);
  };

  const closeDeleteDialog = () => {
    setConfirmDelete(false);
    setDeleteReason('');
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteResident(id, {
        notes: deleteReason.trim() || undefined,
      });
      closeDeleteDialog();
      navigate('/residents');
    } catch (err) {
      setDeleteError(err.message || 'Unable to delete resident.');
      closeDeleteDialog();
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingState message="Loading resident..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!resident) return null;

  const { month, year } = getCurrentMonthYear();

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex min-h-10 items-center gap-1 text-sm text-nest-muted"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      <header className="rounded-2xl border border-nest-line bg-white p-5 shadow-soft">
        <h1 className="font-display text-2xl font-semibold text-nest-navy">{resident.name}</h1>
        <p className="mt-2 text-sm text-nest-muted">
          Room {resident.roomNumber} · {bedAssignment}
          {resident.sharingType === 'SINGLE'
            ? ' · Single sharing (whole room)'
            : resident.sharingType === 'DOUBLE'
              ? ' · Double sharing'
              : ''}
        </p>
        <p className="mt-1 text-sm tabular-nums text-nest-muted">{formatPhone(resident.phone)}</p>
      </header>

      <section className="rounded-2xl border border-nest-line bg-white p-4 shadow-soft">
        <dl className="space-y-3 text-sm">
          <Row label="Joining date" value={formatDate(resident.joiningDate)} />
          <Row label="Monthly rent" value={formatCurrency(resident.monthlyRent)} />
          <Row
            label="Deposit"
            value={formatCurrency(resident.deposit ?? 0)}
          />
          <Row
            label="Refund amount"
            value={formatCurrency(
              resident.refundAmount ??
                (resident.depositRefundable === false ? 0 : resident.deposit ?? 0)
            )}
          />
          <Row
            label="Sharing"
            value={
              resident.sharingType === 'SINGLE'
                ? 'Single sharing'
                : resident.sharingType === 'DOUBLE'
                  ? 'Double sharing'
                  : '—'
            }
          />
          <Row label="Stay type" value="Monthly stay" />
          <div className="flex items-center justify-between gap-3">
            <dt className="text-nest-muted">{formatMonthYear(month, year)} payment</dt>
            <dd>
              {payment ? (
                <StatusBadge status={payment.status}>
                  {payment.status === 'PAID' ? 'Paid' : 'Pending'}
                </StatusBadge>
              ) : (
                '—'
              )}
            </dd>
          </div>
          {resident.notes ? <Row label="Notes" value={resident.notes} /> : null}
        </dl>
      </section>

      {deleteError && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {deleteError}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to={`/residents/${resident.id}/edit`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-nest-line bg-white text-sm font-semibold text-nest-navy"
        >
          <Pencil className="h-4 w-4" aria-hidden />
          Edit Details
        </Link>
        <Link
          to={`/residents/${resident.id}/transfer`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-nest-navy text-sm font-semibold text-white"
        >
          <ArrowRightLeft className="h-4 w-4" aria-hidden />
          Transfer Room
        </Link>
      </div>

      <button
        type="button"
        onClick={openDeleteDialog}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-600"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        Delete Resident
      </button>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete resident?"
        message={`Delete ${resident.name}? Their bed (Room ${resident.roomNumber} · Bed ${bedLabel}) will become vacant. This cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        danger
        onCancel={closeDeleteDialog}
        onConfirm={handleDelete}
      >
        <label className="block text-sm">
          <span className="font-medium text-nest-navy">
            Reason <span className="font-normal text-nest-muted">(optional)</span>
          </span>
          <textarea
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            rows={3}
            placeholder="e.g. Moved out, job transfer, personal reasons..."
            className="mt-1.5 w-full rounded-xl border border-nest-line bg-white px-3 py-2.5 text-sm text-nest-navy placeholder:text-nest-muted/70 focus:border-nest-navy focus:outline-none focus:ring-1 focus:ring-nest-navy"
          />
        </label>
      </ConfirmDialog>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-nest-muted">{label}</dt>
      <dd className="text-right font-medium text-nest-navy">{value}</dd>
    </div>
  );
}