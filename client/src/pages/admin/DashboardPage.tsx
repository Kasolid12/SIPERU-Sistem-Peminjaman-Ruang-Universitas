import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboard';
import { LoadingPage } from '../../components/shared';
import { StatusBadge } from '../../components/shared';
import type { StatusBooking } from '../../types';

const statusList: StatusBooking[] = ['MENUNGGU', 'DISETUJUI', 'DITOLAK', 'SELESAI'];

const statusIcons: Record<string, string> = {
  MENUNGGU: '⏳',
  DISETUJUI: '✅',
  DITOLAK: '❌',
  SELESAI: '✓',
  total: '📋',
  rooms: '🏛️',
  today: '📅',
};

export function AdminDashboardPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardService.summary(),
  });

  if (isLoading) return <LoadingPage />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">Ringkasan sistem peminjaman ruang</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={statusIcons.rooms}
          label="Total Ruang"
          value={summary?.totalRooms ?? 0}
          sub="Ruang tersedia"
        />
        <StatCard
          icon={statusIcons.total}
          label="Total Peminjaman"
          value={summary?.totalBookings ?? 0}
          sub="Semua status"
        />
        <StatCard
          icon={statusIcons.today}
          label="Hari Ini"
          value={summary?.todayBookings ?? 0}
          sub="Peminjaman aktif"
        />
        <StatCard
          icon={statusIcons.MENUNGGU}
          label="Menunggu"
          value={summary?.statusCount.MENUNGGU ?? 0}
          sub="Perlu persetujuan"
          accent
        />
      </div>

      {/* Status Distribution */}
      <div className="bg-surface-card rounded-xl shadow-card p-6">
        <h2 className="text-base font-semibold text-text-primary mb-4">Distribusi Status</h2>
        <div className="space-y-3">
          {statusList.map((status) => {
            const count = summary?.statusCount[status] ?? 0;
            const total = summary?.totalBookings ?? 1;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={status} className="flex items-center gap-4">
                <div className="w-24 shrink-0">
                  <StatusBadge status={status} />
                </div>
                <div className="flex-1">
                  <div className="h-2.5 rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: getStatusColor(status),
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-text-secondary w-16 text-right">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: string;
  label: string;
  value: number;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`bg-surface-card rounded-xl shadow-card p-5 transition-all hover:shadow-card-hover ${
        accent ? 'ring-1 ring-status-menunggu/20' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-sm font-medium text-text-secondary mt-0.5">{label}</p>
      <p className="text-xs text-text-muted mt-1">{sub}</p>
    </div>
  );
}

function getStatusColor(status: StatusBooking) {
  const map: Record<StatusBooking, string> = {
    MENUNGGU: '#C08A3E',
    DISETUJUI: '#5F8D6B',
    DITOLAK: '#B4574F',
    SELESAI: '#6B7280',
  };
  return map[status];
}