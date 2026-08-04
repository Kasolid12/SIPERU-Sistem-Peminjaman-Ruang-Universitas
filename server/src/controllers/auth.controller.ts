import type { Request, Response } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    res.json(result);
  },

  /** Profil user yang sedang login (dari token JWT). */
  async me(req: Request, res: Response) {
    const user = req.user;
    res.json({ id: user?.id, role: user?.role });
  },
};
