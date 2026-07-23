import { QR_DESTINO_IDS, QR_DESTINOS, qrDestinoUrl } from "@/lib/qr";
import { QrPanel } from "./QrPanel";

export const dynamic = "force-dynamic";

export default async function QrPage() {
  // La dirección se arma con el dominio de la petición: en producción sale el
  // dominio real sin configurar nada.
  const destinos = await Promise.all(
    QR_DESTINO_IDS.map(async (id) => ({
      id,
      label: QR_DESTINOS[id].label,
      desc: QR_DESTINOS[id].desc,
      url: await qrDestinoUrl(id),
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cloud">Código QR</h1>
        <p className="mt-1 text-sm text-mist">
          Para imprimir en tarjetas, volantes, la vitrina del local o el vehículo: quien lo
          escanea con la cámara del celular entra al sitio sin escribir nada.
        </p>
      </div>

      <QrPanel destinos={destinos} />
    </div>
  );
}
