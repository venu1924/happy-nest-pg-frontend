import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ResidentForm from '../components/residents/ResidentForm';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { useApp } from '../context/AppContext';
import { createResident } from '../services/residentService';

export default function AddResident() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { floors, loading, error, refresh } = useApp();
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const initialValues = useMemo(
    () => ({
      roomNumber: searchParams.get('room') || '',
      bedId: searchParams.get('bed') || '',
      sharingType: searchParams.get('sharing') === 'SINGLE' ? 'SINGLE' : 'DOUBLE',
    }),
    [searchParams]
  );

  const handleSubmit = async (payload) => {
    setBusy(true);
    setFormError('');
    try {
      const created = await createResident(payload);
      navigate(`/residents/${created.id}`);
    } catch (err) {
      setFormError(err.message || 'Unable to add resident.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState message="Loading rooms..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link
        to="/residents"
        className="inline-flex min-h-10 items-center gap-1 text-sm text-nest-muted"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Residents
      </Link>

      <header>
        <h1 className="font-display text-2xl font-semibold text-nest-navy">Add Resident</h1>
        <p className="mt-1 text-sm text-nest-muted">
          Monthly stay · empty 2-bed rooms: double sharing (one bed) or single sharing (both beds)
        </p>
      </header>

      {formError && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <ResidentForm
        floors={floors}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        busy={busy}
      />
    </div>
  );
}
