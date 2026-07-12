"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveItem, type ItemFormState } from "./actions";

export type ItemFormValues = {
  id?: string;
  name: string;
  category: string;
  unit: string;
  stock: string;
  minStock: string;
};

const EMPTY: ItemFormValues = {
  name: "",
  category: "MATERIAL",
  unit: "unidad",
  stock: "0",
  minStock: "0",
};

const CATS = [
  ["TELA", "Tela"],
  ["MATERIAL", "Material"],
  ["ACCESORIO", "Accesorio"],
  ["MOTOR", "Motor"],
  ["INSUMO", "Insumo"],
] as const;

const input =
  "w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cloud outline-none focus:border-morado";
const label = "mb-1.5 block text-sm text-mist";

export function ItemForm({ initial }: { initial?: ItemFormValues }) {
  const values = initial ?? EMPTY;
  const isEdit = Boolean(initial?.id);
  const [state, formAction, pending] = useActionState<ItemFormState, FormData>(saveItem, {});

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      {isEdit && <input type="hidden" name="id" value={values.id} />}

      {state.error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <div className="rounded-2xl border border-line bg-surface/60 p-5 space-y-4">
        <div>
          <label className={label}>Nombre</label>
          <input name="name" defaultValue={values.name} required className={input} placeholder="Tela Blackout blanco" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Categoría</label>
            <select name="category" defaultValue={values.category} className={input}>
              {CATS.map(([v, t]) => (
                <option key={v} value={v}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Unidad</label>
            <input name="unit" defaultValue={values.unit} className={input} placeholder="metro, unidad…" />
          </div>
          <div>
            <label className={label}>Stock actual</label>
            <input name="stock" defaultValue={values.stock} inputMode="decimal" className={input} />
          </div>
          <div>
            <label className={label}>Stock mínimo (alerta)</label>
            <input name="minStock" defaultValue={values.minStock} inputMode="decimal" className={input} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-full bg-gradient-to-r from-morado to-naranja px-6 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-60">
          {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear artículo"}
        </button>
        <Link href="/admin/inventario" className="rounded-full border border-line px-5 py-2.5 text-sm text-mist transition hover:text-cloud">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
