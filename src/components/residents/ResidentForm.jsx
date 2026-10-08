import { useEffect, useMemo, useState } from 'react';
import { isValidPhone } from '../../utils/formatters';
import {
  getVacantBeds,
  getRoomTypeLabel,
  canOfferSingleSharing,
  canChooseTripleMemberLimit,
  countOccupiedBeds,
} from '../../utils/roomUtils';
import {
  defaultRentForAssignment,
  TRIPLE_MEMBER_LIMIT_TWO,
  TRIPLE_MEMBER_LIMIT_THREE,
} from '../../data/buildingConfig';

const emptyForm = {
  name: '',
  phone: '',
  joiningDate: new Date().toISOString().slice(0, 10),
  roomNumber: '',
  bedId: '',
  sharingType: 'DOUBLE',
  tripleMemberLimit: TRIPLE_MEMBER_LIMIT_THREE,
  monthlyRent: '',
  deposit: '',
  depositRefundable: true,
  notes: '',
};

export default function ResidentForm({
  floors,
  initialValues,
  onSubmit,
  submitLabel = 'Add Resident',
  busy = false,
  lockAssignment = false,
}) {
  const [form, setForm] = useState({ ...emptyForm, ...initialValues });
  const [errors, setErrors] = useState({});
  const [rentTouched, setRentTouched] = useState(Boolean(initialValues?.monthlyRent));
  const [depositTouched, setDepositTouched] = useState(Boolean(initialValues?.deposit));

  const rooms = useMemo(
    () => floors.flatMap((f) => f.rooms).sort((a, b) => a.roomNumber - b.roomNumber),
    [floors]
  );

  const selectedRoom = useMemo(
    () => rooms.find((r) => String(r.roomNumber) === String(form.roomNumber)),
    [rooms, form.roomNumber]
  );

  const vacantBeds = useMemo(
    () => (selectedRoom ? getVacantBeds(selectedRoom) : []),
    [selectedRoom]
  );

  const showSharingChoice =
    !lockAssignment && selectedRoom && canOfferSingleSharing(selectedRoom);

  const showTripleMemberChoice =
    !lockAssignment && selectedRoom && canChooseTripleMemberLimit(selectedRoom);

  const effectiveTripleLimit = useMemo(() => {
    if (!selectedRoom || selectedRoom.type !== 'THREE_BED') return null;
    if (!canChooseTripleMemberLimit(selectedRoom)) {
      return selectedRoom.tripleMemberLimit ?? TRIPLE_MEMBER_LIMIT_THREE;
    }
    const n = Number(form.tripleMemberLimit);
    return n === TRIPLE_MEMBER_LIMIT_TWO ? TRIPLE_MEMBER_LIMIT_TWO : TRIPLE_MEMBER_LIMIT_THREE;
  }, [selectedRoom, form.tripleMemberLimit]);

  const effectiveSharing = useMemo(() => {
    if (lockAssignment) return initialValues?.sharingType || 'DOUBLE';
    if (!selectedRoom) return form.sharingType;
    if (selectedRoom.type === 'SINGLE_BED') return 'SINGLE';
    if (showSharingChoice) return form.sharingType === 'SINGLE' ? 'SINGLE' : 'DOUBLE';
    return 'DOUBLE';
  }, [lockAssignment, initialValues, selectedRoom, showSharingChoice, form.sharingType]);

  useEffect(() => {
    if (lockAssignment || !selectedRoom) return;
    const rent = String(defaultRentForAssignment(selectedRoom.type, effectiveSharing));
    setForm((prev) => {
      const next = { ...prev };
      if (!rentTouched) next.monthlyRent = rent;
      if (!depositTouched) next.deposit = next.monthlyRent || rent;
      return next;
    });
  }, [selectedRoom, effectiveSharing, lockAssignment, rentTouched, depositTouched]);

  useEffect(() => {
    if (lockAssignment) return;
    if (effectiveSharing === 'SINGLE' && vacantBeds[0] && form.bedId !== vacantBeds[0].bedId) {
      setForm((prev) => ({ ...prev, bedId: vacantBeds[0].bedId }));
      return;
    }
    if (form.bedId && !vacantBeds.some((b) => b.bedId === form.bedId)) {
      setForm((prev) => ({ ...prev, bedId: '' }));
    }
  }, [vacantBeds, form.bedId, lockAssignment, effectiveSharing]);

  const setField = (key, value) => {
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (key === 'monthlyRent') setRentTouched(true);
    if (key === 'deposit') setDepositTouched(true);
    if (key === 'roomNumber') {
      setRentTouched(false);
      setDepositTouched(false);
      setForm((prev) => ({
        ...prev,
        roomNumber: value,
        bedId: '',
        sharingType: 'DOUBLE',
        tripleMemberLimit: TRIPLE_MEMBER_LIMIT_THREE,
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!isValidPhone(form.phone)) next.phone = 'Enter a valid 10-digit mobile number.';
    if (!form.joiningDate) next.joiningDate = 'Joining date is required.';
    if (!lockAssignment) {
      if (!form.roomNumber) next.roomNumber = 'Please select a room.';
      if (!form.bedId) next.bedId = 'Please select an available bed.';
      if (selectedRoom && vacantBeds.length === 0) {
        next.bedId = 'This room has no vacant beds.';
      }
      if (effectiveSharing === 'SINGLE' && selectedRoom && countOccupiedBeds(selectedRoom) > 0) {
        next.sharingType = 'Single sharing needs an empty 2-bed room.';
      }
    }
    if (!form.monthlyRent || Number(form.monthlyRent) <= 0) {
      next.monthlyRent = 'Enter a valid monthly rent.';
    }
    if (form.deposit === '' || Number(form.deposit) < 0) {
      next.deposit = 'Enter deposit amount (0 if none).';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      roomNumber: Number(form.roomNumber),
      monthlyRent: Number(form.monthlyRent),
      deposit: Number(form.deposit) || 0,
      depositRefundable: form.depositRefundable !== false,
      sharingType: effectiveSharing,
      tripleMemberLimit: effectiveTripleLimit,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Name" error={errors.name}>
        <input
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          className={inputClass(errors.name)}
          placeholder="Resident full name"
          autoComplete="name"
        />
      </Field>

      <Field label="Phone Number" error={errors.phone}>
        <input
          value={form.phone}
          onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
          className={inputClass(errors.phone)}
          placeholder="10-digit mobile"
          inputMode="numeric"
        />
      </Field>

      <Field label="Joining Date" error={errors.joiningDate}>
        <input
          type="date"
          value={form.joiningDate}
          onChange={(e) => setField('joiningDate', e.target.value)}
          className={inputClass(errors.joiningDate)}
        />
      </Field>

      {lockAssignment ? (
        <div className="rounded-xl border border-nest-line bg-nest-soft px-3 py-3 text-sm">
          <p className="font-medium text-nest-navy">
            Room {form.roomNumber} · Bed {String(form.bedId).split('-').pop()}
          </p>
          <p className="mt-1 text-xs text-nest-muted">
            {effectiveSharing === 'SINGLE'
              ? 'Single sharing · both beds in this room'
              : 'Double sharing'}{' '}
            · use Transfer Room to change assignment.
          </p>
        </div>
      ) : (
        <>
          <Field label="Room" error={errors.roomNumber}>
            <select
              value={form.roomNumber}
              onChange={(e) => setField('roomNumber', e.target.value)}
              className={inputClass(errors.roomNumber)}
            >
              <option value="">Select room</option>
              {rooms.map((room) => {
                const vacant = getVacantBeds(room).length;
                const sharingHint =
                  room.type === 'TWO_BED' && canOfferSingleSharing(room)
                    ? ' · double or single'
                    : vacant === 1
                      ? ' · 1 bed vacant'
                      : vacant > 0
                        ? ` · ${vacant} vacant`
                        : '';
                return (
                  <option key={room.roomNumber} value={room.roomNumber} disabled={vacant === 0}>
                    {room.roomNumber} · {getRoomTypeLabel(room)}{sharingHint}
                  </option>
                );
              })}
            </select>
          </Field>

          {showTripleMemberChoice && (
            <Field label="Triple room — how many members?">
              <div className="grid grid-cols-2 gap-2">
                <SharingOption
                  selected={effectiveTripleLimit === TRIPLE_MEMBER_LIMIT_THREE}
                  title="Up to 3 members"
                  hint="Beds A, B, and C"
                  onClick={() => setField('tripleMemberLimit', TRIPLE_MEMBER_LIMIT_THREE)}
                />
                <SharingOption
                  selected={effectiveTripleLimit === TRIPLE_MEMBER_LIMIT_TWO}
                  title="2 members only"
                  hint="Bed C not used · full at 2"
                  onClick={() => setField('tripleMemberLimit', TRIPLE_MEMBER_LIMIT_TWO)}
                />
              </div>
              {effectiveTripleLimit === TRIPLE_MEMBER_LIMIT_TWO && (
                <p className="mt-1.5 text-xs text-nest-muted">
                  Only Bed A and Bed B are used. Bed C will not be assigned; the room is
                  <strong className="font-medium text-nest-navy"> full when 2 residents</strong> are in.
                </p>
              )}
            </Field>
          )}

          {showSharingChoice && (
            <Field label="How is this room given?" error={errors.sharingType}>
              <div className="grid grid-cols-2 gap-2">
                <SharingOption
                  selected={effectiveSharing === 'DOUBLE'}
                  title="Double sharing"
                  hint="One bed only · can add roommate"
                  onClick={() => setField('sharingType', 'DOUBLE')}
                />
                <SharingOption
                  selected={effectiveSharing === 'SINGLE'}
                  title="Single sharing"
                  hint="Both beds to this person"
                  onClick={() => setField('sharingType', 'SINGLE')}
                />
              </div>
              {effectiveSharing === 'SINGLE' && (
                <p className="mt-1.5 text-xs text-nest-muted">
                  Guest prefers the whole 2-bed room: Bed A and Bed B both go to this resident.
                  (For a 1-bed room, use …01 rooms such as 101, 201.)
                </p>
              )}
            </Field>
          )}

          {effectiveSharing === 'SINGLE' && selectedRoom?.type === 'TWO_BED' ? (
            <div className="rounded-xl border border-nest-line bg-nest-soft px-3 py-3 text-sm text-nest-navy">
              Beds: A and B (both assigned to this resident)
            </div>
          ) : (
            <Field label="Available Bed" error={errors.bedId}>
              <select
                value={form.bedId}
                onChange={(e) => setField('bedId', e.target.value)}
                className={inputClass(errors.bedId)}
                disabled={!selectedRoom}
              >
                <option value="">Select bed</option>
                {vacantBeds.map((bed) => (
                  <option key={bed.bedId} value={bed.bedId}>
                    Bed {bed.bedLabel} · Vacant
                  </option>
                ))}
              </select>
              {selectedRoom && vacantBeds.length === 0 && (
                <p className="mt-1 text-xs text-nest-amber">No vacant beds in this room.</p>
              )}
            </Field>
          )}
        </>
      )}

      <Field label="Monthly Rent (₹)" error={errors.monthlyRent}>
        <input
          type="number"
          min="1"
          value={form.monthlyRent}
          onChange={(e) => setField('monthlyRent', e.target.value)}
          className={inputClass(errors.monthlyRent)}
          inputMode="numeric"
        />
      </Field>

      <Field label="Deposit (₹)" error={errors.deposit}>
        <input
          type="number"
          min="0"
          value={form.deposit}
          onChange={(e) => setField('deposit', e.target.value)}
          className={inputClass(errors.deposit)}
          inputMode="numeric"
          placeholder="Security deposit"
        />
      </Field>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-nest-navy">
          Deposit refundable
        </span>
        <div className="grid grid-cols-2 gap-2">
          <SharingOption
            selected={form.depositRefundable !== false}
            title="Refundable"
            hint="Returned on leaving"
            onClick={() => setField('depositRefundable', true)}
          />
          <SharingOption
            selected={form.depositRefundable === false}
            title="Non-refundable"
            hint="Not returned"
            onClick={() => setField('depositRefundable', false)}
          />
        </div>
      </div>

      <Field label="Notes (optional)">
        <textarea
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
          className={`${inputClass()} min-h-[88px] resize-y`}
          placeholder="Any useful note"
        />
      </Field>

      <button
        type="submit"
        disabled={busy}
        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-nest-navy text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}

function SharingOption({ selected, title, hint, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-14 rounded-xl border px-3 py-2.5 text-left ${
        selected
          ? 'border-nest-navy bg-nest-navy text-white'
          : 'border-nest-line bg-white text-nest-navy'
      }`}
    >
      <span className="block text-sm font-semibold">{title}</span>
      <span className={`mt-0.5 block text-xs ${selected ? 'text-white/80' : 'text-nest-muted'}`}>
        {hint}
      </span>
    </button>
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

function inputClass(error) {
  return `w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-nest-navy outline-none transition focus:ring-2 focus:ring-nest-navy/10 ${
    error ? 'border-red-400' : 'border-nest-line focus:border-nest-navy/40'
  }`;
}
