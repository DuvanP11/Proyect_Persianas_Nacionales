"use client";

import { useState } from "react";
import { Check, Palette, Plus, Trash2, Type } from "lucide-react";

/**
 * Selector visual de colores del producto.
 *
 * El administrador no tiene por qué saber códigos hexadecimales: aquí elige el
 * color de una paleta de tonos habituales en cortinería o lo ajusta con la
 * ruedita del navegador, y le pone el nombre con el que se vende.
 *
 * Lo que se envía sigue siendo un campo `colors` con una línea por color en el
 * formato "Nombre #hex", igual que antes, así que el servidor no cambia.
 */

type Color = { name: string; hex: string };

/** Tonos frecuentes en telas de cortina, persiana y blackout. */
const PALETA: { grupo: string; colores: Color[] }[] = [
  {
    grupo: "Claros y neutros",
    colores: [
      { name: "Blanco", hex: "#f2f2f0" },
      { name: "Marfil", hex: "#efe7d8" },
      { name: "Hueso", hex: "#eae4d5" },
      { name: "Crema", hex: "#e7dcc6" },
      { name: "Lino", hex: "#e0d6c3" },
      { name: "Fawn", hex: "#ddd2bb" },
      { name: "Beige", hex: "#d8cbb3" },
      { name: "Arena", hex: "#d7c9ad" },
      { name: "Trigo", hex: "#cbb994" },
      { name: "Perlado", hex: "#cfc7ba" },
    ],
  },
  {
    grupo: "Grises y oscuros",
    colores: [
      { name: "Gris claro", hex: "#c2c4c6" },
      { name: "Plata", hex: "#b7bcc1" },
      { name: "Humo", hex: "#b3c4d6" },
      { name: "Gris", hex: "#9aa0a6" },
      { name: "Titanio", hex: "#6b7581" },
      { name: "Carbón", hex: "#4a4d52" },
      { name: "Grafito", hex: "#3f4348" },
      { name: "Antracita", hex: "#33363b" },
      { name: "Negro", hex: "#1a1a1a" },
    ],
  },
  {
    grupo: "Tierra y cálidos",
    colores: [
      { name: "Taupe", hex: "#8a7b6b" },
      { name: "Camel", hex: "#b28e5f" },
      { name: "Dorado", hex: "#c9a86a" },
      { name: "Mostaza", hex: "#c9a227" },
      { name: "Cobre", hex: "#a4623a" },
      { name: "Terracota", hex: "#b5603f" },
      { name: "Café", hex: "#6b4f3a" },
      { name: "Chocolate", hex: "#4b3423" },
      { name: "Vino", hex: "#6d2436" },
    ],
  },
  {
    grupo: "Fríos y color",
    colores: [
      { name: "Rosado", hex: "#e9cdd8" },
      { name: "Lila", hex: "#b9a7cf" },
      { name: "Cielo", hex: "#bcd7e8" },
      { name: "Azul", hex: "#3d7fb5" },
      { name: "Azul noche", hex: "#24405c" },
      { name: "Salvia", hex: "#9caf88" },
      { name: "Oliva", hex: "#6b7a4a" },
      { name: "Bosque", hex: "#2f4a3a" },
    ],
  },
];

const input =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-cloud placeholder:text-mist-2 focus:border-morado/60 focus:outline-none focus:ring-2 focus:ring-morado/30 transition-colors";

/** "Blanco humo #e7e5e4" → { name: "Blanco humo", hex: "#e7e5e4" } */
function parsear(texto: string): Color[] {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((linea) => {
      const m = linea.match(/(#[0-9a-fA-F]{3,8})\s*$/);
      const hex = m ? normalizar(m[1]) : "#cccccc";
      const name = (m ? linea.slice(0, m.index).trim() : linea).trim();
      return { name, hex };
    })
    .filter((c) => c.name.length > 0);
}

const serializar = (colores: Color[]) =>
  colores
    .filter((c) => c.name.trim())
    .map((c) => `${c.name.trim()} ${c.hex}`)
    .join("\n");

/** `input type="color"` solo entiende #rrggbb: expande #abc y recorta el alfa. */
function normalizar(hex: string): string {
  const h = hex.replace("#", "").toLowerCase();
  if (h.length === 3) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  if (h.length >= 6) return `#${h.slice(0, 6)}`;
  return "#cccccc";
}

export function ColorField({ defaultValue }: { defaultValue: string }) {
  const [colores, setColores] = useState<Color[]>(() => parsear(defaultValue));
  const [modoTexto, setModoTexto] = useState(false);
  const [texto, setTexto] = useState(defaultValue);

  // El modo texto edita lo mismo por si el admin prefiere pegar una lista.
  const valor = modoTexto ? texto : serializar(colores);

  function cambiar(i: number, campo: keyof Color, valor: string) {
    setColores((prev) => prev.map((c, idx) => (idx === i ? { ...c, [campo]: valor } : c)));
  }

  function agregar(color: Color) {
    setColores((prev) => [...prev, color]);
  }

  function quitar(i: number) {
    setColores((prev) => prev.filter((_, idx) => idx !== i));
  }

  function alternarModo() {
    if (modoTexto) setColores(parsear(texto)); // texto → lista
    else setTexto(serializar(colores)); // lista → texto
    setModoTexto((v) => !v);
  }

  const yaEsta = (hex: string) => colores.some((c) => c.hex.toLowerCase() === hex.toLowerCase());

  return (
    <div>
      {/* Lo que realmente viaja en el formulario. */}
      <input type="hidden" name="colors" value={valor} />

      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm text-mist">
          Colores disponibles
          {colores.length > 0 && !modoTexto && (
            <span className="ml-1.5 text-xs text-mist-2">({colores.length})</span>
          )}
        </label>
        <button
          type="button"
          onClick={alternarModo}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs text-mist transition hover:border-morado/50 hover:text-cloud"
        >
          {modoTexto ? <Palette className="h-3.5 w-3.5" /> : <Type className="h-3.5 w-3.5" />}
          {modoTexto ? "Volver a la paleta" : "Escribir a mano"}
        </button>
      </div>

      {modoTexto ? (
        <>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={6}
            className={`${input} font-mono text-xs`}
            placeholder={"Blanco humo #e7e5e4\nNegro #1c1c1c"}
          />
          <p className="mt-1 text-xs text-mist-2">
            Una línea por color, con el formato “Nombre #hex”. El #hex va al final.
          </p>
        </>
      ) : (
        <>
          {/* Colores ya elegidos */}
          {colores.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-3 text-sm text-mist-2">
              Este producto todavía no tiene colores. Elige uno de la paleta de abajo.
            </p>
          ) : (
            <ul className="space-y-2">
              {colores.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  <label className="relative shrink-0" title="Cambiar el tono exacto">
                    <input
                      type="color"
                      value={c.hex}
                      onChange={(e) => cambiar(i, "hex", e.target.value)}
                      aria-label={`Tono de ${c.name || "color sin nombre"}`}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-transparent p-1 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
                    />
                  </label>
                  <input
                    value={c.name}
                    onChange={(e) => cambiar(i, "name", e.target.value)}
                    placeholder="Nombre del color (Beige, Titanio…)"
                    className={input}
                  />
                  <span className="hidden shrink-0 font-mono text-[11px] text-mist-2 sm:inline">
                    {c.hex}
                  </span>
                  <button
                    type="button"
                    onClick={() => quitar(i)}
                    aria-label={`Quitar ${c.name || "color"}`}
                    title="Quitar color"
                    className="shrink-0 rounded-lg border border-line p-2 text-mist transition hover:border-red-500/40 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={() => agregar({ name: "", hex: "#cccccc" })}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-mist transition hover:border-morado/50 hover:text-cloud"
          >
            <Plus className="h-3.5 w-3.5" />
            Color personalizado
          </button>

          {/* Paleta: un clic agrega el color con su nombre ya puesto. */}
          <div className="mt-4 rounded-xl border border-line bg-white/[0.02] p-3">
            <p className="mb-2 text-xs text-mist">
              Toca un color para agregarlo. Después puedes cambiarle el nombre o el tono.
            </p>
            <div className="space-y-3">
              {PALETA.map((seccion) => (
                <div key={seccion.grupo}>
                  <p className="mb-1.5 text-[11px] uppercase tracking-wide text-mist-2">
                    {seccion.grupo}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {seccion.colores.map((color) => {
                      const puesto = yaEsta(color.hex);
                      return (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => agregar(color)}
                          title={`${color.name} · ${color.hex}`}
                          className="group flex items-center gap-1.5 rounded-lg border border-line py-1 pl-1 pr-2 text-xs text-mist transition hover:border-morado/60 hover:text-cloud"
                        >
                          <span
                            className="relative grid h-5 w-5 place-items-center rounded-md border border-white/10"
                            style={{ backgroundColor: color.hex }}
                          >
                            {puesto && <Check className="h-3 w-3 text-black/70" />}
                          </span>
                          {color.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
