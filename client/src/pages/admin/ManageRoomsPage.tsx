import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomService } from '../../services/rooms';
import { LoadingPage } from '../../components/shared';
import type { Room, RoomCreateInput } from '../../types';

export function ManageRoomsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<RoomCreateInput>({ nama: '', lokasi: '', kapasitas: 30 });
  const [syncMsg, setSyncMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: roomsData, isLoading } = useQuery({
    queryKey: ['rooms', search],
    queryFn: () => roomService.list(search || undefined),
  });

  const createMutation = useMutation({
    mutationFn: (data: RoomCreateInput) => roomService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setShowModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RoomCreateInput> }) =>
      roomService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setShowModal(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => roomService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
  });

  const syncMutation = useMutation({
    mutationFn: () => roomService.sync(),
    onSuccess: (res) => {
      setSyncMsg({ type: 'success', text: `Sinkronisasi berhasil: ${res.synced} ruang diperbarui.` });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setTimeout(() => setSyncMsg(null), 4000);
    },
    onError: () => {
      setSyncMsg({ type: 'error', text: 'Gagal sinkronisasi. Coba lagi.' });
      setTimeout(() => setSyncMsg(null), 4000);
    },
  });

  const resetForm = () => {
    setForm({ nama: '', lokasi: '', kapasitas: 30 });
    setEditingRoom(null);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setForm({ nama: room.nama, lokasi: room.lokasi, kapasitas: room.kapasitas });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      updateMutation.mutate({ id: editingRoom.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const rooms = roomsData?.data ?? [];

  if (isLoading) return <LoadingPage />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Kelola Ruang</h1>
          <p className="text-sm text-text-secondary mt-1">Tambah, edit, dan sinkronisasi data ruang</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface hover:text-text-primary transition-all cursor-pointer disabled:opacity-50"
          >
            {syncMutation.isPending ? 'Menyinkronkan...' : '🔄 Sinkronisasi'}
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light transition-all cursor-pointer"
          >
            + Tambah Ruang
          </button>
        </div>
      </div>

      {syncMsg && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            syncMsg.type === 'success' ? 'bg-status-disetujui-bg text-status-disetujui' : 'bg-status-ditolak-bg text-status-ditolak'
          }`}
        >
          {syncMsg.text}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau lokasi ruang..."
          className="w-full max-w-sm px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-surface-card rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Nama</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Lokasi</th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">Kapasitas</th>
                <th className="text-center px-4 py-3 font-medium text-text-secondary">Sumber</th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-muted text-sm">
                    Belum ada data ruang.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-text-primary">{room.nama}</td>
                    <td className="px-4 py-3 text-text-secondary">{room.lokasi}</td>
                    <td className="px-4 py-3 text-right text-text-secondary">{room.kapasitas}</td>
                    <td className="px-4 py-3 text-center">
                      {room.externalId ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/5 text-primary">Eksternal</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-text-muted">Lokal</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(room)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface hover:text-primary transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus ruang "${room.nama}"?`)) {
                              deleteMutation.mutate(room.id);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-status-ditolak hover:bg-status-ditolak-bg transition-all cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-dropdown w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              {editingRoom ? 'Edit Ruang' : 'Tambah Ruang Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Nama Ruang</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Lokasi</label>
                <input
                  type="text"
                  value={form.lokasi}
                  onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Kapasitas</label>
                <input
                  type="number"
                  value={form.kapasitas}
                  onChange={(e) => setForm({ ...form, kapasitas: Number(e.target.value) })}
                  required
                  min={1}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light disabled:opacity-50 transition-all cursor-pointer"
                >
                  {editingRoom ? 'Simpan Perubahan' : 'Tambah Ruang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}