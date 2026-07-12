import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { togglePromoActive, deletePromo } from "./actions";

export const dynamic = "force-dynamic";

function estadoVigencia(p: {
  isActive: boolean;
  validUntil: Date | null;
  maxUses: number | null;
  uses: number;
}): { text: string; ok: boolean } {
  if (!p.isActive) return { text: "Inactivo", ok: false };
  if (p.validUntil && p.validUntil.getTime() < Date.now()) return { text: "Vencido", ok: false };
  if (p.maxUses != null && p.uses >= p.maxUses) return { text: "Agotado", ok: false };
  return { text: "Vigente", ok: true };
}

export default async function PromocionesPage() {
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-cloud">Códigos promo</h1>
          <p className="mt-1 text-sm text-mist">
            {promos.length} {promos.length === 1 ? "código" : "códigos"}. Se validan en el formulario de cotización.
          </p>
        </div>
        <Link href="/admin/promociones/nuevo" className="rounded-full bg-gradient-to-r from-morado to-naranja px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5">
          + Nuevo código
        </Link>
      </div>

      {promos.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface/60 p-8 text-center text-sm text-mist">
          No hay códigos. Crea el primero para ofrecer descuentos por volante.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface/40">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-mist-2">
              <tr>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Descuento</th>
                <th className="px-4 py-3 font-medium">Vigencia</th>
                <th className="px-4 py-3 font-medium">Usos</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {promos.map((p) => {
                const v = estadoVigencia(p);
                return (
                  <tr key={p.id} className="align-middle hover:bg-ink/50">
                    <td className="px-4 py-3 font-mono text-morado-light">{p.code}</td>
                    <td className="px-4 py-3 text-cloud">{p.discountPct}%</td>
                    <td className="px-4 py-3 text-xs text-mist-2">
                      {p.validUntil ? new Date(p.validUntil).toLocaleDateString("es-CO") : "Sin límite"}
                    </td>
                    <td className="px-4 py-3 text-mist">
                      {p.uses}{p.maxUses != null ? ` / ${p.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <form action={togglePromoActive}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className={`rounded-full px-2.5 py-0.5 text-xs transition ${v.ok ? "bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30" : "bg-white/5 text-mist-2 hover:bg-white/10"}`}>
                          {v.text}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/promociones/${p.id}`} className="rounded-md border border-line px-3 py-1.5 text-xs text-mist transition hover:border-morado hover:text-cloud">
                          Editar
                        </Link>
                        <form action={deletePromo}>
                          <input type="hidden" name="id" value={p.id} />
                          <ConfirmDeleteButton name={`el código ${p.code}`} />
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
