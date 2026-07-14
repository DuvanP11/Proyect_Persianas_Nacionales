"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";
import { notifyOrderStatus } from "@/lib/order-notify";

/** Cambia el estado del pedido y lo registra en el historial (si cambió). */
export async function updateOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!id || !ORDER_STATUSES.includes(status as OrderStatus)) return;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, quote: true },
  });
  if (!order) return;

  // Si el estado no cambió pero hay nota, igual se registra como comentario.
  if (order.status === status && !note) return;

  const statusChanged = order.status !== status;

  await prisma.order.update({
    where: { id },
    data: {
      status: status as OrderStatus,
      history: { create: { status: status as OrderStatus, note } },
    },
  });

  // Notifica al cliente por correo + WhatsApp solo cuando el estado cambia.
  // Best-effort: si falla la notificación, el cambio de estado ya quedó guardado.
  if (statusChanged) {
    await notifyOrderStatus({
      code: order.code,
      status: status as OrderStatus,
      firstName: order.customer.firstName,
      email: order.customer.email,
      phone: order.customer.phone,
      productName: order.quote?.productName ?? null,
      note,
    });
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin");
  revalidatePath("/cuenta");
}

/** Genera una remisión/factura para el pedido con un monto y redirige a imprimirla. */
export async function generateInvoice(formData: FormData): Promise<void> {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const amount = Math.max(0, Math.round(Number(formData.get("amount") ?? 0) || 0));
  if (!orderId) return;

  const count = await prisma.invoice.count();
  const number = `REM-${String(count + 1).padStart(5, "0")}`;

  const invoice = await prisma.invoice.create({
    data: { number, orderId, amount },
  });

  // Si el pedido no tenía total, se guarda el de la remisión.
  await prisma.order.update({
    where: { id: orderId },
    data: { total: amount },
  });

  revalidatePath(`/admin/pedidos/${orderId}`);
  redirect(`/admin/facturas/${invoice.id}`);
}
