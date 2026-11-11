import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getNotifications } from '../../services/notificationService';

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    const load = () => {
      getNotifications()
        .then((data) => {
          if (active) setUnread(Number(data.unread) || 0);
        })
        .catch(() => {});
    };
    load();
    const timer = window.setInterval(load, 120000);
    window.addEventListener('focus', load);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', load);
    };
  }, []);

  return (
    <Link
      to="/notifications"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-nest-navy"
      aria-label={unread > 0 ? `${unread} notifications` : 'Notifications'}
    >
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute right-1 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-4 text-white">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}
