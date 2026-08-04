import { bookingRepository } from "../repositories/booking.repository";
import { roomRepository } from "../repositories/room.repository";

export const dashboardService = {
  /** Ringkasan untuk dashboard admin. */
  async summary() {
    const [rooms, totalBookings, byStatus] = await Promise.all([
      roomRepository.count(),
      bookingRepository.countTotal(),
      bookingRepository.countByStatus(),
    ]);

    const statusCount = {
      MENUNGGU: 0,
      DISETUJUI: 0,
      DITOLAK: 0,
      SELESAI: 0,
    };
    for (const row of byStatus) {
      statusCount[row.status] = row._count._all;
    }

    // Peminjaman hari ini (aktif): tanggal hari ini, belum selesai.
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayBookings = await bookingRepository.findAll({ tanggal: todayStart });

    return {
      totalRooms: rooms,
      totalBookings,
      statusCount,
      todayBookings: todayBookings.length,
    };
  },
};
