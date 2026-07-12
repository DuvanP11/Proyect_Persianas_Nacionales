import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteCategory, toggleCategoryActive } from "./actions";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const categorias = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-cloud">Categorías</h1>
          <p className="mt-1 text-sm text-mist">
            {categorias.length} {categorias.length === 1 ? "categoría" : "categorías"}. Sirven para
            agrupar los productos del catálogo.
          </p>
        </div>
        <Link
          href="/admin/categorias/nuevo"
          className="rounded-full bg-gradient-to-r from-morado to-naranja px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-morado/25 transition-all hover:-translate-y-0.5"
        >
          + Nueva categoría
        </Link>
      </div>

      {categorias.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface/60 p-8 text-center text-sm text-mist">
          Todavía no hay categorías. Crea la primera para empezar a agrupar productos.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface/40">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-mist-2">
              <tr>
                <th className="px-4 py-3 font-medium">Orden</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Productos</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {categorias.map((c) => (
                <tr key={c.id} className="align-middle hover:bg-ink/50">
                  <td className="px-4 py-3 text-mist-2">{c.sortOrder}</td>
                  <td className="px-4 py-3">
                    <p className="text-cloud">{c.name}</p>
                    <p className="font-mono text-xs text-mist-2">/{c.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-mist">{c._count.products}</td>
                  <td className="px-4 py-3">
                    <form action={toggleCategoryActive}>
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        className={`rounded-full px-2.5 py-0.5 text-xs transition ${
                          c.isActive
                            ? "bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30"
                            : "bg-white/5 text-mist-2 hover:bg-white/10"
                        }`}
                      >
                        {c.isActive ? "Activa" : "Oculta"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/categorias/${c.id}`}
                        className="rounded-md border border-line px-3 py-1.5 text-xs text-mist transition hover:border-morado hover:text-cloud"
                      >
                        Editar
                      </Link>
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={c.id} />
                        <ConfirmDeleteButton
                          name={c.name}
                          message={
                            c._count.products > 0
                              ? `¿Eliminar "${c.name}"? Sus ${c._count.products} producto(s) quedarán sin categoría (no se borran).`
                              : `¿Eliminar "${c.name}"? Esta acción no se puede deshacer.`
                          }
                        />
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
