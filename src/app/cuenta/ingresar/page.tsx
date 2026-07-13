"use client";

import Link from "next/link";
import { useActionState } from "react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { loginCustomer, type AuthState } from "../actions";

const initial: AuthState = {};
const input =
  "w-full rounded-lg border border-line bg-ink px-4 py-2.5 text-cloud outline-none transition focus:border-morado";

export default function IngresarPage() {
  const [state, action, pending] = useActionState(loginCustomer, initial);

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-6 py-24">
      <div className="rounded-2xl border border-line bg-surface/70 p-8 shadow-xl backdrop-blur">
        <p className="text-xs font-medium uppercase tracking-widest text-naranja">Mi cuenta</p>
        <h1 className="mt-2 font-display text-3xl text-cloud">Inicia sesión</h1>
        <p className="mt-1 text-sm text-mist">Consulta tus cotizaciones y pedidos.</p>

        <form action={action} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-mist">Correo</label>
            <input id="email" name="email" type="email" autoComplete="username" required className={input} placeholder="tucorreo@email.com" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-mist">Contraseña</label>
            <PasswordInput id="password" name="password" autoComplete="current-password" required className={input} />
          </div>

          {state.error && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-gradient-to-r from-morado to-naranja px-4 py-2.5 font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {pending ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-mist">
          ¿No tienes cuenta?{" "}
          <Link href="/cuenta/registro" className="text-morado-light hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
