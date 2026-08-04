import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookings';
import { StatusBadge, LoadingPage } from '../../components/shared';
import type { StatusBooking } from '../../types';

export function DosenHistoryPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusBooking | undefined>();

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings', filter],
    queryFn: () => bookingService.list({ status: filter }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => bookingService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const bookings = bookingsData?.data ?? [];

  if (isLoading) return <LoadingPage />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Riwayat Peminjaman</h1>
        <p className="text-sm text-text-secondary mt-1">Daftar peminjaman yang telah diajukan</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter(undefined)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            !filter ? 'bg-primary text-white' : 'bg-white border border-border text-text-secondary hover:bg-surface'
          }`}
        >
          Semua
        </button>
        {(['MENUNGGU', 'DISETUJUI', 'DITOLAK', 'SELESAI'] as StatusBooking[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s === filter ? undefined : s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              filter === s
                ? 'bg-primary text-white'
                : 'bg-white border border-border text-text-secondary hover:bg-surface'
            }`}
          >
            <StatusBadge status={s} size="sm" />
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {bookings.length === 0 ? (
          <div className="bg-surface-card rounded-xl shadow-card p-8 text-center">
            <p className="text-text-muted">Belum ada peminjaman.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-surface-card rounded-xl shadow-card p-5 hover:shadow-card-hover transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-text-primary">{booking.room.nama}</h3>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="text-sm text-text-secondary mb-1">{booking.keperluan}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                    <span>📅 {new Date(booking.tanggal).toLocaleDateString('id-ID')}</span>
                    <span>🕐 {booking.jamMulai} – {booking.jamSelesai}</span>
                    <span>📍 {booking.room.lokasi}</span>
                  </div>
                </div>

                {booking.status === 'MENUNGGU' && (
                  <button
                    onClick={() => {
                      if (confirm('Batalkan peminjaman ini?')) {
                        cancelMutation.mutate(booking.id);
                      }
                    }}
                    disabled={cancelMutation.isPending}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-status-ditolak hover:bg-status-ditolak-bg transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    Batalkan
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}