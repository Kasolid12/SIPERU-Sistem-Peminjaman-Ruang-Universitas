import type { Request, Response } from "express";
import { bookingService } from "../services/booking.service";
import type { StatusBooking } from "../../generated/prisma/enums";

export const bookingController = {
  async create(req: Request, res: Response) {
    const booking = await bookingService.create(req.body, req.user!.id);
    res.status(201).json(booking);
  },

  async list(req: Request, res: Response) {
    const { status, tanggal } = req.query as { status?: StatusBooking; tanggal?: string };
    const bookings = await bookingService.list({
      userRole: req.user!.role,
      userId: req.user!.id,
      status,
      tanggal,
    });
    res.json({ data: bookings, total: bookings.length });
  },

  async getById(req: Request, res: Response) {
    const booking = await bookingService.getById(Number(req.params.id), {
      userRole: req.user!.role,
      userId: req.user!.id,
    });
    res.json(booking);
  },

  /** Approval/Reject oleh admin. */
  async setStatus(req: Request, res: Response) {
    const { status } = req.body as { status: StatusBooking };
    const booking = await bookingService.setStatus(Number(req.params.id), status);
    res.json(booking);
  },

  /** Pembatalan pengajuan (dosen, hanya MENUNGGU). */
  async cancel(req: Request, res: Response) {
    await bookingService.cancel(Number(req.params.id), req.user!.id);
    res.status(204).send();
  },
};
