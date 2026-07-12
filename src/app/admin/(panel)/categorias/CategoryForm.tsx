"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveCategory, type CategoryFormState } from "./actions";

export type CategoryFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
  isActive: boolean;
};

const EMPTY: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  sortOrder: "0",
  isActive: true,
};

const input =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-cloud placeholder:text-mist-2 focus:border-morado/60 focus:outline-none focus:ring-2 focus:ring-morado/30 transition-colors";
const label = "mb-1.5 block text-sm text-mist";
const hint = "mt-1 text-xs text-mist-2";

export function CategoryForm({ initial }: { initial?: CategoryFormValues }) {
  const values = initial ?? EMPTY;
  const isEdit = Boolean(initial?.id);
  const [state, formAction, pending] = useActionState<CategoryFormState, FormData>(
    saveCategory,
    {},
  );

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && <input type="hidden" name="id" value={values.id} />}

      {state.error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <div className="rounded-2xl border border-line bg-surface/60 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Nombre *</label>
            <input name="name" defaultValue={values.name} className={input} placeholder="Cortinas" required />
          </div>
          <div>
            <label className={label}>Slug (URL)</label>
            <input name="slug" defaultValue={values.slug} className={input} placeholder="se genera del nombre si lo dejas vacío" />
            <p className={hint}>Déjalo vacío para generarlo del nombre.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Descripción</label>
            <textarea name="description" defaultValue={values.description} rows={3} className={input} />
          </div>
          <div>
            <label className={label}>Orden</label>
            <input name="sortOrder" defaultValue={values.sortOrder} className={input} inputMode="numeric" placeholder="0" />
            <p className={hint}>Menor número aparece primero.</p>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-cloud">
              <input type="checkbox" name="isActive" defaultChecked={values.isActive} className="h-4 w-4 accent-morado" />
              Activa
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-gradient-to-r from-morado to-naranja px-6 py-3 text-sm font-medium text-white shadow-lg shadow-morado/25 transition-all hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear categoría"}
        </button>
        <Link href="/admin/categorias" className="rounded-full border border-line px-5 py-3 text-sm text-mist transition hover:text-cloud">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
