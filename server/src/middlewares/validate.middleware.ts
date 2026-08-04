import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../utils/httpError";

type Source = "body" | "query" | "params";

/**
 * Validasi input Zod — throw 400 (AppError) bila data tidak sesuai schema.
 *
 * Catatan: Express 5 membuat req.query dan req.params sebagai getter-only,
 * jadi tidak bisa di-assign langsung. Untuk body kita pakai Object.assign
 * (karena masih writable), untuk query/params kita simpan di res.locals.
 */
export function validate(schema: ZodTypeAny, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const detail = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      throw new AppError(400, `Validasi gagal — ${detail}`);
    }

    // Express 5: body masih writable, query & params read-only.
    if (source === "body") {
      Object.assign(req.body, result.data);
    } else {
      // Simpan hasil validasi di properti baru agar handler bisa pakai.
      (req as unknown as Record<string, unknown>)[`validated${source}`] = result.data;
    }

    next();
  };
}
