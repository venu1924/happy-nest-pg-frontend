import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { summarizeFloor, summarizeBuilding } from '../utils/roomUtils';

export function useRooms() {
  const { floors, loading, error } = useApp();

  const buildingSummary = useMemo(() => summarizeBuilding(floors), [floors]);

  const getFloor = (floorNumber) =>
    floors.find((f) => f.floorNumber === Number(floorNumber)) ?? null;

  const getRoom = (roomNumber) => {
    const num = Number(roomNumber);
    for (const floor of floors) {
      const room = floor.rooms.find((r) => r.roomNumber === num);
      if (room) return room;
    }
    return null;
  };

  const floorSummaries = useMemo(
    () =>
      floors.map((floor) => ({
        floorNumber: floor.floorNumber,
        ...summarizeFloor(floor.rooms),
        rooms: floor.rooms,
      })),
    [floors]
  );

  return {
    floors,
    floorSummaries,
    buildingSummary,
    getFloor,
    getRoom,
    loading,
    error,
  };
}
