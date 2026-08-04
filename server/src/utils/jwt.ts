import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { Role } from "../../generated/prisma/enums";

export interface JwtPayload {
  id: number;
  role: Role;
}

export function signToken(payload: JwtPayload): string {
  // expiresIn dari env bertipe string; jsonwebtoken butuh tipe StringValue (ms).
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
