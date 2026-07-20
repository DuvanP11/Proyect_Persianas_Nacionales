import Link from "next/link";
import { Plus } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/utils";
import { deleteInvoice } from "./actions";

export const dynamic = "force-dynamic";

/**
 * Listado de facturas del panel.
 *
 * Muestra tanto las facturas armadas aquí (FAC-…) como las remisiones
 * generadas desde un pedido (REM-…): son el mismo documento en la base de
 * datos y conviene verlas juntas.
 */
export default async function FacturasPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { issuedAt: "desc" },
    include: {
      customer: true,
      order: { include: { customer: true } },
      _count: { select: { items: true } },
    },
  });

  const total = invoices.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cloud">Facturación</h1>
          <p className="mt-1 text-sm text-mist-2">
            {invoices.length} documento{invoices.length === 1 ? "" : "s"} · {formatCOP(total)}{" "}
            facturado
          </p>
        </div>
        <Link
          href="/admin/facturas/nueva"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-morado to-naranja px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-morado/25 transition-all hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> Nueva factura
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface/40 p-10 text-center">
          <p className="text-mist">Todavía no hay facturas.</p>
          <p className="mt-1 text-sm text-mist-2">
            Crea la primera con el botón “Nueva factura”: puedes armarla desde el catálogo
            y enviarla al cliente por WhatsApp o correo.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface/60">
          <table className="w-full min-w-[46rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-mist-2">
                <th className="px-4 py-3 font-medium">Número</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 text-center font-medium">Ítems</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                // Las remisiones antiguas no tienen cliente propio: cuelga del pedido.
                const customer = invoice.customer ?? invoice.order?.customer ?? null;
                return (
                  <tr key={invoice.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/facturas/${invoice.id}`}
                        className="font-mono text-morado-light hover:underline"
                      >
                        {invoice.number}
                      </Link>
                      {invoice.order && (
                        <span className="block text-xs text-mist-2">
                          Pedido {invoice.order.code}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-cloud">
                      {customer ? (
                        <>
                          {customer.firstName} {customer.lastName}
                          <span className="block text-xs text-mist-2">{customer.phone}</span>
                        </>
                      ) : (
                        <span className="text-mist-2">Consumidor final</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-mist">
                      {new Date(invoice.issuedAt).toLocaleDateString("es-CO")}
                    </td>
                    <td className="px-4 py-3 text-center text-mist">
                      {invoice._count.items || 1}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-cloud">
                      {formatCOP(invoice.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/facturas/${invoice.id}`}
                          className="rounded-md border border-line px-2.5 py-1 text-xs text-mist transition hover:border-morado hover:text-cloud"
                        >
                          Ver
                        </Link>
                        <form action={deleteInvoice}>
                          <input type="hidden" name="id" value={invoice.id} />
                          <ConfirmDeleteButton
                            name={invoice.number}
                            message={`¿Eliminar la factura ${invoice.number}? Esta acción no se puede deshacer.`}
                          />
                        </form>
                      </div>
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
