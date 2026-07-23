"use client";

import { useActionState, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ImageOff,
  Link2,
  RotateCcw,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react";
import { subirArchivo } from "@/components/admin/upload-client";
import type { WorkItem } from "@/lib/work-gallery";
import { saveWorkGalleryAction, type GalleryFormState } from "./actions";

/**
 * Editor de la galería de trabajos realizados de la página de inicio.
 *
 * Sube fotos o videos, los ordena y les pone la descripción que aparece bajo
 * cada tarjeta. Se guarda la lista completa: es corta y ordenada, así que no
 * vale la pena una tabla con altas y bajas por elemento.
 */

const input =
  "w-full rounded-xl border border-line bg-white/[0.03] px-3 py-2 text-sm text-cloud placeholder:text-mist-2 focus:border-morado/60 focus:outline-none focus:ring-2 focus:ring-morado/30 transition-colors";

/** Igual que `guessType` del servidor, para no depender de él en el navegador. */
function tipoPorUrl(src: string): "image" | "video" {
  const limpio = src.split("#")[0].split("?")[0].toLowerCase();
  return /\.(mp4|webm|mov|ogg|m4v)$/.test(limpio) ? "video" : "image";
}

export function WorkGalleryForm({
  initial,
  defaults,
}: {
  initial: WorkItem[];
  defaults: WorkItem[];
}) {
  const [items, setItems] = useState<WorkItem[]>(initial);
  const [state, formAction, pending] = useActionState<GalleryFormState, FormData>(
    saveWorkGalleryAction,
    {},
  );
  const [subiendo, setSubiendo] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [enlace, setEnlace] = useState("");
  const [rotos, setRotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function mover(i: number, delta: number) {
    setItems((prev) => {
      const destino = i + delta;
      if (destino < 0 || destino >= prev.length) return prev;
      const copia = [...prev];
      [copia[i], copia[destino]] = [copia[destino], copia[i]];
      return copia;
    });
  }

  function cambiarAlt(i: number, alt: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, alt } : it)));
  }

  function quitar(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function agregarEnlace() {
    const src = enlace.trim();
    if (!src) return;
    setItems((prev) => [...prev, { src, type: tipoPorUrl(src), alt: "" }]);
    setEnlace("");
  }

  async function subir(files: FileList | null) {
    if (!files || files.length === 0) return;
    setErrores([]);
    setSubiendo(true);
    const fallos: string[] = [];
    const nuevos: WorkItem[] = [];
    try {
      for (const original of Array.from(files)) {
        const r = await subirArchivo(original, {
          comprimir: original.type.startsWith("image/"),
        });
        if ("error" in r) {
          fallos.push(r.error);
          continue;
        }
        nuevos.push({
          src: r.ok.type === "video" ? `${r.ok.url}#t=0.1` : r.ok.url,
          type: r.ok.type,
          alt: "",
        });
      }
    } finally {
      if (nuevos.length) setItems((prev) => [...prev, ...nuevos]);
      setErrores(fallos);
      setSubiendo(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* La lista completa viaja como JSON: el orden importa y el alt es libre. */}
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      {state.error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state.ok && !pending && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Galería guardada. Ya se ve en la página de inicio.
        </p>
      )}

      <div className="rounded-2xl border border-line bg-surface/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg text-cloud">
              Trabajos realizados
              <span className="ml-2 text-sm text-mist-2">
                {items.length} {items.length === 1 ? "elemento" : "elementos"}
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-mist-2">
              Fotos y videos de instalaciones reales. Se muestran en la página de inicio en
              este mismo orden.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-morado/50 px-3 py-1.5 text-xs text-morado-light transition hover:bg-morado/10">
            <UploadCloud className="h-4 w-4" />
            {subiendo ? "Subiendo…" : "Subir fotos o videos"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              disabled={subiendo}
              onChange={(e) => subir(e.target.files)}
            />
          </label>
        </div>

        {errores.length > 0 && (
          <ul className="mt-3 space-y-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {errores.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        )}

        {items.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-mist-2">
            La galería está vacía: la sección no aparecerá en la página de inicio. Sube una
            foto o un video para mostrarla.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((item, i) => {
              const roto = rotos.includes(item.src);
              return (
                <li
                  key={item.src + i}
                  className="flex flex-wrap items-start gap-3 rounded-xl border border-line bg-white/[0.02] p-3 sm:flex-nowrap"
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-soft">
                    {item.type === "video" ? (
                      <video
                        src={item.src}
                        muted
                        preload="metadata"
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : roto ? (
                      <span className="grid h-full w-full place-items-center text-mist-2">
                        <ImageOff className="h-5 w-5" />
                      </span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.src}
                        alt={item.alt || "Trabajo realizado"}
                        className="h-full w-full object-cover"
                        onError={() =>
                          setRotos((prev) => (prev.includes(item.src) ? prev : [...prev, item.src]))
                        }
                      />
                    )}
                    {item.type === "video" && (
                      <span className="absolute bottom-1 left-1 rounded bg-ink/80 p-0.5 text-morado-light">
                        <Video className="h-3 w-3" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <input
                      value={item.alt}
                      onChange={(e) => cambiarAlt(i, e.target.value)}
                      placeholder="Descripción: “Instalación de riel en ventana de sala”"
                      className={input}
                    />
                    <p className="mt-1 truncate font-mono text-[11px] text-mist-2" title={item.src}>
                      {item.src}
                    </p>
                    {roto && (
                      <p className="mt-1 text-[11px] text-red-300">
                        Este archivo ya no existe. Quítalo y vuelve a subirlo.
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => mover(i, -1)}
                      disabled={i === 0}
                      aria-label="Subir en el orden"
                      title="Mover arriba"
                      className="rounded-lg border border-line p-2 text-mist transition hover:border-morado/50 hover:text-cloud disabled:opacity-30"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => mover(i, 1)}
                      disabled={i === items.length - 1}
                      aria-label="Bajar en el orden"
                      title="Mover abajo"
                      className="rounded-lg border border-line p-2 text-mist transition hover:border-morado/50 hover:text-cloud disabled:opacity-30"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => quitar(i)}
                      aria-label="Quitar de la galería"
                      title="Quitar"
                      className="rounded-lg border border-line p-2 text-mist transition hover:border-red-500/40 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Alternativa a subir el archivo: un enlace que ya está en el sitio o
            en otro servicio. */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link2 className="h-4 w-4 shrink-0 text-mist-2" />
          <input
            value={enlace}
            onChange={(e) => setEnlace(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregarEnlace();
              }
            }}
            placeholder="…o pega la dirección de una foto o video"
            className={`${input} w-auto min-w-0 flex-1 font-mono text-xs`}
          />
          <button
            type="button"
            onClick={agregarEnlace}
            className="rounded-lg border border-line px-3 py-2 text-xs text-mist transition hover:border-morado/50 hover:text-cloud"
          >
            Agregar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || subiendo}
          className="rounded-full bg-gradient-to-r from-morado to-naranja px-6 py-3 text-sm font-medium text-white shadow-lg shadow-morado/25 transition-all hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar galería"}
        </button>
        <button
          type="button"
          onClick={() => setItems(defaults)}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-5 py-3 text-sm text-mist transition hover:text-cloud"
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar la galería original
        </button>
      </div>
      <p className="text-xs text-mist-2">
        Los cambios se ven en la página de inicio apenas guardas. Máximo 4 MB por archivo;
        las fotos se comprimen solas antes de subirse.
      </p>
    </form>
  );
}
