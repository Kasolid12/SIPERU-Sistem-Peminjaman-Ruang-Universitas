import { roomRepository } from "../repositories/room.repository";
import { AppError } from "../utils/httpError";
import { env } from "../config/env";
import type { RoomCreateInput, RoomUpdateInput } from "../validators/room.validator";

interface ExternalRoom {
  id: string;
  kode_ruang: string;
  nama_ruangan: string;
  nama_gedung: string;
  kapasitas_ruang: number;
  jenis_ruang: string;
}

/** Pemetaan shape webservice eksternal → field model Room kita. */
function mapExternalRoom(r: ExternalRoom): RoomCreateInput {
  return {
    nama: r.nama_ruangan,
    lokasi: `${r.nama_gedung} — ${r.kode_ruang}`,
    kapasitas: r.kapasitas_ruang,
  };
}

export const roomService = {
  list(search?: string) {
    return roomRepository.findAll(search);
  },

  async getById(id: number) {
    const room = await roomRepository.findById(id);
    if (!room) {
      throw new AppError(404, "Ruang tidak ditemukan.");
    }
    return room;
  },

  create(input: RoomCreateInput) {
    return roomRepository.create(input);
  },

  async update(id: number, input: RoomUpdateInput) {
    await this.getById(id); // pastikan ruang ada (404 bila tidak)
    return roomRepository.update(id, input);
  },

  async remove(id: number) {
    await this.getById(id); // pastikan ruang ada (404 bila tidak)
    await roomRepository.remove(id);
  },

  /**
   * Sinkronisasi ruang dari webservice eksternal.
   * Strategi upsert: ruang eksternal di-identifikasi via `externalId`,
   * sehingga sinkronisasi berulang bersifat idempoten (tidak duplikat).
   */
  async syncFromExternal() {
    const res = await fetch(env.externalRoomsUrl);
    if (!res.ok) {
      throw new AppError(502, `Gagal mengambil data ruang dari webservice eksternal (HTTP ${res.status}).`);
    }

    const data = (await res.json()) as ExternalRoom[];
    if (!Array.isArray(data)) {
      throw new AppError(502, "Respons webservice eksternal tidak valid.");
    }

    let synced = 0;
    for (const item of data) {
      await roomRepository.upsertByExternalId(item.id, mapExternalRoom(item));
      synced += 1;
    }
    return { synced, totalAvailable: data.length };
  },
};
