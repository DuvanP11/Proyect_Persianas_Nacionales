"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { PenLine, Trash2, Upload } from "lucide-react";
import { SignaturePad } from "@/components/invoice/SignaturePad";

/** Tamaño máximo de una firma subida. Una firma real no llega ni cerca. */
const MAX_BYTES = 400 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/jpg"];

export type SignatureState = { ok?: boolean; error?: string };

/**
 * Captura de la firma del cliente en una factura.
 *
 * Dos caminos, como pide el flujo de entrega:
 *  1. **Firmar aquí** — lienzo con mouse, dedo o lápiz.
 *  2. **Subir imagen** — PNG o JPG de una firma ya escaneada.
 *
 * En ambos casos se ve la firma ANTES de confirmar, y se puede rehacer.
 * La imagen viaja como data URI: se guarda en la base junto a la factura
 * (ver el comentario del campo `signature` en el esquema).
 */
export function SignatureSection({
  invoiceId,
  current,
  signerName,
  signedAt,
  saveAction,
  removeAction,
}: {
  invoiceId: string;
  /** Firma ya guardada (data URI), si la hay. */
  current: string | null;
  signerName: string | null;
  signedAt: string | null;
  saveAction: (prev: SignatureState, formData: FormData) => Promise<SignatureState>;
  removeAction: (formData: FormData) => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState<SignatureState, FormData>(
    saveAction,
    {},
  );
  const [mode, setMode] = useState<"draw" | "upload">("draw");
  const [signature, setSignature] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [name, setName] = useState(signerName ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  /** Convierte el archivo elegido a data URI para poder previsualizarlo. */
  function handleFile(file: File | undefined) {
    setFileError(null);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setFileError("Formato no admitido. Usa PNG, JPG o JPEG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileError(`La imagen pesa demasiado (máximo ${MAX_BYTES / 1024} KB).`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSignature(String(reader.result));
    reader.onerror = () => setFileError("No se pudo leer el archivo.");
    reader.readAsDataURL(file);
  }

  // Ya firmada: se muestra el resultado y la opción de rehacerla.
  if (current) {
    return (
      <div className="rounded-2xl border border-line bg-surface/60 p-5 print:hidden">
        <h2 className="mb-3 font-display text-lg text-cloud">Firma del cliente</h2>
        <div className="rounded-xl border border-line bg-white p-3">
          {/* `unoptimized`: es un data URI, no hay nada que optimizar. */}
          <Image
            src={current}
            alt={`Firma de ${signerName ?? "el cliente"}`}
            width={420}
            height={140}
            unoptimized
            className="mx-auto h-24 w-auto object-contain"
          />
        </div>
        <p className="mt-2 text-xs text-mist-2">
          Firmada por <span className="text-cloud">{signerName || "el cliente"}</span>
          {signedAt && ` · ${new Date(signedAt).toLocaleString("es-CO")}`}
        </p>
        <form action={removeAction} className="mt-3">
          <input type="hidden" name="id" value={invoiceId} />
          <button
            type="submit"
            onClick={(e) => {
              if (!confirm("¿Eliminar la firma? Habrá que volver a capturarla.")) {
                e.preventDefault();
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-mist transition hover:border-red-500/50 hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" /> Eliminar firma
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-2xl border border-line bg-surface/60 p-5 print:hidden">
      <input type="hidden" name="id" value={invoiceId} />
      <input type="hidden" name="signature" value={signature ?? ""} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg text-cloud">Firma del cliente</h2>
        <div className="flex gap-1.5">
          {(
            [
              { key: "draw" as const, text: "Firmar aquí", Icon: PenLine },
              { key: "upload" as const, text: "Subir imagen", Icon: Upload },
            ]
          ).map(({ key, text, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setMode(key);
                setSignature(null);
                setFileError(null);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
                mode === key
                  ? "border-morado bg-morado/20 text-cloud"
                  : "border-line text-mist hover:border-morado/50 hover:text-cloud"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {text}
            </button>
          ))}
        </div>
      </div>

      {mode === "draw" ? (
        <SignaturePad onChange={setSignature} />
      ) : (
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-morado/50 px-4 py-2.5 text-sm text-morado-light transition hover:bg-morado/10">
            <Upload className="h-4 w-4" /> Elegir imagen (PNG o JPG)
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
          {fileError && <p className="mt-2 text-xs text-red-400">{fileError}</p>}

          {/* Vista previa antes de confirmar */}
          {signature && (
            <div className="mt-3 rounded-xl border border-line bg-white p-3">
              <Image
                src={signature}
                alt="Vista previa de la firma"
                width={420}
                height={140}
                unoptimized
                className="mx-auto h-24 w-auto object-contain"
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-mist-2">Nombre de quien firma</label>
          <input
            name="signerName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre y apellido"
            className="w-full rounded-xl border border-line bg-white/[0.03] px-3 py-2 text-sm text-cloud placeholder:text-mist-2 focus:border-morado/60 focus:outline-none focus:ring-2 focus:ring-morado/30"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending || !signature}
            className="w-full rounded-full bg-gradient-to-r from-morado to-naranja px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-morado/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {pending ? "Guardando…" : "Confirmar firma"}
          </button>
        </div>
      </div>

      {!signature && (
        <p className="mt-2 text-xs text-mist-2">
          {mode === "draw"
            ? "Dibuja la firma para poder confirmarla."
            : "Elige una imagen para poder confirmarla."}
        </p>
      )}
      {state.error && <p className="mt-2 text-sm text-red-300">{state.error}</p>}
    </form>
  );
}
