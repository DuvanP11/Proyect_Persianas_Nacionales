import { prisma, hasDatabase } from "@/lib/prisma";

/** Normaliza un código promocional: mayúsculas, sin espacios ni símbolos. */
export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export type PromoValidation =
  | { valid: true; code: string; discountPct: number }
  | { valid: false; reason: string };

/**
 * Valida un código promocional contra la base de datos: activo, vigente y con
 * usos disponibles. No consume el uso (eso ocurre al concretar el pedido).
 */
export async function validatePromo(rawCode: string): Promise<PromoValidation> {
  const code = normalizeCode(rawCode);
  if (!code) return { valid: false, reason: "Código vacío" };
  if (!hasDatabase) return { valid: false, reason: "No disponible" };

  try {
    const promo = await prisma.promoCode.findUnique({ where: { code } });
    if (!promo || !promo.isActive) return { valid: false, reason: "Código no válido" };
    if (promo.validUntil && promo.validUntil.getTime() < Date.now()) {
      return { valid: false, reason: "Código vencido" };
    }
    if (promo.maxUses != null && promo.uses >= promo.maxUses) {
      return { valid: false, reason: "Código agotado" };
    }
    return { valid: true, code: promo.code, discountPct: promo.discountPct };
  } catch {
    return { valid: false, reason: "No disponible" };
  }
}
