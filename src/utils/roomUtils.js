import {
  CAPACITY_BY_TYPE,
  ROOM_TYPE_LABELS,
  getRoomType,
  parseSequenceFromRoomNumber,
} from '../data/buildingConfig';

export function getRoomCapacity(room) {
  if (room?.capacity) return room.capacity;
  return CAPACITY_BY_TYPE[room?.type] ?? 0;
}

export function countOccupiedBeds(room) {
  return (room?.beds ?? []).filter((b) => b.status === 'OCCUPIED').length;
}

export function countVacantBeds(room) {
  return (room?.beds ?? []).filter((b) => b.status === 'VACANT').length;
}

export function countBlockedBeds(room) {
  return (room?.beds ?? []).filter((b) => b.status === 'BLOCKED').length;
}

export function countRoomResidents(room) {
  const ids = new Set(
    (room?.beds ?? [])
      .filter((b) => b.status === 'OCCUPIED' && b.residentId)
      .map((b) => b.residentId)
  );
  return ids.size;
}

export function getResidentBedLabels(room, residentId) {
  return (room?.beds ?? [])
    .filter((b) => b.residentId === residentId)
    .map((b) => b.bedLabel);
}

export function isSingleOccupancyRoom(room) {
  return room?.occupancyMode === 'SINGLE' || room?.type === 'SINGLE_BED';
}

/** Empty 2-bed rooms can be given as single sharing (both beds, one person). */
export function canOfferSingleSharing(room) {
  return room?.type === 'TWO_BED' && countOccupiedBeds(room) === 0 && countBlockedBeds(room) === 0;
}

/** Max residents allowed in this room (triple 2-only, 2-bed single mode, etc.) */
export function getMaxResidentsForRoom(room) {
  if (room?.type === 'THREE_BED' && room?.tripleMemberLimit === 2) return 2;
  if (room?.occupancyMode === 'SINGLE' && room?.type === 'TWO_BED') return 1;
  return getRoomCapacity(room);
}

/** Capacity that can actually be filled given current occupancy mode */
export function getAssignableCapacity(room) {
  return getMaxResidentsForRoom(room);
}

export function isTripleTwoMemberRoom(room) {
  return room?.type === 'THREE_BED' && room?.tripleMemberLimit === 2;
}

/** Empty triple room (…12) can be opted for 2 members only or up to 3 */
export function canChooseTripleMemberLimit(room) {
  return (
    room?.type === 'THREE_BED' &&
    countOccupiedBeds(room) === 0 &&
    countBlockedBeds(room) === 0
  );
}

/** FULL | PARTIAL | VACANT — derived from beds, never stored */
export function getRoomStatus(room) {
  const occupied = countOccupiedBeds(room);
  const vacantAssignable = countVacantBeds(room);
  const maxResidents = getMaxResidentsForRoom(room);

  if (occupied === 0 && vacantAssignable > 0) return 'VACANT';
  if (occupied >= maxResidents || vacantAssignable === 0) return 'FULL';
  return 'PARTIAL';
}

export function getRoomStatusLabel(status) {
  if (status === 'FULL') return 'Full';
  if (status === 'PARTIAL') return 'Partial';
  return 'Vacant';
}

export function getRoomTypeLabel(typeOrRoom) {
  const type =
    typeof typeOrRoom === 'string'
      ? typeOrRoom
      : typeOrRoom?.type ?? getRoomType(parseSequenceFromRoomNumber(typeOrRoom?.roomNumber));
  const base = ROOM_TYPE_LABELS[type] ?? type;
  if (typeof typeOrRoom === 'object' && typeOrRoom?.occupancyMode === 'SINGLE' && type === 'TWO_BED') {
    return '2-Bed · Single sharing';
  }
  return base;
}

export function getSharingLabel(sharingType) {
  if (sharingType === 'SINGLE') return 'Single sharing';
  if (sharingType === 'DOUBLE') return 'Double sharing';
  return null;
}

/** How beds appear on resident profile / list */
export function formatResidentBeds(resident, room) {
  const label = resident?.bedId?.split('-').pop() ?? '—';
  if (
    resident?.sharingType === 'SINGLE' &&
    room?.type === 'TWO_BED' &&
    room?.occupancyMode === 'SINGLE'
  ) {
    const labels = getResidentBedLabels(room, resident.id);
    if (labels.length >= 2) return `Beds ${labels.join(' & ')}`;
    return 'Beds A & B';
  }
  return `Bed ${label}`;
}

export function getVacantBeds(room) {
  return (room?.beds ?? []).filter((b) => b.status === 'VACANT');
}

export function findBed(room, bedId) {
  return (room?.beds ?? []).find((b) => b.bedId === bedId);
}

export function summarizeFloor(rooms) {
  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((sum, r) => sum + getRoomCapacity(r), 0);
  const residents = rooms.reduce((sum, r) => sum + countRoomResidents(r), 0);
  const vacantBeds = rooms.reduce((sum, r) => sum + countVacantBeds(r), 0);
  return { totalRooms, totalBeds, residents, vacantBeds };
}

export function summarizeBuilding(floors) {
  const allRooms = floors.flatMap((f) => f.rooms);
  const totalRooms = allRooms.length;
  const totalBeds = allRooms.reduce((sum, r) => sum + getRoomCapacity(r), 0);
  const residents = allRooms.reduce((sum, r) => sum + countRoomResidents(r), 0);
  const vacantBeds = allRooms.reduce((sum, r) => sum + countVacantBeds(r), 0);
  return {
    totalRooms,
    totalBeds,
    residents,
    vacantBeds,
  };
}

/** Tailwind-friendly status classes for room blocks */
export function roomStatusClasses(status) {
  if (status === 'FULL') {
    return {
      card: 'border-nest-green/40 bg-nest-greenSoft/60',
      badge: 'bg-nest-green text-white',
      dot: 'bg-nest-green',
    };
  }
  if (status === 'PARTIAL') {
    return {
      card: 'border-nest-amber/40 bg-nest-amberSoft/70',
      badge: 'bg-nest-amber text-white',
      dot: 'bg-nest-amber',
    };
  }
  return {
    card: 'border-nest-line bg-white',
    badge: 'bg-slate-200 text-slate-700',
    dot: 'bg-slate-300',
  };
}
