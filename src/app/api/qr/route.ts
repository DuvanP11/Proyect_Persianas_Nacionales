import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { esQrDestino, qrDestinoUrl } from "@/lib/qr";

/**
 * GET /api/qr?dest=inicio&format=png&size=1024[&download=1]
 *
 * Código QR de una de las direcciones del negocio, para imprimir en tarjetas,
 * volantes o la vitrina del local. Los destinos válidos están en `lib/qr.ts`.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  const destRaw = params.get("dest") ?? "inicio";
  const dest = esQrDestino(destRaw) ? destRaw : "inicio";
  const formato = params.get("format") === "svg" ? "svg" : "png";
  // Entre 256 y 2048 px: por debajo se imprime borroso, por encima no aporta.
  const size = Math.min(2048, Math.max(256, Number(params.get("size")) || 1024));

  const texto = await qrDestinoUrl(dest);
  // Corrección de errores media: el código se sigue leyendo con el papel algo
  // maltratado, sin que el patrón crezca de más.
  const opciones = {
    margin: 2,
    errorCorrectionLevel: "M" as const,
    color: { dark: "#0b0b0f", light: "#ffffff" },
  };

  const headers: Record<string, string> = {
    // El contenido solo cambia si cambia el dominio; un día de caché sobra.
    "Cache-Control": "public, max-age=86400",
  };
  if (params.get("download") === "1") {
    headers["Content-Disposition"] = `attachment; filename="qr-cortineria-${dest}.${formato}"`;
  }

  if (formato === "svg") {
    const svg = await QRCode.toString(texto, { ...opciones, type: "svg", width: size });
    return new NextResponse(svg, { headers: { ...headers, "Content-Type": "image/svg+xml" } });
  }

  const png = await QRCode.toBuffer(texto, { ...opciones, type: "png", width: size });
  return new NextResponse(new Uint8Array(png), {
    headers: { ...headers, "Content-Type": "image/png" },
  });
}
