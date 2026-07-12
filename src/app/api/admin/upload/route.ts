import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { getSession } from "@/lib/auth";

/**
 * POST /api/admin/upload  (solo staff)
 * Recibe un archivo (imagen o video), lo guarda en /public/uploads y devuelve
 * su URL pública. Almacenamiento local: funciona en desarrollo y en hosting con
 * disco persistente. Para producción serverless (Vercel), migrar a Cloudinary.
 */
const MAX_BYTES = 30 * 1024 * 1024; // 30 MB

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "Solo se permiten imágenes o videos." },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "El archivo supera los 30 MB." }, { status: 413 });
  }

  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), Buffer.from(await file.arrayBuffer()));

  // Se sirve por una ruta dedicada (funciona en dev, `next start` y hosting Node,
  // a diferencia de /public que solo sirve archivos existentes en el build).
  return NextResponse.json({ url: `/api/uploads/${name}`, type: isVideo ? "video" : "image" });
}
