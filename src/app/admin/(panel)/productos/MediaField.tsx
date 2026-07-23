"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, ImageOff, Play, Trash2, UploadCloud } from "lucide-react";
import { subirArchivo } from "@/components/admin/upload-client";

/**
 * Campo de galería del formulario de producto: sube archivos, muestra en
 * miniatura lo que ya está cargado (con su nombre real y su peso) y permite
 * descargarlo o quitarlo.
 *
 * El textarea sigue existiendo y sigue siendo el que envía el formulario
 * (`name="images"` / `name="videos"`, una URL por línea), así que se pueden
 * pegar enlaces externos como siempre.
 */

type Kind = "images" | "videos";
type Meta = { originalName: string; size: number };

const input =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-cloud placeholder:text-mist-2 focus:border-morado/60 focus:outline-none focus:ring-2 focus:ring-morado/30 transition-colors";
const label = "mb-1.5 block text-sm text-mist";

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

function pesoLegible(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Nombre visible de una URL cuando no hay metadatos (enlaces externos, seed). */
function nombreDeUrl(url: string): string {
  try {
    const limpia = url.split("?")[0].split("#")[0];
    return decodeURIComponent(limpia.split("/").filter(Boolean).pop() ?? url);
  } catch {
    return url;
  }
}

/** Archivos guardados por nosotros: /api/uploads/<name>. */
function nombreSubido(url: string): string | null {
  return url.startsWith("/api/uploads/") ? url.slice("/api/uploads/".length).split("?")[0] : null;
}

export function MediaField({
  kind,
  defaultValue,
  titulo,
  ayuda,
}: {
  kind: Kind;
  defaultValue: string;
  titulo: string;
  ayuda: string;
}) {
  const esImagen = kind === "images";
  const [texto, setTexto] = useState(defaultValue);
  const [subiendo, setSubiendo] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [metas, setMetas] = useState<Record<string, Meta>>({});
  const [rotos, setRotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const items = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Nombre real y peso de los archivos que subimos nosotros, para que el admin
  // sepa qué foto es cada miniatura sin adivinar por la URL.
  const claveConsulta = items.map(nombreSubido).filter(Boolean).join(",");
  useEffect(() => {
    const nombres = claveConsulta.split(",").filter(Boolean);
    const faltantes = nombres.filter((n) => !(n in metas));
    if (faltantes.length === 0) return;
    let cancelado = false;
    fetch(`/api/admin/upload?names=${encodeURIComponent(faltantes.join(","))}`)
      .then((r) => (r.ok ? r.json() : { assets: [] }))
      .then((data: { assets?: { name: string; originalName: string; size: number }[] }) => {
        if (cancelado || !data.assets?.length) return;
        setMetas((prev) => {
          const next = { ...prev };
          for (const a of data.assets!) {
            next[a.name] = { originalName: a.originalName, size: a.size };
          }
          return next;
        });
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [claveConsulta, metas]);

  const agregar = useCallback((urls: string[]) => {
    if (urls.length === 0) return;
    setTexto((prev) => {
      const base = prev.trim();
      return (base ? base + "\n" : "") + urls.join("\n");
    });
  }, []);

  function quitar(index: number) {
    setTexto(items.filter((_, i) => i !== index).join("\n"));
  }

  async function subir(files: FileList | null) {
    if (!files || files.length === 0) return;
    setErrores([]);
    setSubiendo(true);
    const nuevas: string[] = [];
    const fallos: string[] = [];
    try {
      for (const original of Array.from(files)) {
        const r = await subirArchivo(original, { comprimir: esImagen });
        if ("error" in r) {
          fallos.push(r.error);
          continue;
        }
        nuevas.push(r.ok.url);
        setMetas((prev) => ({
          ...prev,
          [r.ok.name]: { originalName: r.ok.originalName, size: r.ok.size },
        }));
      }
    } finally {
      agregar(nuevas);
      setErrores(fallos);
      setSubiendo(false);
      if (fileRef.current) fileRef.current.value = ""; // permite reintentar el mismo archivo
    }
  }

  function descargar(url: string) {
    const nombre = nombreSubido(url);
    const meta = nombre ? metas[nombre] : undefined;
    const a = document.createElement("a");
    if (url.startsWith("/")) {
      a.href = nombre ? `${url}?download=1` : url;
      a.download = meta?.originalName ?? nombreDeUrl(url);
    } else {
      // Enlace externo: el navegador bloquea la descarga directa entre dominios.
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
    }
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function descargarTodas() {
    for (const url of items) {
      descargar(url);
      await espera(400); // el navegador ignora las descargas disparadas de golpe
    }
  }

  const etiqueta = (url: string) => {
    const nombre = nombreSubido(url);
    const meta = nombre ? metas[nombre] : undefined;
    return meta?.originalName ?? nombreDeUrl(url);
  };

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <label className={`${label} mb-0`}>
          {titulo}
          {items.length > 0 && <span className="ml-1.5 text-xs text-mist-2">({items.length})</span>}
        </label>
        <div className="flex items-center gap-1.5">
          {items.length > 0 && (
            <button
              type="button"
              onClick={descargarTodas}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs text-mist transition hover:border-morado/50 hover:text-cloud"
            >
              <Download className="h-3.5 w-3.5" />
              Descargar {items.length > 1 ? "todo" : ""}
            </button>
          )}
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-morado/50 px-2.5 py-1 text-xs text-morado-light transition hover:bg-morado/10">
            <UploadCloud className="h-3.5 w-3.5" />
            {subiendo ? "Subiendo…" : esImagen ? "Subir fotos" : "Subir videos"}
            <input
              ref={fileRef}
              type="file"
              accept={esImagen ? "image/*" : "video/*"}
              multiple
              hidden
              disabled={subiendo}
              onChange={(e) => subir(e.target.files)}
            />
          </label>
        </div>
      </div>

      {items.length > 0 && (
        <ul className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((url, i) => {
            const roto = rotos.includes(url);
            return (
              <li
                key={url + i}
                className="overflow-hidden rounded-xl border border-line bg-white/[0.02]"
              >
                <div className="relative h-20 bg-ink-soft">
                  {esImagen && !roto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={etiqueta(url)}
                      className="h-full w-full object-cover"
                      onError={() => setRotos((prev) => (prev.includes(url) ? prev : [...prev, url]))}
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-mist-2">
                      {roto ? <ImageOff className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </span>
                  )}
                  <div className="absolute right-1 top-1 flex gap-1">
                    <button
                      type="button"
                      onClick={() => descargar(url)}
                      title="Descargar"
                      aria-label={`Descargar ${etiqueta(url)}`}
                      className="rounded-md bg-ink/80 p-1 text-mist backdrop-blur transition hover:text-cloud"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => quitar(i)}
                      title="Quitar de la galería"
                      aria-label={`Quitar ${etiqueta(url)}`}
                      className="rounded-md bg-ink/80 p-1 text-mist backdrop-blur transition hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="px-2 py-1.5">
                  <p className="truncate text-[11px] text-cloud" title={url}>
                    {etiqueta(url)}
                  </p>
                  <p className="text-[10px] text-mist-2">
                    {roto
                      ? "No se pudo cargar"
                      : (() => {
                          const n = nombreSubido(url);
                          const m = n ? metas[n] : undefined;
                          return m ? pesoLegible(m.size) : url.startsWith("/") ? "En el sitio" : "Enlace externo";
                        })()}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <textarea
        name={kind}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={3}
        className={`${input} font-mono text-xs`}
        placeholder={esImagen ? "Sube fotos o pega URLs (una por línea)" : "Sube videos o pega URLs (una por línea)"}
      />
      <p className="mt-1 text-xs text-mist-2">{ayuda}</p>

      {errores.length > 0 && (
        <ul className="mt-2 space-y-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {errores.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
