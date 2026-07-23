import "server-only";

import { hasDatabase, prisma } from "@/lib/prisma";

/**
 * Galería de trabajos realizados (la de la página de inicio).
 *
 * Se guarda en `SiteSetting` bajo la clave `workGallery` para que el
 * administrador la edite desde el panel sin tocar código. Mientras nadie la
 * haya editado, se muestran los archivos que vienen en `public/galeria`.
 *
 * Degradación elegante: sin base de datos, o si la consulta falla, se
 * devuelven los de siempre. La home nunca se queda sin galería por eso.
 */

const KEY = "workGallery";

export type WorkItem = {
  type: "image" | "video";
  src: string;
  alt: string;
};

/**
 * Galería original, la que se venía mostrando desde el código.
 *
 * Los videos NO llevan `poster`: el `#t=0.1` del src hace que el navegador
 * busque ese instante y pinte un fotograma del propio video como miniatura,
 * que es lo honesto y además no necesita generar imágenes aparte.
 */
export const WORK_GALLERY_DEFAULT: WorkItem[] = [
  { type: "video", src: "/galeria/instalacion-1.mp4#t=0.1", alt: "Instalación de riel en ventana de sala" },
  { type: "video", src: "/galeria/instalacion-2.mp4#t=0.1", alt: "Montaje de soportes sobre el marco" },
  { type: "video", src: "/galeria/instalacion-3.mp4#t=0.1", alt: "Instalación terminada en vivienda" },
  { type: "image", src: "/galeria/instalacion-1.jpeg", alt: "Nuestro técnico fijando el soporte al muro" },
  { type: "image", src: "/galeria/instalacion-2.jpeg", alt: "Perforación del riel a la altura del marco" },
];

/** Adivina si una URL es video por su extensión (ignora `#t=0.1` y query). */
export function guessType(src: string): "image" | "video" {
  const limpio = src.split("#")[0].split("?")[0].toLowerCase();
  return /\.(mp4|webm|mov|ogg|m4v)$/.test(limpio) ? "video" : "image";
}

/** Descarta lo que no tenga forma de elemento de galería. */
function sanear(value: unknown): WorkItem[] | null {
  if (!Array.isArray(value)) return null;
  const items: WorkItem[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const o = raw as Record<string, unknown>;
    const src = typeof o.src === "string" ? o.src.trim() : "";
    if (!src) continue;
    items.push({
      src,
      type: o.type === "video" || o.type === "image" ? o.type : guessType(src),
      alt: typeof o.alt === "string" ? o.alt.trim() : "",
    });
  }
  return items;
}

/**
 * Galería vigente. Si el administrador todavía no la ha tocado, la del código;
 * si la editó (aunque la haya dejado vacía), lo que él dejó.
 */
export async function getWorkGallery(): Promise<WorkItem[]> {
  if (!hasDatabase) return WORK_GALLERY_DEFAULT;
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: KEY } });
    if (!row) return WORK_GALLERY_DEFAULT;
    const items = sanear(row.value);
    return items ?? WORK_GALLERY_DEFAULT;
  } catch {
    return WORK_GALLERY_DEFAULT;
  }
}

/** Guarda la galería completa. Solo debe llamarse desde el panel. */
export async function saveWorkGallery(items: WorkItem[]): Promise<void> {
  const value = items.map((i) => ({ type: i.type, src: i.src, alt: i.alt }));
  await prisma.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, value },
    update: { value },
  });
}
