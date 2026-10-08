import BuildingView from '../components/rooms/BuildingView';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { useRooms } from '../hooks/useRooms';

export default function Rooms() {
  const { floorSummaries, buildingSummary, loading, error } = useRooms();

  if (loading) return <LoadingState message="Loading building..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-5">
      <header className="text-center sm:text-left">
        <h1 className="font-display text-2xl font-semibold text-nest-navy">Rooms</h1>
        <p className="mt-1 text-sm text-nest-muted">
          {buildingSummary.totalRooms} rooms · {buildingSummary.residents} residents ·{' '}
          {buildingSummary.vacantBeds} vacant beds
        </p>
        <p className="mt-2 text-sm text-nest-navy/80">Tap a floor to enter</p>
      </header>

      <BuildingView floorSummaries={floorSummaries} />
    </div>
  );
}
