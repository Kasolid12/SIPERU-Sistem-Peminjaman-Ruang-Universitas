import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookings';
import { roomService } from '../../services/rooms';
import { StatusBadge, LoadingPage } from '../../components/shared';
import type { Booking, StatusBooking } from '../../types';

export function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusBooking | undefined>('MENUNGGU');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings', filter],
    queryFn: () => bookingService.list({ status: filter }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: StatusBooking }) =>
      bookingService.setStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setSelectedBooking(null);
    },
  });

  const bookings = bookingsData?.data ?? [];

  if (isLoading) return <LoadingPage />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Persetujuan Peminjaman</h1>
        <p className="text-sm text-text-secondary mt-1">Setujui atau tolak pengajuan peminjaman ruang</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
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
            {s === 'MENUNGGU' ? '⏳ Menunggu' : s === 'DISETUJUI' ? '✅ Disetujui' : s === 'DITOLAK' ? '❌ Ditolak' : '✓ Selesai'}
          </button>
        ))}
      </div>

      {/* Booking cards */}
      <div className="space-y-3">
        {bookings.length === 0 ? (
          <div className="bg-surface-card rounded-xl shadow-card p-8 text-center">
            <p className="text-text-muted">Tidak ada peminjaman dengan status ini.</p>
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
                    <span>👤 {booking.user.nama}</span>
                  </div>
                </div>

                {booking.status === 'MENUNGGU' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => approveMutation.mutate({ id: booking.id, status: 'DISETUJUI' })}
                      disabled={approveMutation.isPending}
                      className="px-4 py-2 rounded-lg bg-status-disetujui-bg text-status-disetujui text-sm font-medium hover:bg-status-disetujui/10 transition-all cursor-pointer disabled:opacity-50"
                    >
                      Setujui
                    </button>
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="px-4 py-2 rounded-lg bg-status-ditolak-bg text-status-ditolak text-sm font-medium hover:bg-status-ditolak/10 transition-all cursor-pointer"
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-dropdown w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Tolak Peminjaman</h2>
            <p className="text-sm text-text-secondary mb-4">
              Tolak peminjaman ruang <strong>{selectedBooking.room.nama}</strong> oleh{' '}
              <strong>{selectedBooking.user.nama}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  approveMutation.mutate({ id: selectedBooking.id, status: 'DITOLAK' });
                }}
                disabled={approveMutation.isPending}
                className="flex-1 py-2.5 rounded-lg bg-status-ditolak text-white text-sm font-medium hover:bg-status-ditolak/90 disabled:opacity-50 transition-all cursor-pointer"
              >
                Ya, Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}