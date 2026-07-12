"use client";

import Link from "next/link";
import { useActionState } from "react";
import { savePromo, type PromoFormState } from "./actions";

export type PromoFormValues = {
  id?: string;
  code: string;
  discountPct: string;
  validUntil: string;
  maxUses: string;
  isActive: boolean;
};

const EMPTY: PromoFormValues = {
  code: "",
  discountPct: "",
  validUntil: "",
  maxUses: "",
  isActive: true,
};

const input =
  "w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cloud outline-none focus:border-morado";
const label = "mb-1.5 block text-sm text-mist";

export function PromoForm({ initial }: { initial?: PromoFormValues }) {
  const values = initial ?? EMPTY;
  const isEdit = Boolean(initial?.id);
  const [state, formAction, pending] = useActionState<PromoFormState, FormData>(savePromo, {});

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
          <label className={label}>Código</label>
          <input name="code" defaultValue={values.code} required className={`${input} font-mono uppercase`} placeholder="PROMO20" />
        </div>
        <div>
          <label className={label}>Descuento (%)</label>
          <input name="discountPct" defaultValue={values.discountPct} required inputMode="numeric" className={input} placeholder="20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Vigente hasta (opcional)</label>
            <input type="date" name="validUntil" defaultValue={values.validUntil} className={input} />
          </div>
          <div>
            <label className={label}>Usos máx. (opcional)</label>
            <input name="maxUses" defaultValue={values.maxUses} inputMode="numeric" className={input} placeholder="ilimitado" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-cloud">
          <input type="checkbox" name="isActive" defaultChecked={values.isActive} className="h-4 w-4 accent-morado" />
          Activo
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-full bg-gradient-to-r from-morado to-naranja px-6 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-60">
          {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear código"}
        </button>
        <Link href="/admin/promociones" className="rounded-full border border-line px-5 py-2.5 text-sm text-mist transition hover:text-cloud">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
