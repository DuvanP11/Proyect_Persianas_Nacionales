import Link from "next/link";
import { toChainSide } from "@/lib/chain-side";
import { emptyLine, type InvoiceLineInput } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";
import {
  InvoiceBuilder,
  type InvoiceCustomerOption,
  type InvoiceOrderContext,
  type InvoiceProductOption,
} from "../InvoiceBuilder";

export const dynamic = "force-dynamic";

/**
 * Alta de una factura nueva.
 *
 * Carga en el servidor el catálogo y la lista de clientes; el constructor
 * (componente cliente) hace la búsqueda y el recálculo sin volver a pedir datos.
 *
 * Con `?pedido=<id>` factura un pedido concreto: el cliente queda fijado al del
 * pedido y la primera línea llega precargada desde la cotización de origen.
 */
export default async function NuevaFacturaPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string }>;
}) {
  const { pedido } = await searchParams;

  const [products, customers] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        designRef: true,
        fabric: true,
        allowChainSide: true,
        pricePerMeter: true,
      },
    }),
    prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        city: true,
      },
    }),
  ]);

  const customerOptions: InvoiceCustomerOption[] = customers.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`.trim(),
    email: c.email,
    phone: c.phone,
    city: c.city,
  }));

  const order = pedido ? await buildOrderContext(pedido, products) : null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={order ? `/admin/pedidos/${order.id}` : "/admin/facturas"}
          className="text-sm text-mist transition hover:text-cloud"
        >
          ← Volver {order ? "al pedido" : "a facturación"}
        </Link>
        <h1 className="mt-2 font-display text-3xl text-cloud">
          {order ? `Facturar pedido ${order.code}` : "Nueva factura"}
        </h1>
        <p className="mt-1 text-sm text-mist-2">
          {order
            ? "Revisa la línea precargada, ajusta precios y extras, y genera la factura."
            : "Escoge el cliente, agrega los productos con sus extras y el total se calcula solo."}
        </p>
      </div>

      <InvoiceBuilder
        products={products as InvoiceProductOption[]}
        customers={customerOptions}
        order={order}
      />
    </div>
  );
}

/**
 * Arma el contexto de "facturar un pedido": cliente fijo y primera línea
 * precargada desde la cotización.
 *
 * El producto se busca por NOMBRE porque la cotización guarda el nombre en
 * texto, no el id (así sobrevive a que el producto se renombre o se borre del
 * catálogo). Si no hay coincidencia, la línea igual se crea con el nombre y el
 * administrador completa el resto a mano.
 */
async function buildOrderContext(
  orderId: string,
  products: { id: string; name: string; designRef: string | null; fabric: string | null; pricePerMeter: number | null }[],
): Promise<InvoiceOrderContext | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true, quote: true },
  });
  if (!order) return null;

  const quote = order.quote;
  const matched = quote
    ? products.find((p) => p.name.toLowerCase() === quote.productName.toLowerCase())
    : undefined;

  const quantity = quote?.quantity ?? 1;
  // Si el pedido ya trae un total, se reparte entre las unidades como precio
  // unitario de partida; si no, se cae al precio por metro del catálogo.
  const unitPrice =
    order.total > 0
      ? Math.round(order.total / Math.max(1, quantity))
      : matched?.pricePerMeter ?? 0;

  const line: InvoiceLineInput = {
    ...emptyLine(),
    productId: matched?.id ?? null,
    name: quote?.productName ?? "Confección a la medida",
    designRef: matched?.designRef ?? "",
    fabric: matched?.fabric ?? "",
    chainSide: toChainSide(quote?.chainSide),
    quantity,
    unitPrice,
    notes: quote?.meters != null ? `${quote.meters} m aprox.` : "",
  };

  return {
    id: order.id,
    code: order.code,
    customerId: order.customerId,
    customerName: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
    customerPhone: order.customer.phone,
    customerEmail: order.customer.email,
    quoteCode: quote?.code ?? null,
    lines: [line],
  };
}
