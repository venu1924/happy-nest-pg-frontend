import { getRoomStatus, roomHasTemporary, roomStatusClasses } from '../../utils/roomUtils';
import { formatFloorSeriesLabel, formatRoomRangeForFloor } from '../../data/buildingConfig';

/**
 * Single floor strip inside the building visualization.
 */
export default function FloorBlock({
  floorNumber,
  rooms,
  residents,
  vacantBeds,
  totalRooms,
  selected,
  fading,
  onSelect,
}) {
  const statusDots = rooms.map((room) => getRoomStatus(room));

  return (
    <button
      type="button"
      onClick={() => onSelect(floorNumber)}
      className={`group relative w-full overflow-hidden border-x border-nest-navy/20 bg-gradient-to-b from-white to-slate-50 px-4 py-4 text-left transition-all duration-floor sm:px-5 sm:py-5 ${
        selected
          ? 'z-10 scale-[1.03] border-nest-navy/40 shadow-soft'
          : fading
            ? 'scale-95 opacity-0'
            : 'hover:bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-nest-navy sm:text-xl">
            {formatFloorSeriesLabel(floorNumber)}
          </p>
          <p className="mt-0.5 text-xs text-nest-muted sm:text-sm">
            Floor {floorNumber} · Rooms {formatRoomRangeForFloor(floorNumber)} · {totalRooms} rooms
          </p>
        </div>
        <div className="text-right text-xs sm:text-sm">
          <p className="font-medium tabular-nums text-nest-navy">{residents} residents</p>
          <p className="mt-0.5 text-nest-muted tabular-nums">{vacantBeds} vacant beds</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1" aria-hidden>
        {statusDots.map((status, idx) => (
          <span
            key={`${floorNumber}-${idx}`}
            className={`h-2 w-2 rounded-sm ${
              roomHasTemporary(rooms[idx]) ? 'bg-blue-600' : roomStatusClasses(status).dot
            }`}
            title={status}
          />
        ))}
      </div>
    </button>
  );
}
