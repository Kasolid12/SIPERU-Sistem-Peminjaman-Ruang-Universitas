import dotenv from "dotenv";

// Dimuat paling awal: override:true agar nilai .env menang atas env var yang
// sudah ada di shell (mis. PORT dari environment kerja), sehingga port konsisten.
dotenv.config({ override: true });

/** Config & environment variables. Semua secret dari .env, tidak di-hardcode. */
export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "siperu-super-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  databaseUrl: process.env.DATABASE_URL ?? "mysql://root@localhost:3306/siperu",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  externalRoomsUrl: process.env.EXTERNAL_ROOMS_URL ?? "https://api-ruangan.vercel.app/rooms",
} as const;
