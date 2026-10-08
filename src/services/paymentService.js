import api, { USE_MOCK, mockDelay } from './api';
import {
  mockGetPayments,
  mockGetPayment,
  mockMarkPaymentPaid,
} from '../data/mockStore';

/**
 * Payment record-keeping API (NOT a payment gateway).
 * Expected Spring Boot endpoints:
 *   GET /api/payments?month=&year=
 *   GET /api/payments/{id}
 *   PUT /api/payments/{id}/mark-paid
 */

export async function getPayments({ month, year } = {}) {
  if (USE_MOCK) {
    await mockDelay();
    return mockGetPayments({ month, year });
  }
  const { data } = await api.get('/payments', { params: { month, year } });
  return data;
}

export async function getPaymentById(id) {
  if (USE_MOCK) {
    await mockDelay();
    return mockGetPayment(id);
  }
  const { data } = await api.get(`/payments/${id}`);
  return data;
}

export async function markPaymentAsPaid(id, payload) {
  if (USE_MOCK) {
    await mockDelay(250);
    return mockMarkPaymentPaid(id, payload);
  }
  const { data } = await api.put(`/payments/${id}/mark-paid`, payload);
  return data;
}
