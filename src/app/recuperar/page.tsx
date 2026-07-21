"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MailCheck, LifeBuoy } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { requestReset, type RecoverState } from "./actions";

const initial: RecoverState = {};
const input =
  "w-full rounded-lg border border-line bg-ink px-4 py-2.5 text-cloud outline-none transition focus:border-morado";

export default function RecuperarPage() {
  const [state, action, pending] = useActionState(requestReset, initial);

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-6 py-24">
      <div className="rounded-2xl border border-line bg-surface/70 p-8 shadow-xl backdrop-blur">
        <p className="text-xs font-medium uppercase tracking-widest text-naranja">
          Recuperar acceso
        </p>
        <h1 className="mt-2 font-display text-3xl text-cloud">
          ¿Olvidaste tu contraseña?
        </h1>

        {/* Enlace enviado (o cuenta inexistente): mensaje neutro, sin revelar si existe. */}
        {state.sent ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-morado/40 bg-morado/10 p-4">
              <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-morado-light" />
              <p className="text-sm text-mist">
                Si ese correo tiene una cuenta, te enviamos un enlace para crear una
                nueva contraseña. Revisa tu bandeja de entrada (y la carpeta de spam).
                El enlace vence en 1 hora.
              </p>
            </div>
            <Link href="/cuenta/ingresar" className="block text-center text-sm text-morado-light hover:underline">
              Volver a iniciar sesión
            </Link>
          </div>
        ) : state.contactAdmin ? (
          /* No se pudo enviar el correo: guiar al usuario a contactar al negocio. */
          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-naranja/40 bg-naranja/10 p-4">
              <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-naranja" />
              <p className="text-sm text-mist">
                Por ahora no podemos enviar el enlace de recuperación automáticamente.
                Comunícate con el administrador de <strong className="text-cloud">{siteConfig.name}</strong> y
                te ayudará a restablecer tu contraseña.
              </p>
            </div>
            <div className="space-y-2">
              <a
                href={`https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(
                  "Hola, necesito ayuda para recuperar la contraseña de mi cuenta.",
                )}`}
                target="_blank"
                rel="noopener"
                className="block rounded-lg bg-gradient-to-r from-morado to-naranja px-4 py-2.5 text-center font-medium text-white transition hover:-translate-y-0.5"
              >
                Escribir por WhatsApp · {siteConfig.whatsapp.display}
              </a>
              <a
                href={`mailto:${siteConfig.email}?subject=${encodeURIComponent("Recuperar contraseña")}`}
                className="block rounded-lg border border-line px-4 py-2.5 text-center text-sm text-mist transition hover:text-cloud"
              >
                Escribir un correo · {siteConfig.email}
              </a>
            </div>
          </div>
        ) : (
          /* Estado inicial: pedir el correo. */
          <>
            <p className="mt-1 text-sm text-mist">
              Ingresa tu correo y te enviaremos un enlace para crear una nueva.
            </p>
            <form action={action} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm text-mist">
                  Correo
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  className={input}
                  placeholder="tucorreo@email.com"
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
                {pending ? "Enviando…" : "Enviar enlace de recuperación"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-mist">
              <Link href="/cuenta/ingresar" className="text-morado-light hover:underline">
                Volver a iniciar sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
