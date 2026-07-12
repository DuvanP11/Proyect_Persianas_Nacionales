import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteItem } from "./actions";

export const dynamic = "force-dynamic";

export const CAT_LABEL: Record<string, string> = {
  TELA: "Tela",
  MATERIAL: "Material",
  ACCESORIO: "Accesorio",
  MOTOR: "Motor",
  INSUMO: "Insumo",
};

export default async function InventarioPage() {
  const items = await prisma.inventoryItem.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  const bajos = items.filter((i) => i.stock <= i.minStock).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-cloud">Inventario</h1>
          <p className="mt-1 text-sm text-mist">
            {items.length} {items.length === 1 ? "artículo" : "artículos"}
            {bajos > 0 && <span className="text-red-300"> · {bajos} bajo mínimo</span>}
          </p>
        </div>
        <Link href="/admin/inventario/nuevo" className="rounded-full bg-gradient-to-r from-morado to-naranja px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5">
          + Nuevo artículo
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface/60 p-8 text-center text-sm text-mist">
          No hay artículos. Crea el primero para llevar el control de telas y materiales.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface/40">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-mist-2">
              <tr>
                <th className="px-4 py-3 font-medium">Artículo</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((i) => {
                const low = i.stock <= i.minStock;
                return (
                  <tr key={i.id} className="align-middle hover:bg-ink/50">
                    <td className="px-4 py-3 text-cloud">{i.name}</td>
                    <td className="px-4 py-3 text-mist">{CAT_LABEL[i.category] ?? i.category}</td>
                    <td className="px-4 py-3">
                      <span className={low ? "text-red-300" : "text-cloud"}>
                        {i.stock} {i.unit}
                      </span>
                      {low && <span className="ml-2 rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300">bajo mín. ({i.minStock})</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/inventario/${i.id}`} className="rounded-md border border-line px-3 py-1.5 text-xs text-mist transition hover:border-morado hover:text-cloud">
                          Movimientos
                        </Link>
                        <form action={deleteItem}>
                          <input type="hidden" name="id" value={i.id} />
                          <ConfirmDeleteButton name={i.name} />
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
