import { esQrDestino, QR_DESTINOS, qrDestinoUrl } from "@/lib/qr";
import { siteConfig } from "@/lib/site-config";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

/**
 * Hoja lista para imprimir: el QR grande sobre fondo blanco, con el nombre del
 * negocio y los datos de contacto. Se imprime en blanco y negro sin gastar
 * tinta de más y se recorta para pegar en la vitrina o el mostrador.
 */
export default async function QrImprimirPage({
  searchParams,
}: {
  searchParams: Promise<{ dest?: string }>;
}) {
  const { dest: destRaw = "inicio" } = await searchParams;
  const dest = esQrDestino(destRaw) ? destRaw : "inicio";
  const url = await qrDestinoUrl(dest);

  const titulo =
    dest === "whatsapp" ? "Escríbenos por WhatsApp" : "Escanea y mira nuestro catálogo";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-display text-2xl text-cloud">Hoja para imprimir</h1>
          <p className="mt-1 text-sm text-mist">
            Destino: {QR_DESTINOS[dest].label}. Al imprimir solo sale la tarjeta de abajo.
          </p>
        </div>
        <PrintButton />
      </div>

      {/* Tarjeta: colores fijos claros porque esto termina en papel. */}
      <div className="mx-auto w-full max-w-[520px] rounded-2xl bg-white p-10 text-center text-black shadow-xl print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        <p className="font-display text-3xl font-semibold tracking-tight">
          {siteConfig.name}
        </p>
        <p className="mt-1 text-sm uppercase tracking-[0.3em] text-neutral-500">
          {siteConfig.slogan}
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/qr?dest=${dest}&format=svg&size=1024`}
          alt={`Código QR de ${QR_DESTINOS[dest].label}`}
          className="mx-auto mt-6 block h-auto w-full max-w-[320px]"
        />

        <p className="mt-6 font-display text-xl font-semibold">{titulo}</p>
        <p className="mt-1 text-sm text-neutral-600">
          Apunta la cámara de tu celular al código.
        </p>

        <div className="mt-6 border-t border-neutral-200 pt-4 text-sm text-neutral-700">
          <p className="font-medium">{url.replace(/^https?:\/\//, "")}</p>
          <p className="mt-1">
            WhatsApp {siteConfig.whatsapp.display} · {siteConfig.email}
          </p>
        </div>
      </div>
    </div>
  );
}
