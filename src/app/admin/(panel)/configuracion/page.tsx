import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { requireOwner } from "@/lib/auth";
import { getFiscalSettings, isFiscalReady, formatNit } from "@/lib/settings";
import { FiscalForm } from "./FiscalForm";

export const dynamic = "force-dynamic";

/**
 * Configuración de la empresa — datos fiscales.
 *
 * Solo el ADMINISTRADOR entra aquí (`requireOwner`): de estos campos dependen
 * las facturas electrónicas y los documentos legales del sitio.
 */
export default async function ConfiguracionPage() {
  await requireOwner();
  const fiscal = await getFiscalSettings();
  const listo = isFiscalReady(fiscal);
  const nit = formatNit(fiscal);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cloud">Configuración</h1>
        <p className="mt-1 text-sm text-mist-2">
          Datos fiscales de la empresa. Se guardan una sola vez y se usan en todas las
          facturas y en las páginas legales.
        </p>
      </div>

      {/* Estado actual: deja claro de un vistazo si falta algo */}
      {listo ? (
        <p className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Datos completos. Facturando como{" "}
            <strong className="text-emerald-200">{fiscal.legalName}</strong>
            {nit && <> · NIT {nit}</>}.
          </span>
        </p>
      ) : (
        <p className="flex items-start gap-3 rounded-xl border border-naranja/30 bg-naranja/[0.07] px-4 py-3 text-sm text-cloud">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-naranja-light" />
          <span>
            Faltan los datos del RUT. Mientras tanto, el XML de facturación electrónica sale
            marcado como no presentable y el NIT no aparece en las{" "}
            <Link href="/politicas/terminos" className="text-morado-light hover:underline">
              páginas legales
            </Link>
            . El resto del sistema funciona con normalidad.
          </span>
        </p>
      )}

      <FiscalForm initial={fiscal} />

      <p className="rounded-xl border border-line bg-surface/40 px-4 py-3 text-xs leading-relaxed text-mist-2">
        <strong className="text-mist">Dónde se usan estos datos:</strong> en el XML UBL 2.1 de
        cada factura (bloque del emisor) y en la sección “Identificación del responsable” de la
        política de privacidad, el tratamiento de datos y los términos y condiciones. Al
        guardarlos, esas páginas se actualizan solas.
      </p>
    </div>
  );
}
