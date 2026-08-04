import type { Request, Response, NextFunction } from "express";
import type { Role } from "../../generated/prisma/enums";
import { AppError } from "../utils/httpError";

/**
 * Role middleware — memastikan user terautentikasi memiliki salah satu role
 * yang diizinkan. Wajib dipasang setelah authMiddleware.
 */
export function roleMiddleware(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, "Autentikasi diperlukan.");
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(403, "Anda tidak memiliki akses ke resource ini.");
    }
    next();
  };
}
