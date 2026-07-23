/**
 * Subida de archivos desde el panel (lado navegador).
 *
 * Lo usan la galería de cada producto y la galería de trabajos realizados, así
 * que vive aparte para tener una sola implementación de la compresión, los
 * mensajes de error y el formato de la respuesta.
 */

const MAX_DIM = 1800; // lado mayor al que se reducen las fotos antes de subir
const SIN_COMPRIMIR = 900 * 1024; // por debajo de esto no vale la pena recomprimir

export type SubidaOk = {
  url: string;
  name: string;
  originalName: string;
  size: number;
  type: "image" | "video";
};

/**
 * Reduce y recomprime la foto en el navegador (WEBP). Evita el límite de 4 MB
 * por petición y mantiene la base de datos liviana. Si algo falla, se sube el
 * archivo tal cual y que decida el servidor.
 */
export async function prepararImagen(file: File): Promise<File> {
  const tipo = file.type.toLowerCase();
  if (!tipo.startsWith("image/") || tipo === "image/gif" || tipo === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    if (escala === 1 && file.size <= SIN_COMPRIMIR) {
      bitmap.close?.();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    // Formatos que el navegador no sabe decodificar (HEIC del iPhone, por
    // ejemplo): se envía igual y el servidor responde con un mensaje claro.
    return file;
  }
}

export function mensajePorEstado(status: number, archivo: string): string {
  if (status === 401 || status === 403)
    return "Tu sesión expiró. Vuelve a iniciar sesión e inténtalo otra vez.";
  if (status === 413) return `"${archivo}" pesa demasiado. El máximo por archivo es 4 MB.`;
  if (status === 404) return "No se encontró la ruta de subida. Recarga la página.";
  if (status >= 500)
    return `El servidor no pudo guardar "${archivo}" (error ${status}). Revisa que la base de datos esté conectada.`;
  return `No se pudo subir "${archivo}" (error ${status}).`;
}

/**
 * Sube un archivo y devuelve sus datos, o el mensaje de error listo para
 * mostrar. Nunca lanza: quien lo llama decide qué hacer con cada archivo.
 */
export async function subirArchivo(
  original: File,
  { comprimir = true }: { comprimir?: boolean } = {},
): Promise<{ ok: SubidaOk } | { error: string }> {
  try {
    const file = comprimir ? await prepararImagen(original) : original;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.url) {
      return { error: data?.error ?? mensajePorEstado(res.status, original.name) };
    }
    return { ok: data as SubidaOk };
  } catch {
    return { error: `Se perdió la conexión al subir "${original.name}".` };
  }
}
