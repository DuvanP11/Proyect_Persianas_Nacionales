import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ORDER_META } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      quote: { select: { code: true, productName: true } },
      _count: { select: { history: true } },
    },
  });

  const activos = orders.filter(
    (o) => o.status !== "FINALIZADO" && o.status !== "CANCELADO",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cloud">Pedidos</h1>
        <p className="mt-1 text-sm text-mist">
          {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} · {activos} en proceso.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface/60 p-8 text-center text-sm text-mist">
          Aún no hay pedidos. Conviértelos desde{" "}
          <Link href="/admin/cotizaciones" className="text-morado-light hover:underline">
            Cotizaciones
          </Link>{" "}
          con el botón <span className="text-naranja-light">+ Pedido</span>.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface/40">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-mist-2">
              <tr>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => {
                const m = ORDER_META[o.status] ?? ORDER_META.RECIBIDO;
                return (
                  <tr key={o.id} className="align-middle hover:bg-ink/50">
                    <td className="px-4 py-3 font-mono text-xs text-morado-light">{o.code}</td>
                    <td className="px-4 py-3 text-cloud">
                      {o.customer.firstName} {o.customer.lastName}
                      <span className="block text-xs text-mist-2">{o.customer.phone}</span>
                    </td>
                    <td className="px-4 py-3 text-mist">
                      {o.quote?.productName ?? "—"}
                      {o.quote && (
                        <span className="block font-mono text-xs text-mist-2">cot. {o.quote.code}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-mist-2">
                      {new Date(o.createdAt).toLocaleDateString("es-CO")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs ${m.cls}`}>{m.text}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/pedidos/${o.id}`}
                        className="rounded-md border border-line px-3 py-1.5 text-xs text-mist transition hover:border-morado hover:text-cloud"
                      >
                        Gestionar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
