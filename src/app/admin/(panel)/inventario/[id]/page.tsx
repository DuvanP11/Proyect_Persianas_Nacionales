import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ItemForm, type ItemFormValues } from "../ItemForm";
import { registerMovement } from "../actions";
import { CAT_LABEL } from "../page";

export const dynamic = "force-dynamic";

const input =
  "w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cloud outline-none focus:border-morado";

export default async function InventarioItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    include: { movements: { orderBy: { createdAt: "desc" }, take: 50 } },
  });
  if (!item) notFound();

  const initial: ItemFormValues = {
    id: item.id,
    name: item.name,
    category: item.category,
    unit: item.unit,
    stock: String(item.stock),
    minStock: String(item.minStock),
  };
  const low = item.stock <= item.minStock;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/inventario" className="text-sm text-mist transition hover:text-cloud">
          ← Volver a inventario
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-cloud">{item.name}</h1>
          <span className={`rounded-full px-3 py-1 text-sm ${low ? "bg-red-500/15 text-red-300" : "bg-emerald-600/20 text-emerald-300"}`}>
            {item.stock} {item.unit}
          </span>
          <span className="text-sm text-mist-2">{CAT_LABEL[item.category] ?? item.category}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          {/* Registrar movimiento */}
          <div className="rounded-2xl border border-line bg-surface/60 p-5">
            <h2 className="mb-3 font-display text-lg text-cloud">Registrar movimiento</h2>
            <form action={registerMovement} className="space-y-3">
              <input type="hidden" name="itemId" value={item.id} />
              <div className="grid grid-cols-2 gap-3">
                <select name="type" defaultValue="ENTRADA" className={input}>
                  <option value="ENTRADA">Entrada (+)</option>
                  <option value="SALIDA">Salida (−)</option>
                </select>
                <input name="quantity" inputMode="decimal" placeholder="Cantidad" required className={input} />
              </div>
              <input name="reason" placeholder="Motivo (ej: compra, pedido CN-XXXX)" className={input} />
              <button className="rounded-full bg-gradient-to-r from-morado to-naranja px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5">
                Registrar
              </button>
            </form>
          </div>

          {/* Editar artículo */}
          <div className="rounded-2xl border border-line bg-surface/60 p-5">
            <h2 className="mb-3 font-display text-lg text-cloud">Editar artículo</h2>
            <ItemForm initial={initial} />
          </div>
        </div>

        {/* Historial */}
        <div className="rounded-2xl border border-line bg-surface/60 p-5">
          <h2 className="mb-4 font-display text-lg text-cloud">Movimientos</h2>
          {item.movements.length === 0 ? (
            <p className="text-sm text-mist">Aún no hay movimientos registrados.</p>
          ) : (
            <ul className="divide-y divide-line">
              {item.movements.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm text-cloud">
                      <span className={m.type === "ENTRADA" ? "text-emerald-300" : "text-red-300"}>
                        {m.type === "ENTRADA" ? "+" : "−"}{m.quantity} {item.unit}
                      </span>
                    </p>
                    {m.reason && <p className="text-xs text-mist">{m.reason}</p>}
                  </div>
                  <p className="shrink-0 text-xs text-mist-2">{new Date(m.createdAt).toLocaleString("es-CO")}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
