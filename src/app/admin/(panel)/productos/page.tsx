import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/utils";
import { ConfirmDeleteButton } from "./ConfirmDeleteButton";
import {
  deleteProduct,
  toggleProductActive,
  toggleProductFeatured,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  const productos = await prisma.product.findMany({
    orderBy: [{ isFeatured: "desc" }, { createdAt: "asc" }],
    include: { _count: { select: { media: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-cloud">Productos</h1>
          <p className="mt-1 text-sm text-mist">
            {productos.length} {productos.length === 1 ? "producto" : "productos"} en el catálogo.
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-gradient-to-r from-morado to-naranja px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-morado/25 transition-all hover:-translate-y-0.5"
        >
          + Nuevo producto
        </Link>
      </div>

      {productos.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface/60 p-8 text-center text-sm text-mist">
          No hay productos. Crea el primero o corre <code className="text-morado-light">npm run seed:products</code>.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface/40">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-mist-2">
              <tr>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Precio/m</th>
                <th className="px-4 py-3 font-medium">Fotos</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {productos.map((p) => (
                <tr key={p.id} className="align-middle hover:bg-ink/50">
                  <td className="px-4 py-3">
                    <p className="text-cloud">{p.name}</p>
                    <p className="font-mono text-xs text-mist-2">/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-mist">
                    {p.pricePerMeter ? formatCOP(p.pricePerMeter) : <span className="text-mist-2">Cotiza</span>}
                  </td>
                  <td className="px-4 py-3 text-mist">{p._count.media}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <form action={toggleProductActive}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className={`rounded-full px-2.5 py-0.5 text-xs transition ${
                            p.isActive
                              ? "bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30"
                              : "bg-white/5 text-mist-2 hover:bg-white/10"
                          }`}
                        >
                          {p.isActive ? "Activo" : "Oculto"}
                        </button>
                      </form>
                      <form action={toggleProductFeatured}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className={`rounded-full px-2.5 py-0.5 text-xs transition ${
                            p.isFeatured
                              ? "bg-naranja/20 text-naranja-light hover:bg-naranja/30"
                              : "bg-white/5 text-mist-2 hover:bg-white/10"
                          }`}
                        >
                          {p.isFeatured ? "★ Destacado" : "☆ Normal"}
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="rounded-md border border-line px-3 py-1.5 text-xs text-mist transition hover:border-morado hover:text-cloud"
                      >
                        Editar
                      </Link>
                      <form
                        action={deleteProduct}
                        // Confirmación nativa antes de borrar (progressive enhancement).
                      >
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmDeleteButton name={p.name} />
                      </form>
                    </div>
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
