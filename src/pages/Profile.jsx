import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USE_MOCK, API_BASE_URL } from '../services/api';

export default function Profile() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <header>
        <h1 className="font-display text-2xl font-semibold text-nest-navy">Profile</h1>
        <p className="mt-1 text-sm text-nest-muted">Fixed admin login</p>
      </header>

      <section className="rounded-2xl border border-nest-line bg-white p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-nest-navy text-xl font-semibold text-white">
            {(admin?.name || 'A').charAt(0)}
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-nest-navy">
              {admin?.name || 'Admin'}
            </p>
            <p className="text-sm text-nest-muted">{admin?.role || 'Administrator'}</p>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-nest-line bg-white text-sm font-semibold text-nest-navy"
      >
        Logout
      </button>

      <section className="rounded-2xl border border-dashed border-nest-line bg-nest-soft p-4 text-xs text-nest-muted">
        <p>
          Data mode: <strong className="text-nest-navy">{USE_MOCK ? 'Mock' : 'API'}</strong>
        </p>
        <p className="mt-1 break-all">API base: {API_BASE_URL}</p>
      </section>
    </div>
  );
}
