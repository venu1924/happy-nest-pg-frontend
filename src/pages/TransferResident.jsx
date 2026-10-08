import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TransferForm from '../components/residents/TransferForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { useApp } from '../context/AppContext';
import { transferResident } from '../services/transferService';

export default function TransferResident() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { residents, floors, loading, error, refresh } = useApp();
  const [busy, setBusy] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [formError, setFormError] = useState('');

  const resident = useMemo(
    () => residents.find((r) => r.id === id),
    [residents, id]
  );

  const handleSubmit = (payload) => {
    setPendingPayload(payload);
  };

  const confirmTransfer = async () => {
    if (!pendingPayload) return;
    setBusy(true);
    setFormError('');
    try {
      await transferResident(id, pendingPayload);
      setPendingPayload(null);
      navigate(`/residents/${id}`);
    } catch (err) {
      setFormError(err.message || 'Unable to transfer resident.');
      setPendingPayload(null);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState message="Loading..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!resident) return <ErrorState message="Resident not found." />;

  const toBedLabel = pendingPayload?.toBedId?.split('-').pop();
  const fromBedLabel = resident.bedId?.split('-').pop();

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
        <h1 className="font-display text-2xl font-semibold text-nest-navy">Transfer Room</h1>
        <p className="mt-1 text-sm text-nest-muted">Only vacant beds can be selected.</p>
      </header>

      {formError && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <TransferForm
        resident={resident}
        floors={floors}
        onSubmit={handleSubmit}
        busy={busy}
      />

      <ConfirmDialog
        open={Boolean(pendingPayload)}
        title="Confirm transfer?"
        message={`Transfer ${resident.name} from Room ${resident.roomNumber} Bed ${fromBedLabel} to Room ${pendingPayload?.toRoomNumber} Bed ${toBedLabel}${pendingPayload?.sharingType === 'SINGLE' ? ' as single sharing' : ''}?`}
        confirmLabel={busy ? 'Transferring...' : 'Confirm Transfer'}
        onCancel={() => setPendingPayload(null)}
        onConfirm={confirmTransfer}
      />
    </div>
  );
}
