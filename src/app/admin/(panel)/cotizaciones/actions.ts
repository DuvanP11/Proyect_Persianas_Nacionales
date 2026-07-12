"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const ESTADOS = ["NUEVA", "CONTACTADA", "CONVERTIDA", "DESCARTADA"] as const;
type Estado = (typeof ESTADOS)[number];

export async function updateQuoteStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !ESTADOS.includes(status as Estado)) return;

  await prisma.quote.update({
    where: { id },
    data: { status: status as Estado },
  });
  revalidatePath("/admin/cotizaciones");
  revalidatePath("/admin");
}
