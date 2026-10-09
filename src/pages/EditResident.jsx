import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ResidentForm from '../components/residents/ResidentForm';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { useApp } from '../context/AppContext';
import { updateResident } from '../services/residentService';

/**
 * Edit keeps room/bed fixed in Phase 1 — use Transfer for room changes.
 */
export default function EditResident() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { residents, floors, loading, error, refresh } = useApp();
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const resident = useMemo(
    () => residents.find((r) => r.id === id),
    [residents, id]
  );

  const handleSubmit = async (payload) => {
    setBusy(true);
    setFormError('');
    try {
      await updateResident(id, {
        name: payload.name,
        phone: payload.phone,
        joiningDate: payload.joiningDate,
        monthlyRent: payload.monthlyRent,
        deposit: payload.deposit,
        refundAmount: payload.refundAmount,
        depositRefundable: payload.depositRefundable,
        notes: payload.notes,
      });
      navigate(`/residents/${id}`);
    } catch (err) {
      setFormError(err.message || 'Unable to update resident.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState message="Loading resident..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!resident) return <ErrorState message="Resident not found." />;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link
        to={`/residents/${id}`}
        className="inline-flex min-h-10 items-center gap-1 text-sm text-nest-muted"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </Link>

      <header>
        <h1 className="font-display text-2xl font-semibold text-nest-navy">Edit Details</h1>
        <p className="mt-1 text-sm text-nest-muted">
          To change room or bed, use Transfer Room.
        </p>
      </header>

      {formError && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <ResidentForm
        floors={floors}
        initialValues={{
          ...resident,
          roomNumber: String(resident.roomNumber),
          monthlyRent: String(resident.monthlyRent ?? ''),
          deposit: String(resident.deposit ?? 0),
          refundAmount: String(
            resident.refundAmount ??
              (resident.depositRefundable === false ? 0 : resident.deposit ?? 0)
          ),
          sharingType: resident.sharingType || 'DOUBLE',
        }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        busy={busy}
        lockAssignment
      />
    </div>
  );
}
