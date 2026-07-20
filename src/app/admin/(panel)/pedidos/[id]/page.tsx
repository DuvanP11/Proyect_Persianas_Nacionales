import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { chainSideLabel } from "@/lib/chain-side";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus, generateInvoice } from "../actions";
import { ORDER_STATUSES, ORDER_META } from "@/lib/order-status";
import { buildOrderStatusWhatsAppText } from "@/lib/order-notify";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { formatCOP } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      quote: true,
      history: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) notFound();

  const m = ORDER_META[order.status] ?? ORDER_META.RECIBIDO;

  // URL absoluta del sitio (para compartir el enlace de la remisión).
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const base = host ? `${proto}://${host}` : "";

  const waDigits = order.customer.phone.replace(/\D/g, "");
  const waFull = waDigits.startsWith("57") ? waDigits : `57${waDigits}`;

  // Enlace wa.me de respaldo con el aviso del estado actual (envío manual).
  const statusWaText = buildOrderStatusWhatsAppText({
    code: order.code,
    status: order.status,
    firstName: order.customer.firstName,
    email: order.customer.email,
    phone: order.customer.phone,
    productName: order.quote?.productName ?? null,
    note: null,
  });
  const statusWaLink = `https://wa.me/${waFull}?text=${encodeURIComponent(statusWaText)}`;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/pedidos" className="text-sm text-mist transition hover:text-cloud">
          ← Volver a pedidos
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-cloud">Pedido {order.code}</h1>
          <span className={`rounded-full px-3 py-1 text-sm ${m.cls}`}>{m.text}</span>
        </div>
      </div>

      {/* Línea de tiempo del pedido */}
      <div className="rounded-2xl border border-line bg-surface/60 p-5">
        <OrderTimeline status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Datos */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface/60 p-5">
            <h2 className="mb-3 font-display text-lg text-cloud">Cliente</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-mist-2">Nombre</dt>
                <dd className="text-cloud">{order.customer.firstName} {order.customer.lastName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mist-2">Teléfono</dt>
                <dd className="text-cloud">{order.customer.phone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mist-2">Correo</dt>
                <dd className="text-cloud">{order.customer.email}</dd>
              </div>
              {order.customer.city && (
                <div className="flex justify-between gap-4">
                  <dt className="text-mist-2">Ciudad</dt>
                  <dd className="text-cloud">{order.customer.city}</dd>
                </div>
              )}
            </dl>
          </div>

          {order.quote && (
            <div className="rounded-2xl border border-line bg-surface/60 p-5">
              <h2 className="mb-3 font-display text-lg text-cloud">Cotización origen</h2>
              <p className="text-sm text-cloud">{order.quote.productName}</p>
              <p className="mt-1 text-xs text-mist-2">
                {order.quote.code} · Cant: {order.quote.quantity}
                {order.quote.meters != null ? ` · ${order.quote.meters} m` : ""}
              </p>
              {chainSideLabel(order.quote.chainSide) && (
                <p className="mt-1 text-xs text-mist">
                  Mando: {chainSideLabel(order.quote.chainSide)}
                </p>
              )}
              {order.quote.address && (
                <p className="mt-2 text-xs text-mist">Dirección: {order.quote.address}</p>
              )}
              {order.quote.comments && (
                <p className="mt-2 text-xs text-mist">“{order.quote.comments}”</p>
              )}
            </div>
          )}

          {/* Cambiar estado */}
          <div className="rounded-2xl border border-line bg-surface/60 p-5">
            <h2 className="mb-3 font-display text-lg text-cloud">Actualizar estado</h2>
            <form action={updateOrderStatus} className="space-y-3">
              <input type="hidden" name="id" value={order.id} />
              <select
                name="status"
                defaultValue={order.status}
                className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cloud outline-none focus:border-morado"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_META[s]?.text ?? s}
                  </option>
                ))}
              </select>
              <input
                name="note"
                placeholder="Nota opcional (ej: entregado a mensajería)"
                className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cloud outline-none focus:border-morado"
              />
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-morado to-naranja px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5"
              >
                Guardar estado
              </button>
              <p className="text-xs text-mist-2">
                Al cambiar el estado se notifica automáticamente al cliente por
                correo y WhatsApp.
              </p>
            </form>

            {/* Respaldo: enviar el aviso del estado actual por WhatsApp a mano */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
              <span className="text-xs text-mist-2">Envío manual de respaldo:</span>
              <a
                href={statusWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366]/15 px-3 py-1.5 text-xs text-emerald-300 transition hover:bg-[#25D366]/25"
              >
                Avisar por WhatsApp ({m.text})
              </a>
            </div>
          </div>

          {/* Facturación */}
          <div className="rounded-2xl border border-line bg-surface/60 p-5">
            <h2 className="mb-3 font-display text-lg text-cloud">Remisión / factura</h2>
            {order.invoices.length > 0 && (
              <ul className="mb-3 space-y-2">
                {order.invoices.map((inv) => {
                  const link = `${base}/factura/${inv.id}`;
                  const msg = `Hola ${order.customer.firstName}, aquí está tu remisión ${inv.number} de Cortinería Nacional por ${formatCOP(inv.amount)}: ${link}`;
                  const wa = `https://wa.me/${waFull}?text=${encodeURIComponent(msg)}`;
                  const mail = `mailto:${order.customer.email}?subject=${encodeURIComponent(`Remisión ${inv.number} — Cortinería Nacional`)}&body=${encodeURIComponent(msg)}`;
                  return (
                    <li key={inv.id} className="rounded-lg border border-line bg-ink/40 px-3 py-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-morado-light">{inv.number}</span>
                        <span className="text-cloud">{formatCOP(inv.amount)}</span>
                        <a
                          href={`/admin/facturas/${inv.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md border border-line px-2.5 py-1 text-xs text-mist transition hover:border-morado hover:text-cloud"
                        >
                          Ver / imprimir
                        </a>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 border-t border-line pt-2">
                        <span className="text-xs text-mist-2">Compartir con el cliente:</span>
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md bg-[#25D366]/15 px-2.5 py-1 text-xs text-emerald-300 transition hover:bg-[#25D366]/25"
                        >
                          WhatsApp
                        </a>
                        <a
                          href={mail}
                          className="rounded-md bg-morado/15 px-2.5 py-1 text-xs text-morado-light transition hover:bg-morado/25"
                        >
                          Correo
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {/* Camino recomendado: factura completa con líneas, extras e IVA. */}
            <Link
              href={`/admin/facturas/nueva?pedido=${order.id}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-morado to-naranja px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-morado/25 transition-all hover:-translate-y-0.5"
            >
              Facturar este pedido
            </Link>
            <p className="mt-2 text-xs text-mist-2">
              Abre el constructor con el cliente y el producto ya cargados.
            </p>

            {/* Atajo histórico: remisión de una línea con el monto a mano. Se
                conserva para cuando solo hace falta un comprobante rápido. */}
            <details className="mt-4 border-t border-line pt-3">
              <summary className="cursor-pointer text-xs text-mist-2 transition hover:text-mist">
                Generar remisión rápida (solo monto)
              </summary>
              <form action={generateInvoice} className="mt-3 flex gap-2">
                <input type="hidden" name="orderId" value={order.id} />
                <input
                  name="amount"
                  inputMode="numeric"
                  placeholder="Monto total (COP)"
                  defaultValue={order.total || ""}
                  className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cloud outline-none focus:border-morado"
                />
                <button className="shrink-0 rounded-full border border-morado/50 px-4 py-2 text-sm text-morado-light transition hover:bg-morado/10">
                  Generar
                </button>
              </form>
            </details>
          </div>
        </div>

        {/* Línea de tiempo */}
        <div className="rounded-2xl border border-line bg-surface/60 p-5">
          <h2 className="mb-4 font-display text-lg text-cloud">Seguimiento</h2>
          <ol className="relative space-y-5 border-l border-line pl-6">
            {order.history.map((h, i) => {
              const hm = ORDER_META[h.status] ?? ORDER_META.RECIBIDO;
              return (
                <li key={h.id} className="relative">
                  <span
                    className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-surface ${
                      i === 0 ? "bg-naranja" : "bg-morado"
                    }`}
                  />
                  <p className="text-sm text-cloud">{hm.text}</p>
                  {h.note && <p className="text-xs text-mist">{h.note}</p>}
                  <p className="mt-0.5 text-xs text-mist-2">
                    {new Date(h.createdAt).toLocaleString("es-CO")}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
