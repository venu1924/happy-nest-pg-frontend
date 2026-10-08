import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FloorRoomGrid from '../components/rooms/FloorRoomGrid';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { useRooms } from '../hooks/useRooms';
import { summarizeFloor } from '../utils/roomUtils';
import { floorOrdinal } from '../utils/formatters';
import { formatFloorSeriesLabel, formatRoomRangeForFloor } from '../data/buildingConfig';

export default function FloorView() {
  const { floorNumber } = useParams();
  const { getFloor, loading, error } = useRooms();
  const floor = getFloor(floorNumber);

  if (loading) return <LoadingState message="Loading floor..." />;
  if (error) return <ErrorState message={error} />;
  if (!floor) return <ErrorState message="Floor not found." />;

  const summary = summarizeFloor(floor.rooms);

  return (
    <div className="space-y-5 animate-floor-in">
      <Link
        to="/rooms"
        className="inline-flex min-h-10 items-center gap-1 text-sm text-nest-muted"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Building
      </Link>

      <header>
        <h1 className="font-display text-2xl font-semibold text-nest-navy">
          {formatFloorSeriesLabel(floor.floorNumber)}
        </h1>
        <p className="mt-1 text-sm text-nest-muted">
          {floorOrdinal(floor.floorNumber)} floor · Rooms {formatRoomRangeForFloor(floor.floorNumber)}{' '}
          · {summary.totalRooms} rooms · {summary.totalBeds} beds
        </p>
        <p className="mt-1 text-sm text-nest-muted">
          {summary.residents} residents · {summary.vacantBeds} vacant beds
        </p>
      </header>

      <FloorRoomGrid rooms={floor.rooms} />
    </div>
  );
}
