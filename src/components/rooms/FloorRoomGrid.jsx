import RoomCard from './RoomCard';

/**
 * Physical corridor layout (same pattern on every floor).
 * Example for 400 series:
 *
 *  403          404
 *  402          405
 *  401          406
 *  Sofa space   407
 *               408
 *  412          409
 *  411          410
 */
const LAYOUT_ROWS = [
  { left: 3, right: 4 },
  { left: 2, right: 5 },
  { left: 1, right: 6 },
  { left: 'sofa', right: 7 },
  { left: null, right: 8 },
  { left: 12, right: 9 },
  { left: 11, right: 10 },
];

function roomBySuffix(roomsBySuffix, suffix) {
  if (typeof suffix !== 'number') return null;
  return roomsBySuffix.get(suffix) ?? null;
}

function SofaSpace() {
  return (
    <div
      className="flex min-h-[5.5rem] items-center justify-center rounded-xl border border-dashed border-nest-line bg-nest-soft/80 px-3 py-3 text-center"
      aria-label="Sofa space"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-nest-muted">
        Sofa
        <br />
        space
      </p>
    </div>
  );
}

function EmptySlot() {
  return <div className="min-h-[5.5rem]" aria-hidden />;
}

function Cell({ slot, roomsBySuffix }) {
  if (slot === 'sofa') return <SofaSpace />;
  if (slot == null) return <EmptySlot />;
  const room = roomBySuffix(roomsBySuffix, slot);
  if (!room) return <EmptySlot />;
  return <RoomCard room={room} />;
}

export default function FloorRoomGrid({ rooms }) {
  const roomsBySuffix = new Map(
    (rooms || []).map((room) => [room.roomNumber % 100, room])
  );

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-nest-line"
        aria-hidden
      />
      <div className="mb-2 grid grid-cols-2 gap-3 sm:gap-4">
        <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-nest-muted">
          Left
        </p>
        <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-nest-muted">
          Right
        </p>
      </div>
      <div className="space-y-3">
        {LAYOUT_ROWS.map((row, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-3 sm:gap-4">
            <Cell slot={row.left} roomsBySuffix={roomsBySuffix} />
            <Cell slot={row.right} roomsBySuffix={roomsBySuffix} />
          </div>
        ))}
      </div>
    </div>
  );
}
