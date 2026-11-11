import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  enablePhoneAlerts,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [publicKey, setPublicKey] = useState('');
  const [morningTime, setMorningTime] = useState('8:00 AM');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => getNotifications().then((data) => {
    setItems(data.items || []);
    setPublicKey(data.publicKey || '');
    setMorningTime(data.morningTime || '8:00 AM');
  });

  useEffect(() => {
    load().catch(() => setStatus('Could not load notifications.'));
  }, []);

  const turnOn = async () => {
    setBusy(true);
    setStatus('');
    try {
      await enablePhoneAlerts(publicKey);
      setStatus('Phone alerts are on. Morning updates will arrive on this phone.');
    } catch (err) {
      setStatus(err.message || 'Could not turn on phone alerts.');
    } finally {
      setBusy(false);
    }
  };

  const markAll = async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const openOne = async (item) => {
    if (item.read) return;
    await markNotificationRead(item.id);
    setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)));
  };

  const installed = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  return (
    <div className="space-y-5">
      <Link to="/" className="inline-flex min-h-10 items-center gap-1 text-sm text-nest-muted">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Dashboard
      </Link>
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-nest-navy">Notifications</h1>
          <p className="mt-1 text-sm text-nest-muted">
            Morning updates at {morningTime}. Rent reminders start on the 6th. Milestones show once, when they happen.
          </p>
        </div>
        {items.some((item) => !item.read) && (
          <button type="button" onClick={markAll} className="text-sm font-medium text-nest-navy">
            Mark all read
          </button>
        )}
      </header>

      <section className="rounded-2xl border border-nest-line bg-white p-4 shadow-soft">
        <h2 className="font-medium text-nest-navy">Use it as a phone app</h2>
        <p className="mt-1 text-sm text-nest-muted">
          {installed
            ? 'This phone is already using the home-screen app.'
            : 'On iPhone: Share, then Add to Home Screen. On Android: open the browser menu and choose Install app or Add to Home screen.'}
        </p>
        <button
          type="button"
          onClick={turnOn}
          disabled={busy || !publicKey}
          className="mt-3 min-h-11 rounded-xl bg-nest-navy px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? 'Turning on...' : 'Turn on phone alerts'}
        </button>
        {status && <p className="mt-2 text-sm text-nest-navy">{status}</p>}
      </section>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-nest-line bg-white p-4 text-sm text-nest-muted">
          No notifications yet. The morning check adds vacate and rent alerts. Milestones appear when the PG reaches them.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => openOne(item)}
                className={`w-full rounded-2xl border p-4 text-left shadow-soft ${
                  item.read ? 'border-nest-line bg-white' : 'border-nest-navy/20 bg-white'
                }`}
              >
                <p className="text-sm font-medium text-nest-navy">{item.message}</p>
                <p className="mt-1 text-xs text-nest-muted">{item.noticeDate}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
