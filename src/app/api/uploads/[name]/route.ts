import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/uploads/<name>            → sirve el archivo subido desde el panel.
 * GET /api/uploads/<name>?download=1 → lo mismo, pero forzando la descarga con
 *                                      su nombre original.
 *
 * Los archivos viven en la base de datos (`MediaAsset`). Se conserva la lectura
 * de /public/uploads como respaldo para los que se subieron con la versión
 * anterior en un servidor con disco propio.
 */
const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  ogg: "video/ogg",
};

/** Nombre seguro para la cabecera Content-Disposition (ASCII + versión UTF-8). */
function disposition(originalName: string): string {
  const ascii = originalName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(originalName)}`;
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ name: string }> },
) {
  const { name } = await ctx.params;
  // Seguridad: solo un nombre de archivo plano (sin rutas ni "..").
  if (!name || name !== name.replace(/[^a-zA-Z0-9._-]/g, "") || name.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const ext = name.split(".").pop()?.toLowerCase() ?? "";

  const asset = await prisma.mediaAsset
    .findUnique({ where: { name } })
    .catch(() => null);

  if (asset) {
    const headers: Record<string, string> = {
      "Content-Type": asset.mime || TYPES[ext] || "application/octet-stream",
      "Content-Length": String(asset.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    };
    if (download) headers["Content-Disposition"] = disposition(asset.originalName);
    return new NextResponse(new Uint8Array(asset.data), { headers });
  }

  // Respaldo: archivos de la versión anterior guardados en disco.
  try {
    const buf = await readFile(join(process.cwd(), "public", "uploads", name));
    const headers: Record<string, string> = {
      "Content-Type": TYPES[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    };
    if (download) headers["Content-Disposition"] = disposition(name);
    return new NextResponse(new Uint8Array(buf), { headers });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
