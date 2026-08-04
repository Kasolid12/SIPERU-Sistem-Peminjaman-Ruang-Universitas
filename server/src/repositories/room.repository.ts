import { prisma } from "../config/prisma";
import type { RoomCreateInput, RoomUpdateInput } from "../validators/room.validator";

export const roomRepository = {
  /** List ruang dengan pencarian nama/lokasi (opsional). */
  findAll(search?: string) {
    return prisma.room.findMany({
      where: search
        ? {
            OR: [
              { nama: { contains: search } },
              { lokasi: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { nama: "asc" },
    });
  },

  findById(id: number) {
    return prisma.room.findUnique({ where: { id } });
  },

  findByExternalId(externalId: string) {
    return prisma.room.findUnique({ where: { externalId } });
  },

  create(data: RoomCreateInput) {
    return prisma.room.create({ data });
  },

  update(id: number, data: RoomUpdateInput) {
    return prisma.room.update({ where: { id }, data });
  },

  remove(id: number) {
    return prisma.room.delete({ where: { id } });
  },

  count() {
    return prisma.room.count();
  },

  /**
   * Upsert ruang hasil sinkronisasi dari webservice eksternal.
   * `externalId` menjadi kunci unik: ruang baru dibuat, ruang lama diperbarui.
   */
  upsertByExternalId(externalId: string, data: RoomCreateInput) {
    return prisma.room.upsert({
      where: { externalId },
      create: { ...data, externalId },
      update: data,
    });
  },
};
