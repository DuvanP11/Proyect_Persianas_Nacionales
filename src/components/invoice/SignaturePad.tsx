"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

/**
 * Lienzo de firma — Cortinería Nacional.
 *
 * Funciona con mouse, dedo y lápiz digital porque usa **Pointer Events**, que
 * unifican los tres en una sola API (con `mouse`/`touch` por separado habría
 * que duplicar la lógica y desactivar el scroll a mano).
 *
 * Detalles que importan para que la firma se vea bien:
 *  · el lienzo se dimensiona a la resolución REAL del dispositivo
 *    (`devicePixelRatio`), si no en pantallas retina el trazo sale borroso;
 *  · `touch-action: none` evita que arrastrar el dedo haga scroll de la página
 *    en vez de dibujar;
 *  · `setPointerCapture` mantiene el trazo aunque el puntero salga del lienzo,
 *    para que no queden líneas cortadas al firmar rápido.
 */
export function SignaturePad({
  onChange,
  height = 200,
}: {
  /** Recibe la firma como data URI PNG, o `null` si el lienzo queda vacío. */
  onChange: (dataUrl: string | null) => void;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  /** Ajusta el búfer del lienzo al tamaño en pantalla por la densidad real. */
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    // Redimensionar el lienzo lo BORRA, así que se preserva lo dibujado.
    const previous = hasInk ? canvas.toDataURL() : null;

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111111"; // tinta oscura: la firma se imprime en blanco

    if (previous) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = previous;
    }
  }, [hasInk]);

  useEffect(() => {
    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, [setupCanvas]);

  /** Coordenadas del puntero relativas al lienzo, en píxeles CSS. */
  function pointFrom(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handleDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const { x, y } = pointFrom(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    // Un toque sin arrastre debe dejar punto: si no, un punto final no marca.
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasInk) setHasInk(true);
  }

  function handleMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pointFrom(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handleUp() {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange(null);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ height, touchAction: "none" }}
        className="w-full cursor-crosshair rounded-xl border border-dashed border-line bg-white"
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
        onPointerCancel={handleUp}
        aria-label="Área de firma"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-mist-2">
          {hasInk ? "Firma capturada." : "Firma con el mouse, el dedo o un lápiz."}
        </p>
        <button
          type="button"
          onClick={clear}
          disabled={!hasInk}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs text-mist transition hover:border-morado/50 hover:text-cloud disabled:opacity-40"
        >
          <Eraser className="h-3.5 w-3.5" /> Limpiar
        </button>
      </div>
    </div>
  );
}
