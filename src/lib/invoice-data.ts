import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { InvoiceView } from "@/lib/invoice";

/**
 * Lectura de facturas — Cortinería Nacional.
 *
 * Traduce la fila de Prisma a la `InvoiceView` que consumen el documento
 * imprimible, el XML, el correo y WhatsApp. Lo comparten el panel y la vista
 * pública del cliente, para que ambos muestren exactamente lo mismo.
 *
 * Compatibilidad: las REMISIONES emitidas antes del módulo de facturación no
 * tienen líneas ni cliente propio (colgaban del pedido). Aquí se les arma una
 * línea única a partir de la cotización de origen, igual que las mostraba la
 * versión anterior del documento. Así ningún documento ya entregado se rompe.
 */

const INVOICE_INCLUDE = {
  customer: true,
  items: { orderBy: { sortOrder: "asc" } },
  order: { include: { customer: true, quote: true } },
} satisfies Prisma.InvoiceInclude;

type InvoiceRow = Prisma.InvoiceGetPayload<{ include: typeof INVOICE_INCLUDE }>;

function toView(row: InvoiceRow): InvoiceView {
  // El cliente propio manda; si no lo hay (remisión antigua), el del pedido.
  const customer = row.customer ?? row.order?.customer ?? null;
  const quote = row.order?.quote ?? null;

  const items: InvoiceView["items"] =
    row.items.length > 0
      ? row.items.map((i) => ({
          id: i.id,
          name: i.name,
          designRef: i.designRef,
          fabric: i.fabric,
          chainSide: i.chainSide,
          widthM: i.widthM,
          heightM: i.heightM,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          accessories: i.accessories,
          installation: i.installation,
          transport: i.transport,
          surcharge: i.surcharge,
          discount: i.discount,
          taxRate: i.taxRate,
          notes: i.notes,
          lineTotal: i.lineTotal,
        }))
      : [
          // Remisión antigua: una sola línea reconstruida desde la cotización.
          {
            id: `${row.id}-legacy`,
            name: quote?.productName ?? "Confección a la medida",
            designRef: null,
            fabric: null,
            chainSide: quote?.chainSide ?? null,
            widthM: null,
            heightM: null,
            quantity: quote?.quantity ?? 1,
            unitPrice: row.amount,
            accessories: 0,
            installation: 0,
            transport: 0,
            surcharge: 0,
            discount: 0,
            taxRate: 0,
            notes: quote?.meters != null ? `${quote.meters} m aprox.` : null,
            lineTotal: row.amount,
          },
        ];

  return {
    id: row.id,
    number: row.number,
    issuedAt: row.issuedAt,
    subtotal: row.subtotal,
    discountTotal: row.discountTotal,
    extrasTotal: row.extrasTotal,
    taxTotal: row.taxTotal,
    amount: row.amount,
    notes: row.notes,
    signature: row.signature,
    signerName: row.signerName,
    signedAt: row.signedAt,
    customer: customer
      ? {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          // La dirección de la cotización es la de instalación y manda sobre
          // la del perfil, que puede ser más antigua.
          address: quote?.address ?? customer.address,
          city: customer.city,
        }
      : null,
    order: row.order ? { code: row.order.code } : null,
    items,
  };
}

/** Una factura por id, ya normalizada. `null` si no existe. */
export async function getInvoice(id: string): Promise<InvoiceView | null> {
  const row = await prisma.invoice.findUnique({ where: { id }, include: INVOICE_INCLUDE });
  return row ? toView(row) : null;
}
