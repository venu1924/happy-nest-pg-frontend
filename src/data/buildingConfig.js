/**
 * Central building configuration.
 * All floors/rooms/beds are derived from this — do not hard-code counts in UI.
 */

/** Physical floors 1–5 → room numbers 101–112 … 501–512 (100–500 series) */
export const FLOOR_NUMBERS = [1, 2, 3, 4, 5];

export const ROOMS_PER_FLOOR = 12;

/**
 * Per floor (e.g. 101–112):
 * x01 = single (1 bed only)
 * x02–x11 = double-sharing rooms (2 beds each)
 * x12 = triple sharing (3 beds; can be used for 2 or 3 residents)
 */
export const ROOM_TYPE_BY_SEQUENCE = {
  1: 'SINGLE_BED',
  2: 'TWO_BED',
  3: 'TWO_BED',
  4: 'TWO_BED',
  5: 'TWO_BED',
  6: 'TWO_BED',
  7: 'TWO_BED',
  8: 'TWO_BED',
  9: 'TWO_BED',
  10: 'TWO_BED',
  11: 'TWO_BED',
  12: 'THREE_BED',
};

export const CAPACITY_BY_TYPE = {
  TWO_BED: 2,
  THREE_BED: 3,
  SINGLE_BED: 1,
};

export const BED_LABELS = ['A', 'B', 'C'];

export const ROOM_TYPE_LABELS = {
  TWO_BED: '2-Bed · Double sharing',
  THREE_BED: '3-Bed · Triple sharing',
  SINGLE_BED: 'Single · 1 bed',
};

export const DEFAULT_MONTHLY_RENT = {
  TWO_BED: 9000,
  TWO_BED_AS_SINGLE: 12000,
  THREE_BED: 8000,
  SINGLE_BED: 12000,
};

/** How a TWO_BED room is currently used */
export const OCCUPANCY_DOUBLE = 'DOUBLE';
export const OCCUPANCY_SINGLE = 'SINGLE';

/** Triple room (…12): max residents when opted for 2-only vs up to 3 */
export const TRIPLE_MEMBER_LIMIT_TWO = 2;
export const TRIPLE_MEMBER_LIMIT_THREE = 3;

export const SHARING_LABELS = {
  DOUBLE: 'Double sharing',
  SINGLE: 'Single sharing',
};

export function defaultRentForAssignment(roomType, sharingType) {
  if (roomType === 'TWO_BED' && sharingType === 'SINGLE') {
    return DEFAULT_MONTHLY_RENT.TWO_BED_AS_SINGLE;
  }
  return DEFAULT_MONTHLY_RENT[roomType] ?? 0;
}

export function getRoomType(sequence) {
  return ROOM_TYPE_BY_SEQUENCE[sequence];
}

export function getFloorSeries(floorNumber) {
  return Number(floorNumber) * 100;
}

export function formatFloorSeriesLabel(floorNumber) {
  return `${getFloorSeries(floorNumber)} series`;
}

export function formatRoomRangeForFloor(floorNumber) {
  const series = getFloorSeries(floorNumber);
  return `${series + 1}–${series + ROOMS_PER_FLOOR}`;
}

export function getRoomNumber(floorNumber, sequence) {
  return floorNumber * 100 + sequence;
}

export function parseFloorFromRoomNumber(roomNumber) {
  return Math.floor(Number(roomNumber) / 100);
}

export function parseSequenceFromRoomNumber(roomNumber) {
  return Number(roomNumber) % 100;
}
