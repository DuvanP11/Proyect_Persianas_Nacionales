"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Minus, MoveHorizontal, MoveVertical, Plus, ShoppingBag, Zap } from "lucide-react";
import { MeasureGuideButton } from "@/components/catalog/MeasureGuideButton";
import { useCart } from "@/components/cart/CartContext";
import {
  colorOptionsFor,
  defaultFabricFor,
  designOptionsFor,
  FABRIC_OPTIONS,
} from "@/lib/cart";
import { esMotorizable, MOTORIZACION_NOTA, type Product } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * Configurador de producto: el cliente escoge diseño, color, tela, cantidad y
 * metros, y agrega el producto personalizado al carrito de cotización.
 *
 * Se usa tanto en la ficha de producto (`variant="page"`) como dentro del modal
 * de "Agregar" de las tarjetas del catálogo (`variant="compact"`).
 */
export function ProductConfigurator({
  product,
  variant = "page",
  onAdded,
}: {
  product: Product;
  variant?: "page" | "compact";
  onAdded?: () => void;
}) {
  const { addItem } = useCart();

  const designs = useMemo(() => designOptionsFor(product.diseno), [product.diseno]);
  const colors = useMemo(() => colorOptionsFor(product.colors), [product.colors]);
  const fabrics = useMemo(() => {
    const base = defaultFabricFor(product.name, product.tela);
    // Garantiza que la tela sugerida esté en la lista, sin duplicar.
    return FABRIC_OPTIONS.includes(base) ? FABRIC_OPTIONS : [base, ...FABRIC_OPTIONS];
  }, [product.name, product.tela]);

  const [design, setDesign] = useState(designs[0] ?? "");
  const [colorIdx, setColorIdx] = useState(0);
  const [fabric, setFabric] = useState(() => defaultFabricFor(product.name, product.tela));
  const [quantity, setQuantity] = useState(1);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  // Paso obligatorio: sin confirmar la guía de medición no se agrega al carrito.
  const [measureConfirmed, setMeasureConfirmed] = useState(false);
  // Solo aplica a enrollables y verticales; en el resto no se pregunta.
  const motorizable = esMotorizable(product.slug);
  const [motorized, setMotorized] = useState(false);

  const color = colors[colorIdx] ?? colors[0];

  const dec = () => setQuantity((q) => Math.max(1, q - 1));
  const inc = () => setQuantity((q) => Math.min(999, q + 1));

  function handleAdd() {
    const widthNum = parseFloat(width.replace(",", "."));
    const heightNum = parseFloat(height.replace(",", "."));
    if (!design) return setError("Selecciona un diseño.");
    if (!color) return setError("Selecciona un color.");
    if (!fabric) return setError("Selecciona la tela.");
    if (!Number.isFinite(widthNum) || widthNum <= 0) {
      return setError("Indica el ancho en metros (mayor a 0).");
    }
    if (!Number.isFinite(heightNum) || heightNum <= 0) {
      return setError("Indica el alto en metros (mayor a 0).");
    }
    if (!measureConfirmed) {
      return setError('Antes de continuar abre "¿Cómo tomar medidas?" y confirma que ya sabes medir.');
    }
    setError(null);

    addItem({
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      design,
      color: color.name,
      colorHex: color.hex,
      fabric,
      quantity,
      widthM: widthNum,
      heightM: heightNum,
      motorized: motorizable ? motorized : undefined,
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1900);
    onAdded?.();
  }

  const labelCls = "mb-1.5 block text-xs font-medium text-mist-2";
  const selectCls =
    "w-full rounded-xl border border-line bg-white/[0.03] px-3.5 py-2.5 text-sm text-cloud " +
    "outline-none transition-colors focus:border-morado/60 focus:bg-white/[0.05]";
  const measureInputCls =
    "h-11 w-full rounded-xl border border-line bg-white/[0.03] px-3.5 pr-9 text-sm text-cloud " +
    "outline-none transition-colors focus:border-morado/60 focus:bg-white/[0.05] " +
    "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

  return (
    <div className={cn(variant === "page" && "rounded-2xl border border-line bg-white/[0.02] p-5")}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Diseño */}
        <div>
          <label htmlFor={`design-${product.slug}`} className={labelCls}>
            Diseño
          </label>
          <select
            id={`design-${product.slug}`}
            value={design}
            onChange={(e) => setDesign(e.target.value)}
            className={selectCls}
          >
            {designs.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Tela / textura */}
        <div>
          <label htmlFor={`fabric-${product.slug}`} className={labelCls}>
            Tela o textura
          </label>
          <select
            id={`fabric-${product.slug}`}
            value={fabric}
            onChange={(e) => setFabric(e.target.value)}
            className={selectCls}
          >
            {fabrics.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Color con muestra visual */}
      <div className="mt-4">
        <span className={labelCls}>
          Color: <span className="text-cloud">{color?.name}</span>
        </span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color">
          {colors.map((c, i) => {
            const active = i === colorIdx;
            return (
              <button
                key={c.name}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={c.name}
                title={c.name}
                onClick={() => setColorIdx(i)}
                className={cn(
                  "relative h-8 w-8 rounded-full ring-1 ring-line transition-transform hover:scale-110",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-morado",
                  active && "ring-2 ring-morado ring-offset-2 ring-offset-ink",
                )}
                style={{ backgroundColor: c.hex }}
              >
                {active && (
                  <Check
                    className="absolute inset-0 m-auto h-4 w-4 drop-shadow"
                    style={{ color: pickContrast(c.hex) }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Motorización — solo en enrollables y verticales */}
      {motorizable && (
        <div className="mt-4 rounded-xl border border-line bg-white/[0.03] p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-cloud">
              <Zap className="h-4 w-4 text-naranja-light" />
              ¿Motorizada?
            </span>
            <div className="flex gap-1.5" role="radiogroup" aria-label="¿Motorizada?">
              {[
                { valor: true, texto: "Sí" },
                { valor: false, texto: "No" },
              ].map((op) => (
                <button
                  key={op.texto}
                  type="button"
                  role="radio"
                  aria-checked={motorized === op.valor}
                  onClick={() => setMotorized(op.valor)}
                  className={cn(
                    "min-w-14 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                    motorized === op.valor
                      ? "border-morado bg-morado/20 font-medium text-cloud"
                      : "border-line text-mist hover:border-morado/50 hover:text-cloud",
                  )}
                >
                  {op.texto}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-mist-2">{MOTORIZACION_NOTA}</p>
        </div>
      )}

      {/* Cantidad + Metros */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <span className={labelCls}>Cantidad</span>
          <div className="flex h-11 w-full items-center justify-between rounded-xl border border-line bg-white/[0.03] px-1.5">
            <button
              type="button"
              onClick={dec}
              disabled={quantity <= 1}
              aria-label="Disminuir cantidad"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-cloud transition-colors hover:bg-white/[0.06] disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min={1}
              max={999}
              value={quantity}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                setQuantity(Number.isFinite(n) ? Math.min(999, Math.max(1, n)) : 1);
              }}
              aria-label="Cantidad"
              className="w-12 bg-transparent text-center text-sm font-semibold text-cloud outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={inc}
              aria-label="Aumentar cantidad"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-cloud transition-colors hover:bg-white/[0.06]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <label htmlFor={`width-${product.slug}`} className={labelCls}>
            <span className="inline-flex items-center gap-1">
              <MoveHorizontal className="h-3.5 w-3.5 text-morado-light" /> Ancho de la ventana
            </span>
          </label>
          <div className="relative">
            <input
              id={`width-${product.slug}`}
              type="number"
              inputMode="decimal"
              min={0}
              step="0.05"
              placeholder="Ej: 3.25"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className={measureInputCls}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs text-mist-2">
              m
            </span>
          </div>
        </div>
      </div>

      {/* Alto */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`height-${product.slug}`} className={labelCls}>
            <span className="inline-flex items-center gap-1">
              <MoveVertical className="h-3.5 w-3.5 text-naranja-light" /> Alto de la ventana
            </span>
          </label>
          <div className="relative">
            <input
              id={`height-${product.slug}`}
              type="number"
              inputMode="decimal"
              min={0}
              step="0.05"
              placeholder="Ej: 2.40"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className={measureInputCls}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs text-mist-2">
              m
            </span>
          </div>
        </div>

        {/* Guía de medición: paso obligatorio antes de agregar al carrito. */}
        <div className="flex items-end">
          <div className="w-full">
            <MeasureGuideButton
              confirmed={measureConfirmed}
              placement={variant === "compact" ? "overlay" : "anchored"}
              onConfirm={() => {
                setMeasureConfirmed(true);
                setError(null);
              }}
            />
          </div>
        </div>
      </div>

      {/* Error de validación */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-naranja-light"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Botón Agregar al carrito */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={added}
        className={cn(
          "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-white shadow-lg transition-all",
          added
            ? "bg-[#25D366] shadow-[#25D366]/30"
            : "bg-gradient-to-r from-morado to-naranja shadow-morado/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-morado/40",
          // Atenuado mientras falte confirmar la guía; sigue pulsable para que
          // el clic explique el motivo en vez de dejar un botón muerto.
          !added && !measureConfirmed && "opacity-60 shadow-none hover:translate-y-0",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {added ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-2"
            >
              <Check className="h-4 w-4" /> ¡Agregado al carrito!
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" /> Agregar al carrito
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

/** Devuelve negro o blanco según el brillo del color, para el check del swatch. */
function pickContrast(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length < 6) return "#111";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111111" : "#ffffff";
}
