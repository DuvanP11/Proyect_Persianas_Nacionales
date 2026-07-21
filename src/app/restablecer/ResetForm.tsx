"use client";

import { useActionState } from "react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { resetPassword, type ResetState } from "./actions";

const initial: ResetState = {};
const input =
  "w-full rounded-lg border border-line bg-ink px-4 py-2.5 text-cloud outline-none transition focus:border-morado";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, initial);

  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-mist">
          Nueva contraseña
        </label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={input}
        />
        <p className="mt-1 text-xs text-mist/70">Mínimo 8 caracteres.</p>
      </div>

      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm text-mist">
          Repite la contraseña
        </label>
        <PasswordInput
          id="confirm"
          name="confirm"
          autoComplete="new-password"
          required
          minLength={8}
          className={input}
        />
      </div>

      {state.error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-morado px-4 py-2.5 font-medium text-white transition hover:bg-morado-dark disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar nueva contraseña"}
      </button>
    </form>
  );
}
