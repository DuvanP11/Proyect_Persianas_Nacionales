"use client";

import { useState } from "react";
import { Check, Copy, Download, ExternalLink, Printer } from "lucide-react";

/**
 * Panel del código QR: elige el destino, lo muestra y lo descarga.
 *
 * La imagen la genera el servidor en `/api/qr`, así que aquí no hay librería
 * de QR en el navegador: solo cambia la dirección de la imagen.
 */

type Destino = { id: string; label: string; desc: string; url: string };

export function QrPanel({ destinos }: { destinos: Destino[] }) {
  const [activo, setActivo] = useState(destinos[0]?.id ?? "inicio");
  const [copiado, setCopiado] = useState(false);
  const destino = destinos.find((d) => d.id === activo) ?? destinos[0];

  const src = (params: string) => `/api/qr?dest=${activo}&${params}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(destino.url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: la dirección igual está a la vista.
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-2xl border border-line bg-surface/60 p-5">
        <h2 className="font-display text-lg text-cloud">¿A dónde lleva el código?</h2>
        <p className="mt-0.5 text-xs text-mist-2">
          Elige qué se abre en el celular de quien lo escanea.
        </p>

        <ul className="mt-4 space-y-2">
          {destinos.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => setActivo(d.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  d.id === activo
                    ? "border-morado/60 bg-morado/10"
                    : "border-line hover:border-morado/40"
                }`}
              >
                <span className="flex items-center gap-2 text-sm text-cloud">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      d.id === activo ? "bg-morado-light" : "bg-line"
                    }`}
                  />
                  {d.label}
                </span>
                <span className="mt-0.5 block pl-4 text-xs text-mist-2">{d.desc}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-xl border border-line bg-white/[0.02] p-3">
          <p className="text-xs text-mist-2">Dirección que abre el código</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate font-mono text-xs text-cloud" title={destino.url}>
              {destino.url}
            </p>
            <button
              type="button"
              onClick={copiar}
              title="Copiar dirección"
              className="shrink-0 rounded-lg border border-line p-1.5 text-mist transition hover:border-morado/50 hover:text-cloud"
            >
              {copiado ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface/60 p-5">
        {/* Fondo blanco siempre: un QR sobre fondo oscuro no lo lee ningún
            celular, y esta misma imagen es la que se imprime. */}
        <div className="rounded-xl bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={activo}
            src={src("format=svg&size=512")}
            alt={`Código QR que abre ${destino.label}`}
            className="mx-auto block h-auto w-full max-w-[260px]"
          />
        </div>
        <p className="mt-3 text-center text-xs text-mist-2">
          Pruébalo con la cámara de tu celular antes de mandarlo a imprimir.
        </p>

        <div className="mt-4 space-y-2">
          <a
            href={src("format=png&size=1200&download=1")}
            className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-morado to-naranja px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-morado/25 transition-all hover:-translate-y-0.5"
          >
            <Download className="h-4 w-4" /> Descargar PNG
          </a>
          <a
            href={src("format=svg&download=1")}
            className="flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm text-mist transition hover:text-cloud"
          >
            <Download className="h-4 w-4" /> Descargar SVG (para imprenta)
          </a>
          <a
            href={src("format=png&size=2048")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm text-mist transition hover:text-cloud"
          >
            <ExternalLink className="h-4 w-4" /> Abrir grande
          </a>
          <a
            href={`/admin/qr/imprimir?dest=${activo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm text-mist transition hover:text-cloud"
          >
            <Printer className="h-4 w-4" /> Hoja para imprimir
          </a>
        </div>

        <p className="mt-4 text-xs text-mist-2">
          <strong className="text-mist">PNG</strong> sirve para WhatsApp, redes y Word.{" "}
          <strong className="text-mist">SVG</strong> no pierde nitidez por grande que se
          imprima: es el que debes darle a la litografía.
        </p>
      </div>
    </div>
  );
}
