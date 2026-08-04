import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../utils/httpError";

type Source = "body" | "query" | "params";

/** Validasi input Zod — throw 400 (AppError) bila data tidak sesuai schema. */
export function validate(schema: ZodTypeAny, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const detail = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      throw new AppError(400, `Validasi gagal — ${detail}`);
    }
    // Simpan hasil parse yang sudah dibersihkan agar dipakai handler.
    req[source] = result.data;
    next();
  };
}
