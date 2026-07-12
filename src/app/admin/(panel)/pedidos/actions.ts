"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";

/** Cambia el estado del pedido y lo registra en el historial (si cambió). */
export async function updateOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!id || !ORDER_STATUSES.includes(status as OrderStatus)) return;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return;

  // Si el estado no cambió pero hay nota, igual se registra como comentario.
  if (order.status === status && !note) return;

  await prisma.order.update({
    where: { id },
    data: {
      status: status as OrderStatus,
      history: { create: { status: status as OrderStatus, note } },
    },
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin");
  revalidatePath("/cuenta");
}
