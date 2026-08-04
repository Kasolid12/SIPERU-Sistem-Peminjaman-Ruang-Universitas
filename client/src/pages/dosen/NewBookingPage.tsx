import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookings';
import { roomService } from '../../services/rooms';
import { LoadingPage } from '../../components/shared';
import type { BookingCreateInput } from '../../types';

export function DosenNewBookingPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState<BookingCreateInput>({
    roomId: 0,
    tanggal: '',
    jamMulai: '08:00',
    jamSelesai: '09:00',
    keperluan: '',
  });
  const [error, setError] = useState('');

  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomService.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: BookingCreateInput) => bookingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      navigate('/dosen/history');
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Gagal mengajukan peminjaman.';
      setError(msg || 'Terjadi kesalahan');
    },
  });

  const rooms = roomsData?.data ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.roomId) {
      setError('Pilih ruang yang akan dipinjam.');
      return;
    }
    createMutation.mutate(form);
  };

  const today = new Date().toISOString().split('T')[0];

  if (roomsLoading) return <LoadingPage />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Ajukan Peminjaman</h1>
        <p className="text-sm text-text-secondary mt-1">Isi form untuk mengajukan peminjaman ruang</p>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="bg-surface-card rounded-xl shadow-card p-6 space-y-4">
          {error && (
            <div className="bg-status-ditolak-bg text-status-ditolak text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Ruang</label>
            <select
              value={form.roomId}
              onChange={(e) => setForm({ ...form, roomId: Number(e.target.value) })}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value={0}>Pilih ruang...</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.nama} — {room.lokasi} (kap. {room.kapasitas})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Tanggal</label>
            <input
              type="date"
              value={form.tanggal}
              min={today}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Jam Mulai</label>
              <input
                type="time"
                value={form.jamMulai}
                onChange={(e) => setForm({ ...form, jamMulai: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Jam Selesai</label>
              <input
                type="time"
                value={form.jamSelesai}
                onChange={(e) => setForm({ ...form, jamSelesai: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Keperluan</label>
            <textarea
              value={form.keperluan}
              onChange={(e) => setForm({ ...form, keperluan: e.target.value })}
              required
              rows={3}
              placeholder="Deskripsi keperluan peminjaman..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light disabled:opacity-50 transition-all cursor-pointer"
          >
            {createMutation.isPending ? 'Mengajukan...' : 'Ajukan Peminjaman'}
          </button>
        </form>
      </div>
    </div>
  );
}