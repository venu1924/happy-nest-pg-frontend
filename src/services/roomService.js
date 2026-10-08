import api, { USE_MOCK, mockDelay } from './api';
import {
  mockGetFloors,
  mockGetFloor,
  mockGetRoom,
} from '../data/mockStore';

/**
 * Room / floor API surface.
 * Expected Spring Boot endpoints:
 *   GET /api/rooms
 *   GET /api/rooms/{roomNumber}
 *   GET /api/floors
 *   GET /api/floors/{floorNumber}
 */

export async function getFloors() {
  if (USE_MOCK) {
    await mockDelay();
    return mockGetFloors();
  }
  const { data } = await api.get('/floors');
  return data;
}

export async function getFloorByNumber(floorNumber) {
  if (USE_MOCK) {
    await mockDelay();
    return mockGetFloor(floorNumber);
  }
  const { data } = await api.get(`/floors/${floorNumber}`);
  return data;
}

export async function getRoomByNumber(roomNumber) {
  if (USE_MOCK) {
    await mockDelay();
    return mockGetRoom(roomNumber);
  }
  const { data } = await api.get(`/rooms/${roomNumber}`);
  return data;
}

export async function getRooms() {
  if (USE_MOCK) {
    await mockDelay();
    const floors = mockGetFloors();
    return floors.flatMap((f) => f.rooms);
  }
  const { data } = await api.get('/rooms');
  return data;
}
