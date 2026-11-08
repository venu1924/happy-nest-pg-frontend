import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  deleteTemporaryResident,
  extendTemporaryStay,
  markTemporaryPaid,
} from '../services/temporaryResidentService';
import { formatCurrency, formatDate, formatPhone } from '../utils/formatters';
import { stayCountdown } from '../utils/stayUtils';
import StatusBadge from '../components/common/StatusBadge';
import ErrorState from '../components/common/ErrorState';
import { PAYMENT_METHODS, paymentMethodLabel } from '../utils/paymentUtils';

export default function TemporaryResidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { temporaryResidents, refresh } = useApp();
  const stay = (temporaryResidents || []).find((t) => t.id === id);
  const [extraDays, setExtraDays] = useState('1');
  const [method, setMethod] = useState('CASH');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!stay) return <ErrorState message="Temporary resident not found." />;

  const run = async (action) => {
    setBusy(true);
    setError('');
    try {
      await action();
      await refresh({ silent: true });
    } catch (err) {
      setError(err.message || 'Unable to update.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link to="/temporary" className="inline-flex min-h-10 items-center gap-1 text-sm text-nest-muted">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Temporary residents
      </Link>
      <header className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Temporary stay</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-nest-navy">{stay.name}</h1>
        <p className="mt-2 text-sm text-nest-muted">
          Room {stay.roomNumber} · Bed {String(stay.bedId || '').split('-').pop()}
        </p>
        <p className="mt-1 text-sm tabular-nums text-nest-muted">{formatPhone(stay.phone)}</p>
        <p className="mt-3 text-sm font-semibold text-nest-navy">{stayCountdown(stay)}</p>
      </header>

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <section className="rounded-2xl border border-nest-line bg-white p-4 shadow-soft text-sm">
        <Row label="Joined" value={formatDate(stay.joiningDate)} />
        <Row label="Days booked" value={String(stay.stayDays)} />
        <Row label="Last day" value={formatDate(stay.checkoutDate)} />
        <Row label="Per day" value={formatCurrency(stay.amountPerDay)} />
        <Row label="Total" value={formatCurrency(stay.amount)} />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-nest-muted">Payment</span>
          <StatusBadge status={stay.paymentStatus}>{stay.paymentStatus === 'PAID' ? 'Paid' : 'Unpaid'}</StatusBadge>
        </div>
        {stay.paymentStatus === 'PAID' && (
          <p className="mt-2 text-xs text-nest-muted">
            {stay.paymentMethod ? `Via ${paymentMethodLabel(stay.paymentMethod)}` : ''}
            {stay.paidDate ? ` · ${formatDate(stay.paidDate)}` : ''}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-nest-line bg-white p-4 shadow-soft">
        <h2 className="text-sm font-semibold text-nest-navy">Extend stay</h2>
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            min="1"
            value={extraDays}
            onChange={(e) => setExtraDays(e.target.value)}
            className="w-24 rounded-xl border border-nest-line px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => extendTemporaryStay(stay.id, Number(extraDays)))}
            className="min-h-11 flex-1 rounded-xl bg-nest-navy text-sm font-semibold text-white disabled:opacity-60"
          >
            Add days
          </button>
        </div>
      </section>

      {stay.paymentStatus !== 'PAID' && (
        <section className="rounded-2xl border border-nest-line bg-white p-4 shadow-soft">
          <h2 className="text-sm font-semibold text-nest-navy">Record payment</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`min-h-10 rounded-lg text-sm font-medium ${
                  method === m.id ? 'bg-nest-navy text-white' : 'bg-nest-soft text-nest-navy'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              run(() =>
                markTemporaryPaid(stay.id, {
                  paymentMethod: method,
                  receivedBy: 'Admin',
                  paidDate: new Date().toISOString().slice(0, 10),
                })
              )
            }
            className="mt-3 min-h-11 w-full rounded-xl bg-nest-green text-sm font-semibold text-white disabled:opacity-60"
          >
            Mark as paid
          </button>
        </section>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={() =>
          run(async () => {
            await deleteTemporaryResident(stay.id);
            navigate('/temporary');
          })
        }
        className="min-h-12 w-full rounded-xl border border-red-200 text-sm font-semibold text-red-600"
      >
        Remove temporary stay
      </button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <span className="text-nest-muted">{label}</span>
      <span className="text-right font-medium text-nest-navy">{value}</span>
    </div>
  );
}
