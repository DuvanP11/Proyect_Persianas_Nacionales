"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generateOrderCode } from "@/lib/orders";

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

/**
 * Convierte una cotización en un pedido: resuelve (o crea) el cliente, crea la
 * Order enlazada a la cotización, registra el primer estado en el historial y
 * marca la cotización como CONVERTIDA. Idempotente: si la cotización ya tiene
 * pedido, redirige a él sin duplicar.
 */
export async function convertToOrder(formData: FormData): Promise<void> {
  await requireAdmin();
  const quoteId = String(formData.get("quoteId") ?? "");
  if (!quoteId) return;

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { order: true },
  });
  if (!quote) return;
  if (quote.order) redirect(`/admin/pedidos/${quote.order.id}`);

  // 1) Resolver el cliente: el de la cotización, uno con el mismo correo, o nuevo.
  let customerId = quote.customerId;
  if (!customerId) {
    const email = quote.email.toLowerCase();
    const existing = await prisma.customer.findFirst({ where: { email } });
    if (existing) {
      customerId = existing.id;
    } else {
      const created = await prisma.customer.create({
        data: {
          firstName: quote.firstName,
          lastName: quote.lastName,
          email,
          phone: quote.phone,
          city: quote.city,
          address: quote.address,
          type: "ACTIVO",
        },
      });
      customerId = created.id;
    }
    await prisma.quote.update({ where: { id: quote.id }, data: { customerId } });
  }

  // 2) Crear el pedido + primer registro de historial + marcar la cotización.
  const order = await prisma.order.create({
    data: {
      code: generateOrderCode(),
      customerId,
      quoteId: quote.id,
      status: "RECIBIDO",
      notes: `Generado desde la cotización ${quote.code}`,
      history: {
        create: { status: "RECIBIDO", note: `Pedido creado desde la cotización ${quote.code}` },
      },
    },
  });

  await Promise.all([
    prisma.quote.update({ where: { id: quote.id }, data: { status: "CONVERTIDA" } }),
    prisma.customer.update({ where: { id: customerId }, data: { type: "ACTIVO" } }),
  ]);

  revalidatePath("/admin/cotizaciones");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  revalidatePath("/cuenta");
  redirect(`/admin/pedidos/${order.id}`);
}
