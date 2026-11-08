import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createTemporaryResident } from '../services/temporaryResidentService';
import { isValidPhone } from '../utils/formatters';
import {
  bedsForAssignment,
  canOfferSingleSharing,
  canOfferTripleOnTwoBed,
  getRoomTypeLabel,
} from '../utils/roomUtils';

export default function AddTemporaryResident() {
  const navigate = useNavigate();
  const { floors, refresh } = useApp();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    amountPerDay: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    stayDays: '1',
    roomNumber: '',
    bedId: '',
    sharingType: 'DOUBLE',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const rooms = useMemo(
    () => floors.flatMap((f) => f.rooms).sort((a, b) => a.roomNumber - b.roomNumber),
    [floors]
  );
  const selectedRoom = rooms.find((r) => String(r.roomNumber) === String(form.roomNumber));
  const offerSingle = selectedRoom && canOfferSingleSharing(selectedRoom);
  const offerTriple =
    selectedRoom &&
    canOfferTripleOnTwoBed(selectedRoom) &&
    selectedRoom.occupancyMode !== 'TRIPLE';
  const sharing =
    selectedRoom?.type === 'SINGLE_BED'
      ? 'SINGLE'
      : selectedRoom?.occupancyMode === 'TRIPLE' || selectedRoom?.type === 'THREE_BED'
        ? 'TRIPLE'
        : form.sharingType === 'SINGLE' && offerSingle
          ? 'SINGLE'
          : form.sharingType === 'TRIPLE' && offerTriple
            ? 'TRIPLE'
            : 'DOUBLE';
  const beds = selectedRoom ? bedsForAssignment(selectedRoom, sharing) : [];

  const setField = (key, value) => {
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (key === 'roomNumber') {
      setForm((prev) => ({ ...prev, roomNumber: value, bedId: '', sharingType: 'DOUBLE' }));
      return;
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!isValidPhone(form.phone)) next.phone = 'Enter a valid 10-digit mobile number.';
    if (!form.amountPerDay || Number(form.amountPerDay) <= 0) next.amountPerDay = 'Enter pay amount per day.';
    if (!form.joiningDate) next.joiningDate = 'Joining date is required.';
    if (!form.stayDays || Number(form.stayDays) < 1) next.stayDays = 'Enter number of days.';
    if (!form.roomNumber) next.roomNumber = 'Select a room.';
    if (sharing !== 'SINGLE' && !form.bedId && !beds[0]) next.bedId = 'Select a bed.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    setFormError('');
    try {
      const created = await createTemporaryResident({
        name: form.name.trim(),
        phone: form.phone,
        amountPerDay: Number(form.amountPerDay),
        joiningDate: form.joiningDate,
        stayDays: Number(form.stayDays),
        roomNumber: Number(form.roomNumber),
        bedId: sharing === 'SINGLE' ? beds[0]?.bedId : form.bedId,
        sharingType: sharing,
      });
      await refresh({ silent: true });
      navigate(`/temporary/${created.id}`);
    } catch (err) {
      setFormError(err.message || 'Unable to add temporary resident.');
    } finally {
      setBusy(false);
    }
  };

  const input = (err) =>
    `w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-nest-navy/10 ${
      err ? 'border-red-300' : 'border-nest-line'
    }`;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link to="/" className="inline-flex min-h-10 items-center gap-1 text-sm text-nest-muted">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Dashboard
      </Link>
      <header>
        <h1 className="font-display text-2xl font-semibold text-nest-navy">Add temporary resident</h1>
        <p className="mt-1 text-sm text-nest-muted">Few-day stay. Kept separate from monthly residents.</p>
      </header>
      {formError && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      )}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Name" error={errors.name}>
          <input className={input(errors.name)} value={form.name} onChange={(e) => setField('name', e.target.value)} />
        </Field>
        <Field label="Phone number" error={errors.phone}>
          <input
            className={input(errors.phone)}
            inputMode="numeric"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
          />
        </Field>
        <Field label="Pay amount per day (₹)" error={errors.amountPerDay}>
          <input
            type="number"
            min="1"
            className={input(errors.amountPerDay)}
            value={form.amountPerDay}
            onChange={(e) => setField('amountPerDay', e.target.value)}
          />
        </Field>
        <Field label="Joining date" error={errors.joiningDate}>
          <input type="date" className={input(errors.joiningDate)} value={form.joiningDate} onChange={(e) => setField('joiningDate', e.target.value)} />
        </Field>
        <Field label="Number of days stay" error={errors.stayDays}>
          <input type="number" min="1" className={input(errors.stayDays)} value={form.stayDays} onChange={(e) => setField('stayDays', e.target.value)} />
        </Field>
        <Field label="Room" error={errors.roomNumber}>
          <select className={input(errors.roomNumber)} value={form.roomNumber} onChange={(e) => setField('roomNumber', e.target.value)}>
            <option value="">Select room</option>
            {rooms.map((room) => {
              const open =
                bedsForAssignment(room, room.occupancyMode === 'TRIPLE' || room.type === 'THREE_BED' ? 'TRIPLE' : 'DOUBLE').length > 0 ||
                canOfferSingleSharing(room) ||
                (canOfferTripleOnTwoBed(room) && room.occupancyMode !== 'TRIPLE');
              return (
                <option key={room.roomNumber} value={room.roomNumber} disabled={!open}>
                  {room.roomNumber} · {getRoomTypeLabel(room)}
                </option>
              );
            })}
          </select>
        </Field>
        {(offerSingle || offerTriple) && (
          <div>
            <span className="mb-1.5 block text-sm font-medium text-nest-navy">Sharing</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Choice selected={sharing === 'DOUBLE'} title="Double" onClick={() => setField('sharingType', 'DOUBLE')} />
              {offerTriple && <Choice selected={sharing === 'TRIPLE'} title="Triple" onClick={() => setField('sharingType', 'TRIPLE')} />}
              {offerSingle && <Choice selected={sharing === 'SINGLE'} title="Single (whole room)" onClick={() => setField('sharingType', 'SINGLE')} />}
            </div>
          </div>
        )}
        {sharing === 'SINGLE' ? (
          <p className="rounded-xl bg-nest-soft px-3 py-3 text-sm text-nest-navy">Both beds assigned for this stay.</p>
        ) : (
          <Field label="Available bed" error={errors.bedId}>
            <select className={input(errors.bedId)} value={form.bedId} onChange={(e) => setField('bedId', e.target.value)} disabled={!selectedRoom}>
              <option value="">Select bed</option>
              {beds.map((bed) => (
                <option key={bed.bedId} value={bed.bedId}>Bed {bed.bedLabel}</option>
              ))}
            </select>
          </Field>
        )}
        <button type="submit" disabled={busy} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-700 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? 'Saving...' : 'Save temporary resident'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-nest-navy">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function Choice({ selected, title, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-12 rounded-xl border px-3 text-sm font-semibold ${
        selected ? 'border-blue-700 bg-blue-700 text-white' : 'border-nest-line bg-white text-nest-navy'
      }`}
    >
      {title}
    </button>
  );
}
