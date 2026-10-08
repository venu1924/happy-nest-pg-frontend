import RoomCard from './RoomCard';

/**
 * Two-column corridor layout:
 * Left  = first 6 rooms (e.g. 101–106)
 * Right = last 6 rooms (e.g. 107–112)
 */
export default function FloorRoomGrid({ rooms }) {
  const sorted = [...rooms].sort((a, b) => a.roomNumber - b.roomNumber);
  const left = sorted.slice(0, 6);
  const right = sorted.slice(6, 12);

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-nest-line"
        aria-hidden
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-3">
          <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-nest-muted">
            Left
          </p>
          {left.map((room) => (
            <RoomCard key={room.roomNumber} room={room} />
          ))}
        </div>
        <div className="space-y-3">
          <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-nest-muted">
            Right
          </p>
          {right.map((room) => (
            <RoomCard key={room.roomNumber} room={room} />
          ))}
        </div>
      </div>
    </div>
  );
}
