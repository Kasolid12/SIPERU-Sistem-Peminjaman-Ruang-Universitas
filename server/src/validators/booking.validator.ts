import { z } from "zod";
import { StatusBooking } from "../../generated/prisma/enums";

/** Format jam 24 jam "HH:MM" (mis. "08:00", "15:30"). */
const jamSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam harus HH:MM 24 jam");

export const bookingCreateSchema = z
  .object({
    roomId: z.number().int().positive("roomId tidak valid"),
    tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
    jamMulai: jamSchema,
    jamSelesai: jamSchema,
    keperluan: z.string().min(3, "Keperluan minimal 3 karakter").max(500),
  })
  .refine((d) => d.jamSelesai > d.jamMulai, {
    message: "jamSelesai harus lebih besar dari jamMulai",
    path: ["jamSelesai"],
  });

export const bookingStatusSchema = z.object({
  status: z.enum([StatusBooking.DISETUJUI, StatusBooking.DITOLAK]),
});

export const bookingParamsSchema = z.object({
  id: z.coerce.number().int().positive("id booking tidak valid"),
});

export const bookingListQuerySchema = z.object({
  status: z.enum([StatusBooking.MENUNGGU, StatusBooking.DISETUJUI, StatusBooking.DITOLAK, StatusBooking.SELESAI]).optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD").optional(),
});

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
