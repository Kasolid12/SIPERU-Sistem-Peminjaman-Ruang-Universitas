import { useAuth } from '../../store/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/rooms', label: 'Kelola Ruang', icon: '🏛️' },
  { to: '/admin/approvals', label: 'Persetujuan', icon: '📋' },
];

const dosenNav = [
  { to: '/dosen', label: 'Dashboard', icon: '📋' },
  { to: '/dosen/new', label: 'Ajukan Peminjaman', icon: '➕' },
  { to: '/dosen/history', label: 'Riwayat', icon: '📚' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = user?.role === 'ADMIN' ? adminNav : dosenNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className="bg-white border-r border-border transition-all duration-200 flex flex-col w-60"
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
          S
        </div>
        <span className="font-semibold text-sm text-text-primary whitespace-nowrap">
          SIPERU
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin' || item.to === '/dosen'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary'
              }`
            }
          >
            <span className="text-lg shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
            {user?.nama.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.nama}</p>
              <p className="text-xs text-text-muted">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-ditolak hover:bg-ditolak-bg transition-all cursor-pointer"
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-surface">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}