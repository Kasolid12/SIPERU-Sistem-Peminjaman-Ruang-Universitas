import { prisma } from "../config/prisma";
import type { BookingCreateInput } from "../validators/booking.validator";
import type { StatusBooking } from "../../generated/prisma/enums";

export const bookingRepository = {
  /** `tanggal` sudah dikonversi jadi Date oleh service sebelum masuk repository. */
  create(data: Omit<BookingCreateInput, "tanggal"> & { tanggal: Date; userId: number }) {
    return prisma.booking.create({
      data,
      include: { room: true, user: { select: { id: true, nama: true, email: true } } },
    });
  },

  findById(id: number) {
    return prisma.booking.findUnique({
      where: { id },
      include: { room: true, user: { select: { id: true, nama: true, email: true } } },
    });
  },

  /** Semua booking milik user tertentu (dosen) / semua user (admin). */
  findAll(opts: { userId?: number; status?: StatusBooking; tanggal?: Date }) {
    return prisma.booking.findMany({
      where: {
        ...(opts.userId ? { userId: opts.userId } : {}),
        ...(opts.status ? { status: opts.status } : {}),
        ...(opts.tanggal ? { tanggal: opts.tanggal } : {}),
      },
      include: { room: true, user: { select: { id: true, nama: true, email: true } } },
      orderBy: [{ tanggal: "desc" }, { jamMulai: "asc" }],
    });
  },

  /** Booking bentrok potensial: ruang sama, tanggal sama, status DISETUJUI. */
  findConflictingApproved(roomId: number, tanggal: Date, excludeId?: number) {
    return prisma.booking.findMany({
      where: {
        roomId,
        tanggal,
        status: "DISETUJUI",
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  },

  updateStatus(id: number, status: StatusBooking) {
    return prisma.booking.update({
      where: { id },
      data: { status },
      include: { room: true, user: { select: { id: true, nama: true, email: true } } },
    });
  },

  remove(id: number) {
    return prisma.booking.delete({ where: { id } });
  },

  countByStatus() {
    return prisma.booking.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
  },

  countTotal() {
    return prisma.booking.count();
  },
};
