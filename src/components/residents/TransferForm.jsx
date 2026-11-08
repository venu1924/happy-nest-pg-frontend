import { useEffect, useMemo, useState } from 'react';
import {
  getVacantBeds,
  getRoomTypeLabel,
  canOfferSingleSharing,
  canOfferTripleOnTwoBed,
  canChooseTripleMemberLimit,
  countOccupiedBeds,
  bedsForAssignment,
} from '../../utils/roomUtils';
import { TRIPLE_MEMBER_LIMIT_TWO, TRIPLE_MEMBER_LIMIT_THREE } from '../../data/buildingConfig';

export default function TransferForm({
  resident,
  floors,
  onSubmit,
  busy = false,
}) {
  const [floorNumber, setFloorNumber] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [bedId, setBedId] = useState('');
  const [sharingType, setSharingType] = useState('DOUBLE');
  const [tripleMemberLimit, setTripleMemberLimit] = useState(TRIPLE_MEMBER_LIMIT_THREE);
  const [transferDate, setTransferDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  const floor = useMemo(
    () => floors.find((f) => String(f.floorNumber) === String(floorNumber)),
    [floors, floorNumber]
  );

  const rooms = useMemo(() => {
    if (!floor) return [];
    return floor.rooms.filter(
      (r) =>
        getVacantBeds(r).length > 0 ||
        (canOfferTripleOnTwoBed(r) && countOccupiedBeds(r) >= 2)
    );
  }, [floor]);

  const selectedRoom = useMemo(
    () => rooms.find((r) => String(r.roomNumber) === String(roomNumber)),
    [rooms, roomNumber]
  );

  const offerSingle = selectedRoom && canOfferSingleSharing(selectedRoom);
  const offerTriple =
    selectedRoom &&
    canOfferTripleOnTwoBed(selectedRoom) &&
    selectedRoom.occupancyMode !== 'TRIPLE';
  const showSharingChoice = Boolean(offerSingle || offerTriple);
  const showTripleMemberChoice =
    selectedRoom && canChooseTripleMemberLimit(selectedRoom);
  const effectiveTripleLimit = showTripleMemberChoice
    ? tripleMemberLimit === TRIPLE_MEMBER_LIMIT_TWO
      ? TRIPLE_MEMBER_LIMIT_TWO
      : TRIPLE_MEMBER_LIMIT_THREE
    : selectedRoom?.type === 'THREE_BED'
      ? selectedRoom.tripleMemberLimit ?? TRIPLE_MEMBER_LIMIT_THREE
      : null;

  const effectiveSharing = selectedRoom?.type === 'SINGLE_BED'
    ? 'SINGLE'
    : selectedRoom?.type === 'TWO_BED' && selectedRoom?.occupancyMode === 'TRIPLE'
      ? 'TRIPLE'
      : showSharingChoice
        ? sharingType === 'SINGLE' && offerSingle
          ? 'SINGLE'
          : sharingType === 'TRIPLE' && offerTriple
            ? 'TRIPLE'
            : 'DOUBLE'
        : selectedRoom?.type === 'THREE_BED'
          ? 'TRIPLE'
          : 'DOUBLE';

  const vacantBeds = useMemo(
    () => (selectedRoom ? bedsForAssignment(selectedRoom, effectiveSharing) : []),
    [selectedRoom, effectiveSharing]
  );

  useEffect(() => {
    if (effectiveSharing === 'SINGLE' && vacantBeds[0]) {
      setBedId(vacantBeds[0].bedId);
    }
  }, [effectiveSharing, vacantBeds]);

  const validate = () => {
    const next = {};
    if (!floorNumber) next.floorNumber = 'Select a floor.';
    if (!roomNumber) next.roomNumber = 'Select a room with a vacant bed.';
    if (!bedId) next.bedId = 'Please select an available bed.';
    if (!transferDate) next.transferDate = 'Transfer date is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      toRoomNumber: Number(roomNumber),
      toBedId: bedId,
      sharingType: effectiveSharing,
      tripleMemberLimit: effectiveTripleLimit,
      transferDate,
      note,
    });
  };

  const bedLabel = resident.bedId?.split('-').pop();

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="rounded-2xl border border-nest-line bg-white p-4 shadow-soft">
        <p className="font-medium text-nest-navy">{resident.name}</p>
        <p className="mt-1 text-sm text-nest-muted">
          Current: Room {resident.roomNumber} · Bed {bedLabel}
          {resident.sharingType === 'SINGLE' ? ' · Single sharing' : ''}
        </p>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">New floor</span>
        <select
          value={floorNumber}
          onChange={(e) => {
            setFloorNumber(e.target.value);
            setRoomNumber('');
            setBedId('');
          }}
          className={selectClass(errors.floorNumber)}
        >
          <option value="">Select floor</option>
          {floors.map((f) => (
            <option key={f.floorNumber} value={f.floorNumber}>
              Floor {f.floorNumber}
            </option>
          ))}
        </select>
        {errors.floorNumber && <ErrorText>{errors.floorNumber}</ErrorText>}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">New room</span>
        <select
          value={roomNumber}
          onChange={(e) => {
            setRoomNumber(e.target.value);
            setBedId('');
            setSharingType('DOUBLE');
            setTripleMemberLimit(TRIPLE_MEMBER_LIMIT_THREE);
          }}
          className={selectClass(errors.roomNumber)}
          disabled={!floorNumber}
        >
          <option value="">Select room</option>
          {rooms.map((room) => (
            <option key={room.roomNumber} value={room.roomNumber}>
              {room.roomNumber} · {getRoomTypeLabel(room)} · {getVacantBeds(room).length} vacant
            </option>
          ))}
        </select>
        {errors.roomNumber && <ErrorText>{errors.roomNumber}</ErrorText>}
      </label>

      {showTripleMemberChoice && (
        <div>
          <span className="mb-1.5 block text-sm font-medium">Triple room — how many members?</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTripleMemberLimit(TRIPLE_MEMBER_LIMIT_THREE)}
              className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-semibold ${
                effectiveTripleLimit === TRIPLE_MEMBER_LIMIT_THREE
                  ? 'border-nest-navy bg-nest-navy text-white'
                  : 'border-nest-line bg-white text-nest-navy'
              }`}
            >
              Up to 3
            </button>
            <button
              type="button"
              onClick={() => setTripleMemberLimit(TRIPLE_MEMBER_LIMIT_TWO)}
              className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-semibold ${
                effectiveTripleLimit === TRIPLE_MEMBER_LIMIT_TWO
                  ? 'border-nest-navy bg-nest-navy text-white'
                  : 'border-nest-line bg-white text-nest-navy'
              }`}
            >
              2 only (Bed C unused)
            </button>
          </div>
        </div>
      )}

      {showSharingChoice && (
        <div>
          <span className="mb-1.5 block text-sm font-medium">Sharing in new room</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setSharingType('DOUBLE')}
              className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-semibold ${
                effectiveSharing === 'DOUBLE'
                  ? 'border-nest-navy bg-nest-navy text-white'
                  : 'border-nest-line bg-white text-nest-navy'
              }`}
            >
              Double sharing
            </button>
            {offerTriple && (
              <button
                type="button"
                onClick={() => setSharingType('TRIPLE')}
                className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-semibold ${
                  effectiveSharing === 'TRIPLE'
                    ? 'border-nest-navy bg-nest-navy text-white'
                    : 'border-nest-line bg-white text-nest-navy'
                }`}
              >
                Triple sharing
              </button>
            )}
            {offerSingle && (
              <button
                type="button"
                onClick={() => setSharingType('SINGLE')}
                className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-semibold ${
                  effectiveSharing === 'SINGLE'
                    ? 'border-nest-navy bg-nest-navy text-white'
                    : 'border-nest-line bg-white text-nest-navy'
                }`}
              >
                Single sharing
              </button>
            )}
          </div>
          {effectiveSharing === 'SINGLE' && (
            <p className="mt-1.5 text-xs text-nest-muted">
              Both beds in this room go to this resident (no roommate).
            </p>
          )}
        </div>
      )}

      {effectiveTripleLimit === TRIPLE_MEMBER_LIMIT_TWO && selectedRoom?.type === 'THREE_BED' ? (
        <div className="rounded-xl border border-nest-line bg-nest-soft px-3 py-3 text-sm text-nest-navy">
          Beds A and B only — Bed C not used; room full at 2 residents
        </div>
      ) : effectiveSharing === 'SINGLE' && selectedRoom?.type === 'TWO_BED' ? (
        <div className="rounded-xl border border-nest-line bg-nest-soft px-3 py-3 text-sm text-nest-navy">
          Beds A and B — both assigned to this resident
        </div>
      ) : (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Available bed</span>
          <select
            value={bedId}
            onChange={(e) => setBedId(e.target.value)}
            className={selectClass(errors.bedId)}
            disabled={!selectedRoom}
          >
            <option value="">Select bed</option>
            {vacantBeds.map((bed) => (
              <option key={bed.bedId} value={bed.bedId}>
                Bed {bed.bedLabel} · Vacant
              </option>
            ))}
          </select>
          {errors.bedId && <ErrorText>{errors.bedId}</ErrorText>}
        </label>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Transfer date</span>
        <input
          type="date"
          value={transferDate}
          onChange={(e) => setTransferDate(e.target.value)}
          className={selectClass(errors.transferDate)}
        />
        {errors.transferDate && <ErrorText>{errors.transferDate}</ErrorText>}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Note (optional)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`${selectClass()} min-h-[80px] resize-y`}
          placeholder="Reason for transfer"
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-nest-navy text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? 'Transferring...' : 'Confirm Transfer'}
      </button>
    </form>
  );
}

function selectClass(error) {
  return `w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-nest-navy/10 ${
    error ? 'border-red-400' : 'border-nest-line focus:border-nest-navy/40'
  }`;
}

function ErrorText({ children }) {
  return <span className="mt-1 block text-xs text-red-600">{children}</span>;
}
