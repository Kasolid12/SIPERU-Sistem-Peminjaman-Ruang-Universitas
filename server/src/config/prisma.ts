import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";
import { env } from "./env";

/**
 * PrismaClient singleton.
 *
 * Catatan: Prisma 7 mewajibkan driver adapter. Prisma CLI hanya menerima scheme
 * `mysql://` sedangkan driver mariadb hanya menerima scheme `mariadb://`,
 * jadi di sini scheme ditukar sebelum diserahkan ke adapter.
 */
const adapter = new PrismaMariaDb(env.databaseUrl.replace(/^mysql:\/\//, "mariadb://"));

export const prisma = new PrismaClient({ adapter });
