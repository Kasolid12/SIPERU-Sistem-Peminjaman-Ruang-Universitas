import { bookingRepository } from "../repositories/booking.repository";
import { roomRepository } from "../repositories/room.repository";
import { AppError } from "../utils/httpError";
import type { BookingCreateInput } from "../validators/booking.validator";
import type { Role, StatusBooking } from "../../generated/prisma/enums";

/** Konversi "YYYY-MM-DD" → Date tengah malam lokal (konsisten di seluruh app). */
export function parseTanggal(tanggal: string): Date {
  const [y, m, d] = tanggal.split("-").map(Number);
  return new Date(y as number, (m as number) - 1, d as number);
}

/**
 * ATOMICITY CHECK: validasi bentrok jadwal.
 *
 * Dua peminjaman dianggap BENTROK jika memenuhi SEMUA kondisi:
 *   1. `roomId` sama (ruang yang sama),
 *   2. status peminjaman lain = DISETUJUI (hanya jadwal terkonfirmasi yang "memegang" ruang;
 *      pengajuan MENUNGGU tidak memblokir, karena admin yang memutuskan siapa yang disetujui),
 *   3. `tanggal` sama, dan
 *   4. rentang waktu beririsan: jamMulai_A < jamSelesai_B DAN jamMulai_B < jamSelesai_A.
 *
 * Komparasi jam memakai perbandingan string lexicographic — valid karena format
 * jam selalu "HH:MM" zero-padded, sehingga urutan string = urutan waktu.
 */
export function cekBentrokJadwal(
  existing: { jamMulai: string; jamSelesai: string }[],
  jamMulai: string,
  jamSelesai: string,
): boolean {
  return existing.some(
    (e) => e.jamMulai < jamSelesai && jamMulai < e.jamSelesai,
  );
}

export const bookingService = {
  async create(input: BookingCreateInput, userId: number) {
    const room = await roomRepository.findById(input.roomId);
    if (!room) {
      throw new AppError(404, "Ruang tidak ditemukan.");
    }

    const tanggal = parseTanggal(input.tanggal);
    await this.assertTidakBentrok(input.roomId, tanggal, input.jamMulai, input.jamSelesai);

    return bookingRepository.create({ ...input, tanggal, userId });
  },

  /** List booking: admin melihat semua, dosen hanya punya sendiri. */
  list(opts: { userRole: Role; userId: number; status?: StatusBooking; tanggal?: string }) {
    const isDosen = opts.userRole === "DOSEN";
    return bookingRepository.findAll({
      userId: isDosen ? opts.userId : undefined,
      status: opts.status,
      tanggal: opts.tanggal ? parseTanggal(opts.tanggal) : undefined,
    });
  },

  async getById(id: number, opts: { userRole: Role; userId: number }) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new AppError(404, "Peminjaman tidak ditemukan.");
    }
    // Dosen hanya boleh melihat peminjamannya sendiri.
    if (opts.userRole === "DOSEN" && booking.userId !== opts.userId) {
      throw new AppError(403, "Anda tidak memiliki akses ke peminjaman ini.");
    }
    return booking;
  },

  /** Approval/Reject oleh admin — approve melakukan cek bentrok ulang. */
  async setStatus(id: number, status: StatusBooking) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new AppError(404, "Peminjaman tidak ditemukan.");
    }
    if (booking.status === "SELESAI") {
      throw new AppError(400, "Peminjaman yang sudah selesai tidak bisa diubah statusnya.");
    }

    if (status === "DISETUJUI") {
      await this.assertTidakBentrok(booking.roomId, booking.tanggal, booking.jamMulai, booking.jamSelesai, id);
    }

    return bookingRepository.updateStatus(id, status);
  },

  /** Pembatalan oleh pemilik (dosen) — hanya saat status MENUNGGU. */
  async cancel(id: number, userId: number) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new AppError(404, "Peminjaman tidak ditemukan.");
    }
    if (booking.userId !== userId) {
      throw new AppError(403, "Anda tidak memiliki akses ke peminjaman ini.");
    }
    if (booking.status !== "MENUNGGU") {
      throw new AppError(400, "Hanya pengajuan berstatus MENUNGGU yang bisa dibatalkan.");
    }
    await bookingRepository.remove(id);
  },

  /**
   * Cek bentrok terhadap booking DISETUJUI yang sudah ada.
   * Throw 409 bila bentrok — dengan detail rentang waktu yang bertabrakan.
   */
  async assertTidakBentrok(
    roomId: number,
    tanggal: Date,
    jamMulai: string,
    jamSelesai: string,
    excludeId?: number,
  ) {
    const approved = await bookingRepository.findConflictingApproved(roomId, tanggal, excludeId);
    const bentrok = cekBentrokJadwal(approved, jamMulai, jamSelesai);

    if (bentrok) {
      const bentrokDengan = approved.find(
        (b) => b.jamMulai < jamSelesai && jamMulai < b.jamSelesai,
      );
      throw new AppError(
        409,
        `Ruang sudah dipesan pada jam ${bentrokDengan?.jamMulai}–${bentrokDengan?.jamSelesai} di tanggal tersebut.`,
      );
    }
  },
};
