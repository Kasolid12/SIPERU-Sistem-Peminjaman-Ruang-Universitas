import type { Role } from "../../generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      /** Data user terautentikasi, diisi oleh auth middleware. */
      user?: {
        id: number;
        role: Role;
      };
    }
  }
}

export {};
