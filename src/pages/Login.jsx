import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to log in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-nest-soft px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="Happy Nest" className="h-16 w-16 object-contain" />
          <h1 className="mt-4 font-display text-2xl font-semibold text-nest-navy">Sign in</h1>
          <p className="mt-1 text-sm text-nest-muted">Admin access for PG management</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-nest-line bg-white p-5 shadow-soft"
          noValidate
        >
          {error && (
            <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-nest-navy">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full rounded-xl border border-nest-line bg-white px-3 py-2.5 text-sm outline-none focus:border-nest-navy/40 focus:ring-2 focus:ring-nest-navy/10"
              placeholder="admin"
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-nest-navy">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-xl border border-nest-line bg-white px-3 py-2.5 text-sm outline-none focus:border-nest-navy/40 focus:ring-2 focus:ring-nest-navy/10"
              placeholder="••••••••"
              required
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-nest-navy text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? 'Signing in (may take up to a minute)...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
