export const PAYMENT_METHODS = [
  { id: 'CASH', label: 'Cash' },
  { id: 'UPI', label: 'UPI' },
  { id: 'CARD', label: 'Card' },
];

export function paymentStatusLabel(status) {
  return status === 'PAID' ? 'Paid' : 'Pending';
}

export function paymentMethodLabel(method) {
  if (method === 'CASH') return 'Cash';
  if (method === 'UPI') return 'UPI';
  if (method === 'CARD') return 'Credit/Debit Card';
  // Legacy mock values (if any remain)
  if (method === 'PHONEPE' || method === 'PHONEPE') return 'UPI';
  return method ?? '—';
}

export function summarizePayments(payments) {
  const paid = payments.filter((p) => p.status === 'PAID').length;
  const pending = payments.filter((p) => p.status === 'PENDING').length;
  return { paid, pending, total: payments.length };
}

export function sortPaymentsByRecentPaid(payments) {
  return [...payments].sort((a, b) => {
    if (a.paidDate && b.paidDate) {
      return String(b.paidDate).localeCompare(String(a.paidDate));
    }
    if (a.paidDate && !b.paidDate) return -1;
    if (!a.paidDate && b.paidDate) return 1;
    return String(a.residentName || '').localeCompare(String(b.residentName || ''));
  });
}

export function filterPayments(payments, { status = 'ALL', query = '' } = {}) {
  const q = query.trim().toLowerCase();
  const filtered = payments.filter((p) => {
    if (status !== 'ALL' && p.status !== status) return false;
    if (!q) return true;
    const hay = `${p.residentName ?? ''} ${p.roomNumber ?? ''} ${p.phone ?? ''}`.toLowerCase();
    return hay.includes(q);
  });
  return sortPaymentsByRecentPaid(filtered);
}

export function monthKey(month, year) {
  return `${year}-${String(month).padStart(2, '0')}`;
}
