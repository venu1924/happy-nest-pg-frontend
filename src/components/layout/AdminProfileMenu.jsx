import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminProfileMenu() {
  const { admin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-10 items-center gap-2 rounded-full border border-nest-line bg-white py-1.5 pl-1.5 pr-2.5 text-sm"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-nest-navy text-xs font-semibold text-white">
          {(admin?.name || 'A').charAt(0)}
        </span>
        <span className="hidden max-w-[6rem] truncate font-medium text-nest-navy sm:inline">
          {admin?.name || 'Admin'}
        </span>
        <ChevronDown className="h-4 w-4 text-nest-muted" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-xl border border-nest-line bg-white py-1 shadow-soft"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-nest-navy hover:bg-nest-soft"
            onClick={() => {
              setOpen(false);
              navigate('/profile');
            }}
          >
            <User className="h-4 w-4" aria-hidden />
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-nest-navy hover:bg-nest-soft"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Logout
          </button>
          <Link to="/profile" className="sr-only" onClick={() => setOpen(false)}>
            Profile
          </Link>
        </div>
      )}
    </div>
  );
}
