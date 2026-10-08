import { useNavigate } from 'react-router-dom';
import {
  countRoomResidents,
  countVacantBeds,
  getAssignableCapacity,
  getRoomStatus,
  getRoomStatusLabel,
  getRoomTypeLabel,
  roomStatusClasses,
} from '../../utils/roomUtils';

export default function RoomCard({ room }) {
  const navigate = useNavigate();
  const occupied = countRoomResidents(room);
  const status = getRoomStatus(room);
  const styles = roomStatusClasses(status);
  const vacant = countVacantBeds(room);
  const capacity = getAssignableCapacity(room);

  return (
    <button
      type="button"
      onClick={() => navigate(`/rooms/${room.roomNumber}`)}
      className={`w-full rounded-xl border p-3 text-left transition active:scale-[0.99] ${styles.card}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-semibold tabular-nums text-nest-navy">
            {room.roomNumber}
          </p>
          <p className="mt-0.5 text-xs text-nest-muted">{getRoomTypeLabel(room)}</p>
        </div>
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${styles.badge}`}>
          {getRoomStatusLabel(status)}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium tabular-nums text-nest-navy">
        {occupied} / {capacity}
      </p>
      <p className="mt-0.5 text-xs text-nest-muted">
        {vacant === 0 ? 'No vacant beds' : vacant === 1 ? '1 vacant' : `${vacant} vacant`}
      </p>
    </button>
  );
}
