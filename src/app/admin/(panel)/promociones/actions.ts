"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { normalizeCode } from "@/lib/promo";

export type PromoFormState = { error?: string };

export async function savePromo(
  _prev: PromoFormState,
  formData: FormData,
): Promise<PromoFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const code = normalizeCode(String(formData.get("code") ?? ""));
  if (!code) return { error: "El código es obligatorio." };

  const discountPct = Number(formData.get("discountPct") ?? 0);
  if (!Number.isFinite(discountPct) || discountPct <= 0 || discountPct > 100) {
    return { error: "El descuento debe estar entre 1 y 100." };
  }

  const clash = await prisma.promoCode.findUnique({ where: { code } });
  if (clash && clash.id !== id) {
    return { error: `Ya existe un código "${code}".` };
  }

  const validUntilRaw = String(formData.get("validUntil") ?? "").trim();
  const maxUsesRaw = String(formData.get("maxUses") ?? "").trim();

  const data = {
    code,
    discountPct,
    isActive: formData.get("isActive") === "on",
    validUntil: validUntilRaw ? new Date(validUntilRaw) : null,
    maxUses: maxUsesRaw ? Math.max(1, Math.trunc(Number(maxUsesRaw))) : null,
  };

  if (id) {
    await prisma.promoCode.update({ where: { id }, data });
  } else {
    await prisma.promoCode.create({ data });
  }

  revalidatePath("/admin/promociones");
  redirect("/admin/promociones");
}

export async function togglePromoActive(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const promo = await prisma.promoCode.findUnique({ where: { id } });
  if (!promo) return;
  await prisma.promoCode.update({ where: { id }, data: { isActive: !promo.isActive } });
  revalidatePath("/admin/promociones");
}

export async function deletePromo(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.promoCode.delete({ where: { id } });
  revalidatePath("/admin/promociones");
}
