import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { findValidReset } from "@/lib/password-reset";
import { ResetForm } from "./ResetForm";

/**
 * Destino del enlace del correo. Valida el token en el servidor antes de
 * mostrar el formulario; si no sirve, ofrece pedir uno nuevo.
 */
export default async function RestablecerPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const valid = token ? await findValidReset(token) : null;

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-6 py-24">
      <div className="rounded-2xl border border-line bg-surface/70 p-8 shadow-xl backdrop-blur">
        <p className="text-xs font-medium uppercase tracking-widest text-naranja">
          Recuperar acceso
        </p>

        {valid ? (
          <>
            <h1 className="mt-2 font-display text-3xl text-cloud">
              Crea tu nueva contraseña
            </h1>
            <p className="mt-1 text-sm text-mist">
              Para la cuenta <span className="text-cloud">{valid.email}</span>.
            </p>
            <ResetForm token={token!} />
          </>
        ) : (
          <>
            <h1 className="mt-2 font-display text-3xl text-cloud">Enlace no válido</h1>
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-500/40 bg-red-500/10 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
              <p className="text-sm text-mist">
                Este enlace de recuperación no es válido, ya se usó o expiró (vencen
                al cabo de 1 hora). Solicita uno nuevo para continuar.
              </p>
            </div>
            <Link
              href="/recuperar"
              className="mt-6 block rounded-lg bg-morado px-4 py-2.5 text-center font-medium text-white transition hover:bg-morado-dark"
            >
              Solicitar un enlace nuevo
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
