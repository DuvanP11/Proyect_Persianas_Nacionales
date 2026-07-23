"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { guessType, saveWorkGallery, type WorkItem } from "@/lib/work-gallery";

export type GalleryFormState = { error?: string; ok?: boolean };

/**
 * Guarda la galería de trabajos realizados que se muestra en la página de
 * inicio. El formulario manda la lista completa como JSON en un campo oculto:
 * es una lista ordenada y corta, así que se reemplaza entera en cada guardado.
 */
export async function saveWorkGalleryAction(
  _prev: GalleryFormState,
  formData: FormData,
): Promise<GalleryFormState> {
  await requireAdmin();

  let crudo: unknown;
  try {
    crudo = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "No se pudo leer la galería. Recarga la página e inténtalo otra vez." };
  }
  if (!Array.isArray(crudo)) return { error: "Formato de galería inválido." };

  const items: WorkItem[] = [];
  for (const raw of crudo) {
    const o = (raw ?? {}) as Record<string, unknown>;
    const src = typeof o.src === "string" ? o.src.trim() : "";
    if (!src) continue;
    items.push({
      src,
      type: o.type === "video" || o.type === "image" ? o.type : guessType(src),
      alt: typeof o.alt === "string" ? o.alt.trim().slice(0, 200) : "",
    });
  }

  if (items.length > 40) {
    return { error: "La galería admite máximo 40 elementos. Quita algunos." };
  }

  try {
    await saveWorkGallery(items);
  } catch (e) {
    console.error("[galeria] no se pudo guardar", e);
    return { error: "No se pudo guardar la galería en la base de datos." };
  }

  revalidatePath("/"); // la home es donde se muestra
  revalidatePath("/admin/galeria");
  return { ok: true };
}
