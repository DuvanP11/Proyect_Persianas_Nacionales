"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerCustomer, type AuthState } from "../actions";

const initial: AuthState = {};
const input =
  "w-full rounded-lg border border-line bg-ink px-4 py-2.5 text-cloud outline-none transition focus:border-morado";
const label = "mb-1.5 block text-sm text-mist";

export default function RegistroPage() {
  const [state, action, pending] = useActionState(registerCustomer, initial);

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-6 py-24">
      <div className="rounded-2xl border border-line bg-surface/70 p-8 shadow-xl backdrop-blur">
        <p className="text-xs font-medium uppercase tracking-widest text-naranja">Mi cuenta</p>
        <h1 className="mt-2 font-display text-3xl text-cloud">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-mist">Guarda tus datos y sigue el estado de tus pedidos.</p>

        <form action={action} className="mt-8 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className={label}>Nombre</label>
              <input id="firstName" name="firstName" autoComplete="given-name" required className={input} placeholder="Nombre" />
            </div>
            <div>
              <label htmlFor="lastName" className={label}>Apellidos</label>
              <input id="lastName" name="lastName" autoComplete="family-name" required className={input} placeholder="Apellidos" />
            </div>
          </div>
          <div>
            <label htmlFor="email" className={label}>Correo</label>
            <input id="email" name="email" type="email" autoComplete="username" required className={input} placeholder="tucorreo@email.com" />
          </div>
          <div>
            <label htmlFor="phone" className={label}>Teléfono / WhatsApp</label>
            <input id="phone" name="phone" inputMode="tel" autoComplete="tel" required className={input} placeholder="300 000 0000" />
          </div>
          <div>
            <label htmlFor="password" className={label}>Contraseña</label>
            <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className={input} placeholder="Mínimo 8 caracteres" />
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
            {pending ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-mist">
          ¿Ya tienes cuenta?{" "}
          <Link href="/cuenta/ingresar" className="text-morado-light hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
