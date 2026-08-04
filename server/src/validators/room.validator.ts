import { z } from "zod";

export const roomCreateSchema = z.object({
  nama: z.string().min(2, "Nama ruang minimal 2 karakter").max(100),
  lokasi: z.string().min(2, "Lokasi minimal 2 karakter").max(150),
  kapasitas: z.number().int().positive("Kapasitas harus bilangan positif").max(10000),
});

export const roomUpdateSchema = roomCreateSchema.partial();

export const roomParamsSchema = z.object({
  id: z.coerce.number().int().positive("id ruang tidak valid"),
});

export const roomListQuerySchema = z.object({
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export type RoomCreateInput = z.infer<typeof roomCreateSchema>;
export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>;
