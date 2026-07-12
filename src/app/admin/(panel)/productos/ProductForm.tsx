"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { UploadCloud } from "lucide-react";
import { saveProduct, type ProductFormState } from "./actions";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  shortDesc: string;
  description: string;
  fabric: string;
  material: string;
  design: string;
  productionTime: string;
  gradient: string;
  pricePerMeter: string;
  colors: string;
  features: string;
  images: string;
  videos: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
};

export type CategoryOption = { id: string; name: string };

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  shortDesc: "",
  description: "",
  fabric: "",
  material: "",
  design: "",
  productionTime: "",
  gradient: "from-slate-800 via-slate-700 to-slate-900",
  pricePerMeter: "",
  colors: "",
  features: "",
  images: "",
  videos: "",
  isActive: true,
  isFeatured: false,
  categoryId: "",
};

const input =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-cloud placeholder:text-mist-2 focus:border-morado/60 focus:outline-none focus:ring-2 focus:ring-morado/30 transition-colors";
const label = "mb-1.5 block text-sm text-mist";
const hint = "mt-1 text-xs text-mist-2";

export function ProductForm({
  initial,
  categories = [],
}: {
  initial?: ProductFormValues;
  categories?: CategoryOption[];
}) {
  const values = initial ?? EMPTY;
  const isEdit = Boolean(initial?.id);
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    saveProduct,
    {},
  );

  // Carga de archivos: sube al servidor y agrega la URL al textarea correspondiente.
  const imagesRef = useRef<HTMLTextAreaElement>(null);
  const videosRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState<"images" | "videos" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleUpload(kind: "images" | "videos", files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(kind);
    const ref = kind === "images" ? imagesRef : videosRef;
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "No se pudo subir el archivo.");
        if (ref.current) {
          const cur = ref.current.value.trim();
          ref.current.value = (cur ? cur + "\n" : "") + data.url;
        }
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Error al subir el archivo.");
    } finally {
      setUploading(null);
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && <input type="hidden" name="id" value={values.id} />}

      {state.error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      )}

      {/* Datos principales */}
      <div className="rounded-2xl border border-line bg-surface/60 p-5">
        <h2 className="mb-4 font-display text-lg text-cloud">Datos principales</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Nombre *</label>
            <input name="name" defaultValue={values.name} className={input} placeholder="Blackout" required />
          </div>
          <div>
            <label className={label}>Slug (URL)</label>
            <input name="slug" defaultValue={values.slug} className={input} placeholder="se genera del nombre si lo dejas vacío" />
            <p className={hint}>Se usa en /catalogo/&lt;slug&gt;. Déjalo vacío para generarlo del nombre.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Categoría</label>
            <select name="categoryId" defaultValue={values.categoryId} className={input}>
              <option value="">— Sin categoría —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className={hint}>
                No hay categorías todavía. Créalas en{" "}
                <Link href="/admin/categorias" className="text-morado-light hover:underline">
                  Categorías
                </Link>
                .
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Descripción corta (tarjeta)</label>
            <input name="shortDesc" defaultValue={values.shortDesc} className={input} placeholder="Oscuridad total y aislamiento térmico." />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Descripción larga (ficha)</label>
            <textarea name="description" defaultValue={values.description} rows={4} className={input} />
          </div>
        </div>
      </div>

      {/* Ficha técnica */}
      <div className="rounded-2xl border border-line bg-surface/60 p-5">
        <h2 className="mb-4 font-display text-lg text-cloud">Ficha técnica</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Tipo de tela</label>
            <input name="fabric" defaultValue={values.fabric} className={input} />
          </div>
          <div>
            <label className={label}>Material</label>
            <input name="material" defaultValue={values.material} className={input} />
          </div>
          <div>
            <label className={label}>Diseño</label>
            <input name="design" defaultValue={values.design} className={input} />
          </div>
          <div>
            <label className={label}>Tiempo de producción</label>
            <input name="productionTime" defaultValue={values.productionTime} className={input} placeholder="3 a 5 días hábiles" />
          </div>
          <div>
            <label className={label}>Precio por metro (COP)</label>
            <input name="pricePerMeter" defaultValue={values.pricePerMeter} className={input} inputMode="numeric" placeholder="55000 — vacío = “Cotiza tu medida”" />
          </div>
          <div>
            <label className={label}>Gradiente (placeholder visual)</label>
            <input name="gradient" defaultValue={values.gradient} className={input} placeholder="from-slate-800 via-slate-700 to-slate-900" />
            <p className={hint}>Clases Tailwind que sirven de fondo mientras no hay foto.</p>
          </div>
        </div>
      </div>

      {/* Listas */}
      <div className="rounded-2xl border border-line bg-surface/60 p-5">
        <h2 className="mb-4 font-display text-lg text-cloud">Colores, características y galería</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Colores (uno por línea)</label>
            <textarea name="colors" defaultValue={values.colors} rows={5} className={`${input} font-mono text-xs`} placeholder={"Blanco humo #e7e5e4\nNegro #1c1c1c"} />
            <p className={hint}>Formato: “Nombre #hex”. El #hex va al final.</p>
          </div>
          <div>
            <label className={label}>Características (una por línea)</label>
            <textarea name="features" defaultValue={values.features} rows={5} className={input} placeholder={"Bloqueo total de luz\nAislamiento térmico"} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className={`${label} mb-0`}>Imágenes</label>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-morado/50 px-2.5 py-1 text-xs text-morado-light transition hover:bg-morado/10">
                <UploadCloud className="h-3.5 w-3.5" />
                {uploading === "images" ? "Subiendo…" : "Subir fotos"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  disabled={uploading !== null}
                  onChange={(e) => handleUpload("images", e.target.files)}
                />
              </label>
            </div>
            <textarea ref={imagesRef} name="images" defaultValue={values.images} rows={4} className={`${input} font-mono text-xs`} placeholder="Sube fotos o pega URLs (una por línea)" />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className={`${label} mb-0`}>Videos</label>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-morado/50 px-2.5 py-1 text-xs text-morado-light transition hover:bg-morado/10">
                <UploadCloud className="h-3.5 w-3.5" />
                {uploading === "videos" ? "Subiendo…" : "Subir videos"}
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  hidden
                  disabled={uploading !== null}
                  onChange={(e) => handleUpload("videos", e.target.files)}
                />
              </label>
            </div>
            <textarea ref={videosRef} name="videos" defaultValue={values.videos} rows={4} className={`${input} font-mono text-xs`} placeholder="Sube videos o pega URLs (una por línea)" />
          </div>
        </div>
        {uploadError && (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {uploadError}
          </p>
        )}
        <p className={`${hint} mt-3`}>
          Los archivos se guardan en el sitio. Las fotos aparecen en la galería del producto.
        </p>
      </div>

      {/* Estado */}
      <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-line bg-surface/60 p-5">
        <label className="flex items-center gap-2 text-sm text-cloud">
          <input type="checkbox" name="isActive" defaultChecked={values.isActive} className="h-4 w-4 accent-morado" />
          Activo (visible en el sitio)
        </label>
        <label className="flex items-center gap-2 text-sm text-cloud">
          <input type="checkbox" name="isFeatured" defaultChecked={values.isFeatured} className="h-4 w-4 accent-naranja" />
          Destacado
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-gradient-to-r from-morado to-naranja px-6 py-3 text-sm font-medium text-white shadow-lg shadow-morado/25 transition-all hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear producto"}
        </button>
        <Link href="/admin/productos" className="rounded-full border border-line px-5 py-3 text-sm text-mist transition hover:text-cloud">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
