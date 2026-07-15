"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { UserPlus } from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import {
  createEmployeeAction,
  type EmployeeActionState,
} from "./actions";

/**
 * Alta de empleado. El nombre se sugiere ya numerado ("Asesor 3") a partir de
 * los que existen, que es como el equipo los identifica en el día a día.
 */
export function EmployeeForm({ suggestedName }: { suggestedName: string }) {
  const [state, formAction] = useActionState<EmployeeActionState, FormData>(
    createEmployeeAction,
    {},
  );

  const fieldCls =
    "w-full rounded-xl border border-line bg-white/[0.03] px-3.5 py-2.5 text-sm text-cloud " +
    "outline-none transition-colors focus:border-morado/60";
  const labelCls = "mb-1.5 block text-xs font-medium text-mist-2";

  return (
    <form action={formAction} className="card-premium p-5">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-cloud">
        <UserPlus className="h-4 w-4 text-morado-light" /> Registrar empleado
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="emp-name" className={labelCls}>
            Nombre
          </label>
          <input
            id="emp-name"
            name="name"
            required
            defaultValue={suggestedName}
            placeholder="Asesor 1"
            className={fieldCls}
          />
        </div>

        <div>
          <label htmlFor="emp-role" className={labelCls}>
            Tipo de ingreso
          </label>
          <select id="emp-role" name="role" defaultValue="STAFF" className={fieldCls}>
            <option value="STAFF">Asesor — trabajo diario y notificaciones</option>
            <option value="ADMIN">Administrador — acceso total</option>
          </select>
        </div>

        <div>
          <label htmlFor="emp-email" className={labelCls}>
            Correo de ingreso
          </label>
          <input
            id="emp-email"
            name="email"
            type="email"
            required
            placeholder="asesor1@cortinerianacional.com"
            className={fieldCls}
          />
        </div>

        <div>
          <label htmlFor="emp-phone" className={labelCls}>
            Teléfono (opcional)
          </label>
          <input
            id="emp-phone"
            name="phone"
            placeholder="300 000 0000"
            className={fieldCls}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="emp-password" className={labelCls}>
            Contraseña temporal (mínimo 8 caracteres)
          </label>
          <PasswordInput
            id="emp-password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={fieldCls}
          />
        </div>
      </div>

      {state.error && (
        <p className="mt-3 text-sm text-red-400">{state.error}</p>
      )}
      {state.ok && <p className="mt-3 text-sm text-[#25D366]">{state.ok}</p>}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-morado to-naranja px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
    >
      <UserPlus className="h-4 w-4" />
      {pending ? "Creando…" : "Crear ingreso"}
    </button>
  );
}
