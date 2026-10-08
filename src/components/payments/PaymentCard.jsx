import { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import ConfirmDialog from '../common/ConfirmDialog';
import { formatCurrency, formatDate, formatMonthYear } from '../../utils/formatters';
import { paymentMethodLabel, PAYMENT_METHODS } from '../../utils/paymentUtils';

export default function PaymentCard({ payment, onMarkPaid }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState('CASH');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isPending = payment.status === 'PENDING';

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onMarkPaid(payment.id, {
        paymentMethod: method,
        receivedBy: 'Admin',
        paidDate,
      });
      setConfirmOpen(false);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-nest-line bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-nest-navy">{payment.residentName}</p>
          <p className="mt-1 text-sm text-nest-muted">Room {payment.roomNumber}</p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-nest-navy">
            {formatCurrency(payment.amount)}
          </p>
          <p className="mt-1 text-xs text-nest-muted">
            {formatMonthYear(payment.month, payment.year)}
          </p>
        </div>
        <StatusBadge status={payment.status}>
          {payment.status === 'PAID' ? 'Paid' : 'Pending'}
        </StatusBadge>
      </div>

      {payment.status === 'PAID' && (
        <div className="mt-3 space-y-0.5 text-xs text-nest-muted">
          {payment.paymentMethod && (
            <p>
              Via {paymentMethodLabel(payment.paymentMethod)}
              {payment.receivedBy ? ` · Received by ${payment.receivedBy}` : ''}
            </p>
          )}
          {payment.paidDate && <p>Paid on {formatDate(payment.paidDate)}</p>}
        </div>
      )}

      {isPending && (
        <div className="mt-4">
          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="min-h-11 w-full rounded-xl border border-nest-navy/20 px-3 py-2.5 text-sm font-semibold text-nest-navy"
            >
              Record payment
            </button>
          ) : (
            <div className="space-y-3 rounded-xl bg-nest-soft p-3">
              <p className="text-xs text-nest-muted">
                Record status only — money is collected outside this app.
              </p>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Payment method</legend>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`min-h-10 rounded-lg px-2 text-sm font-medium ${
                        method === m.id
                          ? 'bg-nest-navy text-white'
                          : 'bg-white text-nest-navy'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-nest-navy">Payment date</span>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  className="w-full rounded-lg border border-nest-line bg-white px-3 py-2 text-sm outline-none focus:border-nest-navy/40"
                />
              </label>
              <p className="text-sm text-nest-muted">Received by: Admin</p>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="min-h-11 w-full rounded-xl bg-nest-green px-3 py-2.5 text-sm font-semibold text-white"
              >
                Mark as Paid
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Mark as paid?"
        message={`Record ${payment.residentName}'s ${formatMonthYear(payment.month, payment.year)} payment of ${formatCurrency(payment.amount)} as paid via ${paymentMethodLabel(method)} on ${formatDate(paidDate)}?`}
        confirmLabel={busy ? 'Saving...' : 'Mark as Paid'}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
