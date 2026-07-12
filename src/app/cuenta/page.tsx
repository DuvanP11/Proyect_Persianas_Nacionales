import Link from "next/link";
import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_META } from "@/lib/order-status";
import { logoutCustomer } from "./actions";

export const dynamic = "force-dynamic";

const QUOTE_LABEL: Record<string, { text: string; cls: string }> = {
  NUEVA: { text: "Recibida", cls: "bg-morado/15 text-morado-light" },
  CONTACTADA: { text: "En contacto", cls: "bg-naranja/15 text-naranja-light" },
  CONVERTIDA: { text: "Convertida", cls: "bg-emerald-600/20 text-emerald-300" },
  DESCARTADA: { text: "Descartada", cls: "bg-white/5 text-mist-2" },
};

export default async function CuentaPage() {
  const session = await requireCustomer();

  const customer = await prisma.customer.findFirst({
    where: { OR: [{ userId: session.uid }, { email: session.email }] },
  });

  const [quotes, orders] = await Promise.all([
    prisma.quote.findMany({
      where: { email: session.email },
      orderBy: { createdAt: "desc" },
    }),
    customer
      ? prisma.order.findMany({
          where: { customerId: customer.id },
          orderBy: { createdAt: "desc" },
          include: { history: { orderBy: { createdAt: "desc" }, take: 1 } },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="pt-28 md:pt-36">
      <div className="container-app pb-16">
        {/* Encabezado */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-morado-light">Mi cuenta</span>
            <h1 className="mt-2 font-display text-4xl font-semibold text-cloud">
              Hola, {session.name?.split(" ")[0] ?? "cliente"}
            </h1>
            <p className="mt-1 text-mist">{session.email}</p>
          </div>
          <form action={logoutCustomer}>
            <button className="rounded-full border border-line px-5 py-2.5 text-sm text-mist transition hover:border-red-500/50 hover:text-red-300">
              Cerrar sesión
            </button>
          </form>
        </div>

        {/* Perfil */}
        {customer && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-line bg-surface/60 p-5">
              <p className="text-xs uppercase tracking-wide text-mist-2">Nombre</p>
              <p className="mt-1 text-cloud">{customer.firstName} {customer.lastName}</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface/60 p-5">
              <p className="text-xs uppercase tracking-wide text-mist-2">Teléfono</p>
              <p className="mt-1 text-cloud">{customer.phone}</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface/60 p-5">
              <p className="text-xs uppercase tracking-wide text-mist-2">Cotizaciones</p>
              <p className="mt-1 font-display text-2xl text-cloud">{quotes.length}</p>
            </div>
          </div>
        )}

        {/* Cotizaciones */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-cloud">Mis cotizaciones</h2>
            <Link href="/cotizar" className="rounded-full bg-gradient-to-r from-morado to-naranja px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5">
              Nueva cotización
            </Link>
          </div>

          {quotes.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-line bg-surface/60 p-8 text-center text-sm text-mist">
              Todavía no tienes cotizaciones. Cuando solicites una con este correo, aparecerá aquí.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface/40">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-line text-xs uppercase tracking-wider text-mist-2">
                  <tr>
                    <th className="px-4 py-3 font-medium">Código</th>
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {quotes.map((q) => {
                    const s = QUOTE_LABEL[q.status] ?? QUOTE_LABEL.NUEVA;
                    return (
                      <tr key={q.id} className="hover:bg-ink/50">
                        <td className="px-4 py-3 font-mono text-xs text-morado-light">{q.code}</td>
                        <td className="px-4 py-3 text-cloud">
                          {q.productName}
                          <span className="block text-xs text-mist-2">Cant: {q.quantity}{q.meters != null ? ` · ${q.meters} m` : ""}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-mist-2">{new Date(q.createdAt).toLocaleDateString("es-CO")}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs ${s.cls}`}>{s.text}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Pedidos */}
        <section className="mt-12">
          <h2 className="font-display text-2xl text-cloud">Mis pedidos</h2>
          {orders.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-line bg-surface/60 p-8 text-center text-sm text-mist">
              Aún no tienes pedidos en proceso. Cuando una cotización se convierta en pedido, podrás seguir su estado aquí.
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {orders.map((o) => {
                const m = ORDER_META[o.status] ?? ORDER_META.RECIBIDO;
                const last = o.history[0];
                return (
                  <li key={o.id} className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface/60 p-5">
                    <div>
                      <p className="font-mono text-xs text-morado-light">{o.code}</p>
                      <p className="text-xs text-mist-2">
                        Pedido del {new Date(o.createdAt).toLocaleDateString("es-CO")}
                      </p>
                      {last?.note && <p className="mt-1 text-xs text-mist">{last.note}</p>}
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-sm ${m.cls}`}>{m.text}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
