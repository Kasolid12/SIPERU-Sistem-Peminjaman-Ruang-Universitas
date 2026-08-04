import type { Request, Response } from "express";
import { roomService } from "../services/room.service";

export const roomController = {
  async list(req: Request, res: Response) {
    const { search } = req.query as { search?: string };
    const rooms = await roomService.list(search);
    res.json({ data: rooms, total: rooms.length });
  },

  async getById(req: Request, res: Response) {
    const room = await roomService.getById(Number(req.params.id));
    res.json(room);
  },

  async create(req: Request, res: Response) {
    const room = await roomService.create(req.body);
    res.status(201).json(room);
  },

  async update(req: Request, res: Response) {
    const room = await roomService.update(Number(req.params.id), req.body);
    res.json(room);
  },

  async remove(req: Request, res: Response) {
    await roomService.remove(Number(req.params.id));
    res.status(204).send();
  },

  async sync(_req: Request, res: Response) {
    const result = await roomService.syncFromExternal();
    res.json(result);
  },
};
