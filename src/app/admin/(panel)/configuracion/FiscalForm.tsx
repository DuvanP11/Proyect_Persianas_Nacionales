"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { FiscalSettings } from "@/lib/settings";
import { saveFiscal, type FiscalFormState } from "./actions";

const input =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-cloud placeholder:text-mist-2 focus:border-morado/60 focus:outline-none focus:ring-2 focus:ring-morado/30 transition-colors";
const label = "mb-1.5 block text-sm text-mist";
const hint = "mt-1 text-xs text-mist-2";

/**
 * Formulario de datos fiscales del emisor.
 *
 * Lo que se guarde aquí queda disponible para TODAS las facturas siguientes y
 * para los tres documentos legales, sin volver a escribirlo.
 */
export function FiscalForm({ initial }: { initial: FiscalSettings }) {
  const [state, formAction, pending] = useActionState<FiscalFormState, FormData>(
    saveFiscal,
    {},
  );

  // El marcador que trae el código por defecto no debe aparecer en el campo:
  // se deja vacío para que el administrador escriba la razón social real.
  const legalName = initial.legalName.startsWith("PENDIENTE") ? "" : initial.legalName;

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Datos guardados. Ya se usan en las facturas y en las páginas legales.
        </p>
      )}

      <div className="rounded-2xl border border-line bg-surface/60 p-5">
        <h2 className="mb-4 font-display text-lg text-cloud">Identificación</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label}>Razón social *</label>
            <input
              name="legalName"
              defaultValue={legalName}
              className={input}
              placeholder="Tal como aparece en el RUT"
            />
            <p className={hint}>
              Nombre legal exacto. Si eres persona natural, tus nombres y apellidos.
            </p>
          </div>
          <div>
            <label className={label}>NIT *</label>
            <input
              name="nit"
              defaultValue={initial.nit}
              className={input}
              inputMode="numeric"
              placeholder="901234567"
            />
            <p className={hint}>Solo números, sin puntos ni el dígito de verificación.</p>
          </div>
          <div>
            <label className={label}>Dígito de verificación</label>
            <input
              name="dv"
              defaultValue={initial.dv}
              className={input}
              inputMode="numeric"
              maxLength={1}
              placeholder="8"
            />
            <p className={hint}>El número que va después del guion.</p>
          </div>
          <div>
            <label className={label}>Tipo de persona</label>
            <select name="personType" defaultValue={initial.personType} className={input}>
              <option value="2">Persona natural</option>
              <option value="1">Persona jurídica</option>
            </select>
          </div>
          <div>
            <label className={label}>Ciudad</label>
            <input name="cityName" defaultValue={initial.cityName} className={input} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface/60 p-5">
        <h2 className="mb-4 font-display text-lg text-cloud">Facturación electrónica</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Régimen (código DIAN)</label>
            <input
              name="taxLevelCode"
              defaultValue={initial.taxLevelCode}
              className={input}
              placeholder="R-99-PN"
            />
            <p className={hint}>
              “R-99-PN” si no eres responsable de IVA. Tu contador te confirma el código.
            </p>
          </div>
          <div>
            <label className={label}>Ambiente DIAN</label>
            <select name="environment" defaultValue={initial.environment} className={input}>
              <option value="2">Pruebas (habilitación)</option>
              <option value="1">Producción</option>
            </select>
            <p className={hint}>
              Déjalo en pruebas hasta completar la habilitación ante la DIAN.
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-gradient-to-r from-morado to-naranja px-6 py-3 text-sm font-medium text-white shadow-lg shadow-morado/25 transition-all hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar datos fiscales"}
      </button>
    </form>
  );
}
