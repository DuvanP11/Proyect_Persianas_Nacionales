import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./prisma";

/**
 * Tokens de recuperación de contraseña — un solo uso, con vencimiento.
 *
 * El token viaja EN CLARO solo dentro del enlace del correo. En la base se
 * guarda únicamente su SHA-256, así que una filtración de la tabla no permite
 * reconstruir enlaces válidos. Al pedir uno nuevo se invalidan los anteriores
 * del mismo usuario, y al usarlo se marca `usedAt` para que no sirva dos veces.
 */

const TTL_MS = 1000 * 60 * 60; // 1 hora

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Crea un token para el usuario e invalida los pendientes previos.
 * Devuelve el token EN CLARO (para armar el enlace del correo).
 */
export async function createResetToken(userId: string): Promise<string> {
  const raw = randomBytes(32).toString("base64url");
  await prisma.passwordResetToken.deleteMany({ where: { userId, usedAt: null } });
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + TTL_MS),
    },
  });
  return raw;
}

export type ValidReset = { userId: string; email: string; name: string | null };

/** Valida un token sin consumirlo (para decidir si mostramos el formulario). */
export async function findValidReset(raw: string): Promise<ValidReset | null> {
  if (!raw) return null;
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(raw) },
    include: { user: true },
  });
  if (!row || row.usedAt || row.expiresAt < new Date() || !row.user.isActive) {
    return null;
  }
  return { userId: row.userId, email: row.user.email, name: row.user.name };
}

/** Marca el token como usado (idempotente: solo afecta a los aún no consumidos). */
export async function consumeReset(raw: string): Promise<void> {
  await prisma.passwordResetToken.updateMany({
    where: { tokenHash: hashToken(raw), usedAt: null },
    data: { usedAt: new Date() },
  });
}
