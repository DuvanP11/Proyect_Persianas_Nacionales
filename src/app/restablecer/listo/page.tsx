import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

/**
 * Confirmación tras restablecer la contraseña. Ofrece las dos entradas (portal
 * de cliente y panel) porque el mismo flujo sirve para ambos tipos de cuenta.
 */
export default function RestablecerListoPage() {
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-6 py-24">
      <div className="rounded-2xl border border-line bg-surface/70 p-8 text-center shadow-xl backdrop-blur">
        <CheckCircle2 className="mx-auto h-12 w-12 text-morado-light" />
        <h1 className="mt-4 font-display text-3xl text-cloud">¡Contraseña actualizada!</h1>
        <p className="mt-2 text-sm text-mist">
          Tu nueva contraseña ya quedó guardada. Inicia sesión para continuar.
        </p>

        <div className="mt-8 space-y-2">
          <Link
            href="/cuenta/ingresar"
            className="block rounded-lg bg-gradient-to-r from-morado to-naranja px-4 py-2.5 font-medium text-white transition hover:-translate-y-0.5"
          >
            Ingresar a mi cuenta
          </Link>
          <Link
            href="/admin/login"
            className="block rounded-lg border border-line px-4 py-2.5 text-sm text-mist transition hover:text-cloud"
          >
            Ingresar al panel administrativo
          </Link>
        </div>
      </div>
    </div>
  );
}
