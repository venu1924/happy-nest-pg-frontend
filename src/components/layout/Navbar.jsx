import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/logo.png';
import AdminProfileMenu from './AdminProfileMenu';
import NotificationBell from './NotificationBell';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/residents', label: 'Residents' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/payments', label: 'Payments' },
  { to: '/temporary', label: 'Temporary' },
];

function NavItem({ to, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive
            ? 'bg-nest-navy text-white'
            : 'text-nest-navy/80 hover:bg-nest-soft'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-nest-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-nest-navy md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex items-center" aria-label="Home">
            <img
              src={logo}
              alt="Happy Nest"
              className="h-9 w-9 object-contain sm:h-11 sm:w-11"
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <NotificationBell />
          <AdminProfileMenu />
        </div>
      </div>

      {menuOpen && (
        <nav
          className="border-t border-nest-line bg-white px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.to}
                {...item}
                onClick={() => setMenuOpen(false)}
              />
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
