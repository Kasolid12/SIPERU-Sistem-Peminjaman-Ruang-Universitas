import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../utils/httpError";

/**
 * Auth middleware — memverifikasi JWT Bearer token dan menempelkan
 * `req.user = { id, role }` untuk dipakai di controller/role middleware.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Autentikasi diperlukan: sertakan token Bearer.");
  }

  try {
    const payload = verifyToken(header.slice("Bearer ".length));
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    throw new AppError(401, "Token tidak valid atau sudah kedaluwarsa.");
  }
}
