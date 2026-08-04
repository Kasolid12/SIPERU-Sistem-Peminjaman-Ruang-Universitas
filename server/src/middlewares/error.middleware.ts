import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/httpError";

/** Error handler terpusat — format respons error konsisten. */
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof ZodError) {
    const detail = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return res.status(400).json({ message: `Validasi gagal — ${detail}` });
  }

  console.error("[server] Unhandled error:", err);
  return res.status(500).json({ message: "Terjadi kesalahan internal server." });
}
