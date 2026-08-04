import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../services/bookings';
import { StatusBadge, LoadingPage } from '../../components/shared';
import { useNavigate } from 'react-router-dom';

export function DosenDashboardPage() {
  const navigate = useNavigate();

  const { data: allData, isLoading } = useQuery({
    queryKey: ['bookings-dosen'],
    queryFn: () => bookingService.list(),
  });

  const bookings = allData?.data ?? [];
  const menunggu = bookings.filter((b) => b.status === 'MENUNGGU').length;
  const disetujui = bookings.filter((b) => b.status === 'DISETUJUI').length;

  if (isLoading) return <LoadingPage />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard Saya</h1>
        <p className="text-sm text-text-secondary mt-1">Ringkasan peminjaman ruang Anda</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-card rounded-xl shadow-card p-5">
          <p className="text-2xl font-bold text-text-primary">{bookings.length}</p>
          <p className="text-sm text-text-secondary mt-1">Total Peminjaman</p>
        </div>
        <div className="bg-surface-card rounded-xl shadow-card p-5 ring-1 ring-status-menunggu/20">
          <p className="text-2xl font-bold text-status-menunggu">{menunggu}</p>
          <p className="text-sm text-text-secondary mt-1">Menunggu Persetujuan</p>
        </div>
        <div className="bg-surface-card rounded-xl shadow-card p-5 ring-1 ring-status-disetujui/20">
          <p className="text-2xl font-bold text-status-disetujui">{disetujui}</p>
          <p className="text-sm text-text-secondary mt-1">Disetujui</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => navigate('/dosen/new')}
          className="px-5 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-light transition-all cursor-pointer"
        >
          ➕ Ajukan Peminjaman Baru
        </button>
        <button
          onClick={() => navigate('/dosen/history')}
          className="px-5 py-3 rounded-xl border border-border text-text-secondary text-sm font-medium hover:bg-surface transition-all cursor-pointer"
        >
          📚 Lihat Riwayat
        </button>
      </div>

      {/* Recent bookings */}
      {bookings.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-text-primary mb-3">Peminjaman Terbaru</h2>
          <div className="space-y-2">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="bg-surface-card rounded-xl shadow-card p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{booking.room.nama}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(booking.tanggal).toLocaleDateString('id-ID')} — {booking.jamMulai}–{booking.jamSelesai}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}