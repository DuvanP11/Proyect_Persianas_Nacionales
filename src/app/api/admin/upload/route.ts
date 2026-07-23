import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * Subida de archivos del panel (solo staff).
 *
 *  POST /api/admin/upload        → guarda una imagen o video y devuelve su URL.
 *  GET  /api/admin/upload?names= → metadatos (nombre original, peso) de lo ya subido.
 *
 * Los archivos se guardan en la base de datos (modelo `MediaAsset`), no en
 * disco: en Vercel el sistema de archivos es de solo lectura, y por eso la
 * versión anterior —que escribía en /public/uploads— fallaba en producción.
 */

// Vercel corta las peticiones a las funciones en 4.5 MB. Se deja un margen para
// las cabeceras y el sobrecosto de multipart.
export const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

/** Extensiones que el navegador sabe mostrar (y que sirve /api/uploads). */
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/ogg": "ogg",
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return NextResponse.json({ error: "No autorizado. Vuelve a iniciar sesión." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    // Si el archivo excede el límite de la plataforma, el cuerpo llega cortado.
    return NextResponse.json(
      { error: "El archivo es demasiado grande para subirlo (máximo 4 MB)." },
      { status: 413 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }

  const mime = (file.type || "").toLowerCase();
  const isImage = mime.startsWith("image/");
  const isVideo = mime.startsWith("video/");
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: `"${file.name}" no es una imagen ni un video.` },
      { status: 415 },
    );
  }
  if (!EXT_BY_MIME[mime]) {
    return NextResponse.json(
      {
        error: `El formato ${mime || "desconocido"} no se puede mostrar en la web. Usa JPG, PNG, WEBP o MP4.`,
      },
      { status: 415 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: `"${file.name}" está vacío.` }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return NextResponse.json(
      {
        error: isVideo
          ? `El video pesa ${mb} MB y el máximo es 4 MB. Comprímelo o súbelo a otro servicio y pega el enlace.`
          : `La foto pesa ${mb} MB y el máximo es 4 MB.`,
      },
      { status: 413 },
    );
  }

  const ext = EXT_BY_MIME[mime];
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const originalName = file.name.slice(0, 200) || `archivo.${ext}`;

  try {
    await prisma.mediaAsset.create({
      data: {
        name,
        originalName,
        mime,
        size: file.size,
        data: Buffer.from(await file.arrayBuffer()),
        uploadedById: session.uid,
      },
    });
  } catch (e) {
    console.error("[upload] no se pudo guardar el archivo", e);
    // P2021: la tabla no existe todavía (falta aplicar el esquema a la BD).
    const code = (e as { code?: string })?.code;
    return NextResponse.json(
      {
        error:
          code === "P2021"
            ? "Falta crear la tabla de archivos en la base de datos. Ejecuta: npx prisma db push"
            : "No se pudo guardar el archivo en la base de datos. Inténtalo de nuevo.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    url: `/api/uploads/${name}`,
    name,
    originalName,
    size: file.size,
    type: isVideo ? "video" : "image",
  });
}

/**
 * Metadatos de los archivos ya subidos, para que el panel muestre de qué foto
 * se trata (nombre original y peso) en vez de una URL con números.
 */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const raw = new URL(request.url).searchParams.get("names") ?? "";
  const names = raw.split(",").map((n) => n.trim()).filter(Boolean).slice(0, 100);
  if (names.length === 0) return NextResponse.json({ assets: [] });

  const assets = await prisma.mediaAsset.findMany({
    where: { name: { in: names } },
    select: { name: true, originalName: true, mime: true, size: true, createdAt: true },
  });
  return NextResponse.json({ assets });
}
