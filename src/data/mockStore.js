import { generateMockData } from './generateMockData';
import { getCurrentMonthYear } from '../utils/formatters';
import {
  OCCUPANCY_DOUBLE,
  OCCUPANCY_SINGLE,
  TRIPLE_MEMBER_LIMIT_TWO,
  TRIPLE_MEMBER_LIMIT_THREE,
} from './buildingConfig';

/**
 * In-memory mock database for Phase 1.
 * Services mutate this store so UI actions (add, transfer, mark paid) work immediately.
 * Replace service implementations with Axios later — keep this file for local demos.
 */

const current = getCurrentMonthYear();

const MOCK_EMPTY = String(import.meta.env.VITE_MOCK_EMPTY ?? 'true') === 'true';

function createInitialStore() {
  return generateMockData({
    month: current.month,
    year: current.year,
    seed: 42,
    emptyDataset: MOCK_EMPTY,
  });
}

let store = createInitialStore();

let listeners = [];

function notify() {
  listeners.forEach((fn) => fn(getSnapshot()));
}

export function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getSnapshot() {
  return store;
}

export function resetMockStore() {
  store = createInitialStore();
  notify();
  return store;
}

function findRoom(roomNumber) {
  const num = Number(roomNumber);
  for (const floor of store.floors) {
    const room = floor.rooms.find((r) => r.roomNumber === num);
    if (room) return room;
  }
  return null;
}

function defaultSharingType(room, requested) {
  if (requested === 'SINGLE' || requested === 'DOUBLE') return requested;
  if (room.type === 'SINGLE_BED') return 'SINGLE';
  if (room.type === 'TWO_BED') return 'DOUBLE';
  return null;
}

function blockTripleThirdBed(room) {
  const bedC = room.beds.find((b) => b.bedLabel === 'C');
  if (bedC && bedC.status !== 'OCCUPIED') {
    bedC.status = 'BLOCKED';
    bedC.residentId = null;
  }
}

function releaseTripleTwoMemberMode(room) {
  if (room.type !== 'THREE_BED') return;
  const occupied = room.beds.filter((b) => b.status === 'OCCUPIED').length;
  if (occupied > 0) return;
  room.tripleMemberLimit = TRIPLE_MEMBER_LIMIT_THREE;
  room.beds.forEach((b) => {
    if (b.status === 'BLOCKED') {
      b.status = 'VACANT';
      b.residentId = null;
    }
  });
}

function occupyBed(room, bed, residentId, sharingType, tripleMemberLimit) {
  if (room.type === 'THREE_BED') {
    const limit = tripleMemberLimit ?? room.tripleMemberLimit ?? TRIPLE_MEMBER_LIMIT_THREE;
    room.tripleMemberLimit = limit;
    if (limit === TRIPLE_MEMBER_LIMIT_TWO) {
      blockTripleThirdBed(room);
    }
    if (bed.status === 'BLOCKED') {
      throw new Error('This bed is not used — room is set for 2 members only.');
    }
    if (bed.bedLabel === 'C' && limit === TRIPLE_MEMBER_LIMIT_TWO) {
      throw new Error('Bed C is not used when triple room is for 2 members only.');
    }
    const occupiedBefore = room.beds.filter((b) => b.status === 'OCCUPIED').length;
    if (limit === TRIPLE_MEMBER_LIMIT_TWO && occupiedBefore >= 2) {
      throw new Error('This triple room is full (2-member option).');
    }
    bed.status = 'OCCUPIED';
    bed.residentId = residentId;
    return;
  }

  if (room.type === 'TWO_BED' && sharingType === 'SINGLE') {
    const alreadyOccupied = room.beds.some((b) => b.status === 'OCCUPIED');
    if (alreadyOccupied) {
      throw new Error('Room already has a resident. Single sharing needs the whole room empty.');
    }
    room.occupancyMode = OCCUPANCY_SINGLE;
    room.beds.forEach((b) => {
      b.status = 'OCCUPIED';
      b.residentId = residentId;
    });
    return;
  }

  if (bed.status === 'OCCUPIED') throw new Error('Selected bed is already occupied.');

  bed.status = 'OCCUPIED';
  bed.residentId = residentId;

  if (room.type === 'TWO_BED') {
    room.occupancyMode = OCCUPANCY_DOUBLE;
  } else if (room.type === 'SINGLE_BED') {
    room.occupancyMode = OCCUPANCY_SINGLE;
  }
}

function vacateBed(room, bedId) {
  const bed = room.beds.find((b) => b.bedId === bedId);
  const residentId = bed?.residentId;
  const wasSingle = room.occupancyMode === 'SINGLE' && room.type === 'TWO_BED';

  if (wasSingle) {
    room.beds.forEach((b) => {
      if (!residentId || b.residentId === residentId) {
        b.status = 'VACANT';
        b.residentId = null;
      }
    });
    room.occupancyMode = OCCUPANCY_DOUBLE;
    return;
  }

  if (bed) {
    bed.status = 'VACANT';
    bed.residentId = null;
  }
  releaseTripleTwoMemberMode(room);
}

export function mockGetFloors() {
  return structuredClone(store.floors);
}

export function mockGetFloor(floorNumber) {
  const floor = store.floors.find((f) => f.floorNumber === Number(floorNumber));
  return floor ? structuredClone(floor) : null;
}

export function mockGetRoom(roomNumber) {
  const room = findRoom(roomNumber);
  return room ? structuredClone(room) : null;
}

export function mockGetResidents() {
  return structuredClone(store.residents);
}

export function mockGetResident(id) {
  const resident = store.residents.find((r) => r.id === id);
  return resident ? structuredClone(resident) : null;
}

export function mockAddResident(payload) {
  const room = findRoom(payload.roomNumber);
  if (!room) throw new Error('Room not found.');

  const bed = room.beds.find((b) => b.bedId === payload.bedId);
  if (!bed) throw new Error('Bed not found.');

  const sharingType = defaultSharingType(room, payload.sharingType);
  const id = `res-${String(store.residents.length + 1).padStart(3, '0')}-${Date.now().toString(36)}`;
  const tripleMemberLimit =
    room.type === 'THREE_BED'
      ? Number(payload.tripleMemberLimit) || room.tripleMemberLimit || TRIPLE_MEMBER_LIMIT_THREE
      : undefined;
  occupyBed(room, bed, id, sharingType, tripleMemberLimit);

  const resident = {
    id,
    name: payload.name.trim(),
    phone: String(payload.phone).replace(/\s/g, ''),
    joiningDate: payload.joiningDate,
    roomNumber: Number(payload.roomNumber),
    bedId: payload.bedId,
    monthlyRent: Number(payload.monthlyRent),
    deposit: Number(payload.deposit) || 0,
    depositRefundable: payload.depositRefundable !== false,
    sharingType,
    notes: payload.notes?.trim() ?? '',
  };

  store.residents.push(resident);

  const { month, year } = getCurrentMonthYear();
  store.payments.push({
    id: `pay-${id}-${year}-${month}`,
    residentId: id,
    month,
    year,
    amount: resident.monthlyRent,
    status: 'PENDING',
    paymentMethod: null,
    paidDate: null,
    receivedBy: null,
  });

  notify();
  return structuredClone(resident);
}

export function mockUpdateResident(id, updates) {
  const resident = store.residents.find((r) => r.id === id);
  if (!resident) throw new Error('Resident not found.');

  if (updates.name != null) resident.name = updates.name.trim();
  if (updates.phone != null) resident.phone = String(updates.phone).replace(/\s/g, '');
  if (updates.joiningDate != null) resident.joiningDate = updates.joiningDate;
  if (updates.monthlyRent != null) resident.monthlyRent = Number(updates.monthlyRent);
  if (updates.deposit != null) resident.deposit = Number(updates.deposit) || 0;
  if (updates.depositRefundable != null) {
    resident.depositRefundable = updates.depositRefundable !== false;
  }
  if (updates.notes != null) resident.notes = updates.notes;

  notify();
  return structuredClone(resident);
}

export function mockDeleteResident(id, payload = {}) {
  const index = store.residents.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Resident not found.');

  const resident = store.residents[index];
  const room = findRoom(resident.roomNumber);
  if (room) vacateBed(room, resident.bedId);

  const deletionReason = payload.notes?.trim() ?? '';

  if (!store.pastResidents) store.pastResidents = [];
  store.pastResidents.unshift({
    id: resident.id,
    name: resident.name,
    phone: resident.phone,
    joiningDate: resident.joiningDate,
    checkoutDate: new Date().toISOString().slice(0, 10),
    lastRoomNumber: resident.roomNumber,
    lastBedId: resident.bedId,
    monthlyRent: resident.monthlyRent,
    deposit: resident.deposit ?? 0,
    depositRefundable: resident.depositRefundable !== false,
    sharingType: resident.sharingType ?? null,
    notes: resident.notes ?? '',
    deletionReason,
  });

  store.residents.splice(index, 1);
  store.payments = store.payments.filter((p) => p.residentId !== id);

  notify();
  return { id };
}

export function mockGetPastResidents() {
  return structuredClone(store.pastResidents ?? []);
}

export function mockTransferResident(id, payload) {
  const resident = store.residents.find((r) => r.id === id);
  if (!resident) throw new Error('Resident not found.');

  const fromRoom = findRoom(resident.roomNumber);
  const toRoom = findRoom(payload.toRoomNumber);
  if (!toRoom) throw new Error('Destination room not found.');

  const toBed = toRoom.beds.find((b) => b.bedId === payload.toBedId);
  if (!toBed) throw new Error('Destination bed not found.');

  const sharingType = defaultSharingType(toRoom, payload.sharingType);
  const fromBedId = resident.bedId;
  const fromRoomNumber = resident.roomNumber;

  const tripleMemberLimit =
    toRoom.type === 'THREE_BED'
      ? Number(payload.tripleMemberLimit) || toRoom.tripleMemberLimit || TRIPLE_MEMBER_LIMIT_THREE
      : undefined;
  occupyBed(toRoom, toBed, id, sharingType, tripleMemberLimit);
  if (fromRoom) vacateBed(fromRoom, fromBedId);

  resident.roomNumber = Number(payload.toRoomNumber);
  resident.bedId = payload.toBedId;
  resident.sharingType = sharingType;

  const transfer = {
    id: `tr-${Date.now()}`,
    residentId: id,
    fromRoomNumber,
    fromBedId,
    toRoomNumber: resident.roomNumber,
    toBedId: resident.bedId,
    transferDate: payload.transferDate || new Date().toISOString().slice(0, 10),
    note: payload.note?.trim() ?? '',
  };
  store.transfers.unshift(transfer);

  notify();
  return structuredClone({ resident, transfer });
}

export function mockGetPayments({ month, year } = {}) {
  const m = month ?? getCurrentMonthYear().month;
  const y = year ?? getCurrentMonthYear().year;
  const list = store.payments
    .filter((p) => p.month === Number(m) && p.year === Number(y))
    .map((p) => {
      const resident = store.residents.find((r) => r.id === p.residentId);
      return {
        ...p,
        residentName: resident?.name ?? 'Unknown',
        roomNumber: resident?.roomNumber ?? null,
        phone: resident?.phone ?? null,
      };
    })
    // Recently paid first; pending (no paidDate) appear after
    .sort((a, b) => {
      if (a.paidDate && b.paidDate) {
        return String(b.paidDate).localeCompare(String(a.paidDate));
      }
      if (a.paidDate && !b.paidDate) return -1;
      if (!a.paidDate && b.paidDate) return 1;
      return String(a.residentName || '').localeCompare(String(b.residentName || ''));
    });
  return structuredClone(list);
}

export function mockGetPayment(id) {
  const payment = store.payments.find((p) => p.id === id);
  if (!payment) return null;
  const resident = store.residents.find((r) => r.id === payment.residentId);
  return structuredClone({
    ...payment,
    residentName: resident?.name ?? 'Unknown',
    roomNumber: resident?.roomNumber ?? null,
    phone: resident?.phone ?? null,
  });
}

export function mockMarkPaymentPaid(id, { paymentMethod, receivedBy = 'Admin', paidDate }) {
  const payment = store.payments.find((p) => p.id === id);
  if (!payment) throw new Error('Payment not found.');
  if (payment.status === 'PAID') throw new Error('Payment is already marked as paid.');

  payment.status = 'PAID';
  payment.paymentMethod = paymentMethod;
  payment.paidDate = paidDate || new Date().toISOString().slice(0, 10);
  payment.receivedBy = receivedBy || 'Admin';

  notify();
  return mockGetPayment(id);
}

function enrichTransfer(transfer) {
  const current = store.residents.find((r) => r.id === transfer.residentId);
  const past = (store.pastResidents ?? []).find((r) => r.id === transfer.residentId);
  return {
    ...transfer,
    residentName: current?.name ?? past?.name ?? 'Former resident',
  };
}

export function mockGetTransfers() {
  return structuredClone(
    [...store.transfers]
      .sort((a, b) => String(b.transferDate).localeCompare(String(a.transferDate)))
      .map(enrichTransfer)
  );
}

export function mockGetDashboard() {
  const allRooms = store.floors.flatMap((f) => f.rooms);
  const totalRooms = allRooms.length;
  const totalBeds = allRooms.reduce((s, r) => s + r.capacity, 0);
  const residents = store.residents.length;
  const vacantBeds = allRooms.reduce(
    (s, r) => s + r.beds.filter((b) => b.status === 'VACANT').length,
    0
  );

  const { month, year } = getCurrentMonthYear();
  const monthPayments = store.payments.filter((p) => p.month === month && p.year === year);
  const paid = monthPayments.filter((p) => p.status === 'PAID').length;
  const pending = monthPayments.filter((p) => p.status === 'PENDING').length;

  const recentTransfers = [...store.transfers]
    .sort((a, b) => String(b.transferDate).localeCompare(String(a.transferDate)))
    .slice(0, 5)
    .map(enrichTransfer);

  return structuredClone({
    totalResidents: residents,
    totalRooms,
    vacantBeds,
    pendingPayments: pending,
    paymentSummary: { month, year, paid, pending, total: monthPayments.length },
    recentTransfers,
  });
}

export function mockGetAdmin() {
  return structuredClone(store.admin);
}
