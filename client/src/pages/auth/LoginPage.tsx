import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { authService } from '../../services/auth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      login(res.token, res.user);
      navigate(res.user.role === 'ADMIN' ? '/admin' : '/dosen', { replace: true });
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Terjadi kesalahan. Silakan coba lagi.';
      setError(msg || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            S
          </div>
          <h1 className="text-2xl font-bold text-text-primary">SIPERU</h1>
          <p className="text-sm text-text-secondary mt-1">
            Sistem Peminjaman Ruang Universitas
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-card rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-6">Masuk</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-ditolak-bg text-status-ditolak text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@siperu.ac.id"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="text-xs text-text-muted text-center mt-4">
          Akun demo: admin@siperu.ac.id / dosen1@siperu.ac.id &mdash; password: password123
        </p>
      </div>
    </div>
  );
}