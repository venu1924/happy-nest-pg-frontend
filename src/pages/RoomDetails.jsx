import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BedCard from '../components/rooms/BedCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import StatusBadge from '../components/common/StatusBadge';
import { useRooms } from '../hooks/useRooms';
import { useApp } from '../context/AppContext';
import {
  countRoomResidents,
  countVacantBeds,
  getAssignableCapacity,
  getRoomStatus,
  getRoomStatusLabel,
  getRoomTypeLabel,
  isTripleTwoMemberRoom,
} from '../utils/roomUtils';

export default function RoomDetails() {
  const { roomNumber } = useParams();
  const { getRoom, loading, error } = useRooms();
  const { residents, temporaryResidents } = useApp();
  const room = getRoom(roomNumber);

  if (loading) return <LoadingState message="Loading room..." />;
  if (error) return <ErrorState message={error} />;
  if (!room) return <ErrorState message="Room not found." />;

  const occupied = countRoomResidents(room);
  const vacant = countVacantBeds(room);
  const capacity = getAssignableCapacity(room);
  const status = getRoomStatus(room);
  const singleSharingTwoBed = room.occupancyMode === 'SINGLE' && room.type === 'TWO_BED';

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link
        to={`/rooms/floor/${room.floorNumber}`}
        className="inline-flex min-h-10 items-center gap-1 text-sm text-nest-muted"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Floor {room.floorNumber}
      </Link>

      <header className="rounded-2xl border border-nest-line bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-nest-navy">
              Room {room.roomNumber}
            </h1>
            <p className="mt-1 text-sm text-nest-muted">{getRoomTypeLabel(room)}</p>
          </div>
          <StatusBadge status={status}>{getRoomStatusLabel(status)}</StatusBadge>
        </div>
        <p className="mt-4 text-sm font-medium tabular-nums text-nest-navy">
          {occupied} / {capacity} residents
        </p>
        <p className="mt-0.5 text-sm text-nest-muted">
          {vacant === 0 ? 'No vacant beds' : vacant === 1 ? '1 vacant bed' : `${vacant} vacant beds`}
        </p>
        {room.type === 'SINGLE_BED' && (
          <p className="mt-2 text-sm text-nest-muted">
            Single room — one bed only (e.g. room …01 in each series).
          </p>
        )}
        {singleSharingTwoBed && (
          <p className="mt-2 text-sm text-nest-muted">
            Double-sharing room given as single sharing — both beds to one resident.
          </p>
        )}
        {room.type === 'THREE_BED' && !isTripleTwoMemberRoom(room) && (
          <p className="mt-2 text-sm text-nest-muted">
            Triple sharing — up to 3 residents (Beds A, B, C).
          </p>
        )}
        {isTripleTwoMemberRoom(room) && (
          <p className="mt-2 text-sm text-nest-muted">
            Opted for <strong>2 members only</strong> — Bed C is not used. Room is full when
            2 residents are staying.
          </p>
        )}
        {room.type === 'TWO_BED' && room.occupancyMode === 'TRIPLE' && (
          <p className="mt-2 text-sm text-nest-muted">
            This double room is being used as triple sharing — up to 3 people.
          </p>
        )}
        {room.type === 'TWO_BED' && occupied === 0 && vacant > 0 && (
          <div className="mt-3">
            <p className="text-sm text-nest-muted">
              This room can be double sharing, triple sharing (3 people), or single sharing
              (both beds to one person).
            </p>
            <Link
              to={`/residents/new?room=${room.roomNumber}&bed=${room.beds[0]?.bedId}&sharing=SINGLE`}
              className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-nest-line bg-white px-3 py-2 text-sm font-semibold text-nest-navy"
            >
              Assign as single sharing (both beds)
            </Link>
          </div>
        )}
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-base font-semibold text-nest-navy">Beds</h2>
        {room.beds.map((bed) => {
          const resident = residents.find((r) => r.id === bed.residentId);
          const temporary = (temporaryResidents || []).find((t) => t.id === bed.residentId);
          return (
            <BedCard
              key={bed.bedId}
              bed={bed}
              resident={resident}
              temporary={temporary}
              roomNumber={room.roomNumber}
              singleSharingTwoBed={singleSharingTwoBed}
              tripleTwoMember={isTripleTwoMemberRoom(room)}
            />
          );
        })}
      </section>
    </div>
  );
}
