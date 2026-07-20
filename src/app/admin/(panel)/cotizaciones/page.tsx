import Link from "next/link";
import { chainSideLabel } from "@/lib/chain-side";
import { prisma } from "@/lib/prisma";
import { updateQuoteStatus, convertToOrder } from "./actions";

export const dynamic = "force-dynamic";

const ESTADOS = ["NUEVA", "CONTACTADA", "CONVERTIDA", "DESCARTADA"] as const;

function waLink(phone: string, code: string): string {
  const digits = phone.replace(/\D/g, "");
  const full = digits.startsWith("57") ? digits : `57${digits}`;
  const msg = encodeURIComponent(
    `Hola, le escribimos de Cortinería Nacional por su cotización ${code}.`,
  );
  return `https://wa.me/${full}?text=${msg}`;
}

export default async function CotizacionesPage() {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cloud">Cotizaciones</h1>
        <p className="mt-1 text-sm text-mist">
          {quotes.length} {quotes.length === 1 ? "registro" : "registros"} en total.
        </p>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface/60 p-8 text-center text-sm text-mist">
          Todavía no hay cotizaciones. Prueba enviando el formulario desde el sitio.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface/40">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-mist-2">
              <tr>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Ciudad</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {quotes.map((q) => (
                <tr key={q.id} className="align-top hover:bg-ink/50">
                  <td className="px-4 py-3 font-mono text-xs text-morado-light">{q.code}</td>
                  <td className="px-4 py-3">
                    <p className="text-cloud">
                      {q.firstName} {q.lastName}
                    </p>
                    <p className="text-xs text-mist-2">{q.email}</p>
                    {q.comments && (
                      <p className="mt-1 max-w-[220px] text-xs text-mist">“{q.comments}”</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-mist">
                    {q.productName}
                    <span className="block text-xs text-mist-2">
                      Cant: {q.quantity}
                      {q.meters != null ? ` · ${q.meters} m` : ""}
                      {q.discountPct ? ` · -${q.discountPct}%` : ""}
                      {chainSideLabel(q.chainSide)
                        ? ` · ${chainSideLabel(q.chainSide)}`
                        : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-mist">{q.city}</td>
                  <td className="px-4 py-3 text-xs text-mist-2">
                    {new Date(q.createdAt).toLocaleDateString("es-CO")}
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateQuoteStatus} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={q.id} />
                      <select
                        name="status"
                        defaultValue={q.status}
                        className="rounded-md border border-line bg-ink px-2 py-1 text-xs text-cloud outline-none focus:border-morado"
                      >
                        {ESTADOS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-md border border-line px-2 py-1 text-xs text-mist transition hover:border-morado hover:text-cloud"
                      >
                        ✓
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    {q.order ? (
                      <Link
                        href={`/admin/pedidos/${q.order.id}`}
                        className="rounded-md bg-morado/15 px-2.5 py-1 text-xs text-morado-light transition hover:bg-morado/25"
                      >
                        {q.order.code} →
                      </Link>
                    ) : (
                      <form action={convertToOrder}>
                        <input type="hidden" name="quoteId" value={q.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-naranja/40 bg-naranja/10 px-2.5 py-1 text-xs text-naranja-light transition hover:bg-naranja/20"
                        >
                          + Pedido
                        </button>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <a
                        href={waLink(q.phone, q.code)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md bg-emerald-600/20 px-2.5 py-1 text-xs text-emerald-300 transition hover:bg-emerald-600/30"
                      >
                        WhatsApp
                      </a>
                      <a
                        href={`mailto:${q.email}?subject=${encodeURIComponent(`Tu cotización ${q.code} — Cortinería Nacional`)}&body=${encodeURIComponent(`Hola ${q.firstName}, le escribimos de Cortinería Nacional respecto a su cotización ${q.code} (${q.productName}).`)}`}
                        className="rounded-md bg-morado/15 px-2.5 py-1 text-xs text-morado-light transition hover:bg-morado/25"
                      >
                        Correo
                      </a>
                    </div>
                    <span className="mt-1 block text-xs text-mist-2">{q.phone}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
