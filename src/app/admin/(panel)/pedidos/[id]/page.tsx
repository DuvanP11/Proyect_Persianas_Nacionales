import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "../actions";
import { ORDER_STATUSES, ORDER_META } from "@/lib/order-status";

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
    },
  });
  if (!order) notFound();

  const m = ORDER_META[order.status] ?? ORDER_META.RECIBIDO;

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
            </form>
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
