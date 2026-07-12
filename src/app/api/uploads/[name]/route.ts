import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * GET /api/uploads/<name>
 * Sirve los archivos que el admin subió a /public/uploads. Se usa una ruta (y no
 * el servido estático de /public) porque `next start` solo sirve los archivos que
 * existían al momento del build.
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

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ name: string }> },
) {
  const { name } = await ctx.params;
  // Seguridad: solo un nombre de archivo plano (sin rutas ni "..").
  if (!name || name !== name.replace(/[^a-zA-Z0-9._-]/g, "") || name.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  try {
    const buf = await readFile(join(process.cwd(), "public", "uploads", name));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
