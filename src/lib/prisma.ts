import { PrismaClient } from "@prisma/client";

/**
 * Cliente Prisma como singleton (evita múltiples conexiones en desarrollo con HMR).
 * Requiere `DATABASE_URL` en el entorno y haber ejecutado `npx prisma generate`.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Indica si hay una base de datos configurada. */
export const hasDatabase = Boolean(process.env.DATABASE_URL);
