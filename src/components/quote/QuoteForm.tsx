"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, Loader2, CheckCircle2, Tag, Calculator } from "lucide-react";
import { quoteSchema, type QuoteInput } from "@/lib/schemas";
import type { Product } from "@/lib/products";
import { formatCOP } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl, quoteToWhatsAppMessage } from "@/lib/whatsapp";

const inputClass =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-cloud placeholder:text-mist-2 " +
  "focus:border-morado/60 focus:outline-none focus:ring-2 focus:ring-morado/30 transition-colors";
const labelClass = "mb-1.5 block text-sm text-mist";
const errClass = "mt-1 text-xs text-red-400";

export function QuoteForm({
  initialProduct,
  products,
}: {
  initialProduct?: string;
  products: Pick<Product, "slug" | "name" | "pricePerMeter">[];
}) {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      producto: initialProduct ?? "",
      cantidad: 1,
      tieneVolante: false,
    },
  });

  useEffect(() => {
    if (initialProduct) setValue("producto", initialProduct);
  }, [initialProduct, setValue]);

  const tieneVolante = watch("tieneVolante");
  const productoName = watch("producto");
  const metros = watch("metros");
  const cantidad = watch("cantidad");
  const descuentoPct = watch("descuentoPct");
  const codigoPromo = watch("codigoPromo");

  const [promo, setPromo] = useState<{ state: "idle" | "checking" | "ok" | "bad"; msg?: string }>({
    state: "idle",
  });

  const validarCodigo = async () => {
    const code = (codigoPromo ?? "").trim();
    if (!code) return;
    setPromo({ state: "checking" });
    try {
      const res = await fetch(`/api/promo?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.valid) {
        setValue("descuentoPct", data.discountPct);
        setPromo({ state: "ok", msg: `¡Código válido! ${data.discountPct}% de descuento aplicado.` });
      } else {
        setPromo({ state: "bad", msg: data.reason ?? "Código no válido" });
      }
    } catch {
      setPromo({ state: "bad", msg: "No se pudo validar el código" });
    }
  };

  // Estimación de precio (referencial)
  const selected = products.find((p) => p.name === productoName);
  const base =
    selected?.pricePerMeter && metros && cantidad
      ? selected.pricePerMeter * Number(metros) * Number(cantidad)
      : null;
  const total =
    base != null ? Math.round(base * (1 - (Number(descuentoPct) || 0) / 100)) : null;

  const onSubmit = async (data: QuoteInput) => {
    setServerError(null);
    try {
      // 1) Persistir + notificar (la API degrada elegantemente si no hay BD/correo aún)
      const res = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo enviar la cotización");
      }

      // 2) Abrir WhatsApp con el mensaje prellenado
      const url = buildWhatsAppUrl(
        quoteToWhatsAppMessage({
          nombre: data.nombre,
          apellidos: data.apellidos,
          telefono: data.telefono,
          correo: data.correo,
          ciudad: data.ciudad,
          direccion: data.direccion,
          producto: data.producto,
          cantidad: Number(data.cantidad),
          metros: data.metros ? Number(data.metros) : undefined,
          comentarios: data.comentarios,
          codigoPromo: data.tieneVolante ? data.codigoPromo : undefined,
          descuentoPct: data.tieneVolante ? Number(data.descuentoPct) : undefined,
        }),
      );
      window.open(url, "_blank", "noopener,noreferrer");
      setSent(true);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Error inesperado");
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-premium flex flex-col items-center gap-4 p-12 text-center"
      >
        <CheckCircle2 className="h-14 w-14 text-emerald-400" />
        <h3 className="font-display text-2xl font-semibold text-cloud">¡Cotización enviada!</h3>
        <p className="max-w-md text-mist">
          Abrimos WhatsApp con los datos de tu cotización. Si no se abrió automáticamente, revisa las
          ventanas emergentes. Te contactaremos muy pronto.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-2 rounded-full border border-line px-5 py-2.5 text-sm text-cloud hover:border-morado/60"
        >
          Enviar otra cotización
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-premium p-6 md:p-8">
      {/* Honeypot anti-spam (oculto) */}
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("website")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nombre *</label>
          <input className={inputClass} placeholder="Tu nombre" {...register("nombre")} />
          {errors.nombre && <p className={errClass}>{errors.nombre.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Apellidos *</label>
          <input className={inputClass} placeholder="Tus apellidos" {...register("apellidos")} />
          {errors.apellidos && <p className={errClass}>{errors.apellidos.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Teléfono / WhatsApp *</label>
          <input className={inputClass} placeholder="300 000 0000" inputMode="tel" {...register("telefono")} />
          {errors.telefono && <p className={errClass}>{errors.telefono.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Correo *</label>
          <input className={inputClass} placeholder="tucorreo@email.com" inputMode="email" {...register("correo")} />
          {errors.correo && <p className={errClass}>{errors.correo.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Ciudad *</label>
          <input className={inputClass} placeholder="Bogotá" {...register("ciudad")} />
          {errors.ciudad && <p className={errClass}>{errors.ciudad.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Dirección *</label>
          <input className={inputClass} placeholder="Cra 00 #00-00" {...register("direccion")} />
          {errors.direccion && <p className={errClass}>{errors.direccion.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Producto *</label>
          <select className={inputClass} {...register("producto")}>
            <option value="">Selecciona un producto</option>
            {products.map((p) => (
              <option key={p.slug} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.producto && <p className={errClass}>{errors.producto.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Cantidad *</label>
            <input
              type="number"
              min={1}
              className={inputClass}
              {...register("cantidad", { setValueAs: (v) => (v === "" || v == null ? NaN : Number(v)) })}
            />
            {errors.cantidad && <p className={errClass}>{errors.cantidad.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Metros aprox.</label>
            <input
              type="number"
              min={0}
              step="0.1"
              className={inputClass}
              placeholder="0.0"
              {...register("metros", { setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)) })}
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Comentarios</label>
          <textarea
            rows={3}
            className={inputClass}
            placeholder="Cuéntanos detalles: color, diseño, tipo de ventana, fecha deseada…"
            {...register("comentarios")}
          />
        </div>
      </div>

      {/* Módulo de descuento */}
      <div className="mt-6 rounded-2xl border border-line bg-white/[0.02] p-5">
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" className="peer sr-only" {...register("tieneVolante")} />
          <span className="relative h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-morado">
            <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
          </span>
          <span className="flex items-center gap-2 text-sm font-medium text-cloud">
            <Tag className="h-4 w-4 text-morado-light" />
            ¿Tienes un volante promocional?
          </span>
        </label>

        <AnimatePresence>
          {tieneVolante && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Código</label>
                  <div className="flex gap-2">
                    <input className={inputClass} placeholder="Ej: PROMO20" {...register("codigoPromo")} />
                    <button
                      type="button"
                      onClick={validarCodigo}
                      disabled={promo.state === "checking"}
                      className="shrink-0 rounded-xl border border-morado/50 px-3 text-sm text-morado-light transition hover:bg-morado/10 disabled:opacity-60"
                    >
                      {promo.state === "checking" ? "…" : "Validar"}
                    </button>
                  </div>
                  {promo.msg && (
                    <p className={`mt-1 text-xs ${promo.state === "ok" ? "text-emerald-400" : "text-red-400"}`}>
                      {promo.msg}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Porcentaje de descuento (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={inputClass}
                    placeholder="20"
                    {...register("descuentoPct", { setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)) })}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Estimación de precio */}
      {siteConfig.showPrices && total != null && (
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-morado/25 bg-morado/[0.06] px-5 py-4">
          <span className="flex items-center gap-2 text-sm text-mist">
            <Calculator className="h-4 w-4 text-morado-light" /> Estimado referencial
          </span>
          <div className="text-right">
            {base != null && total !== base && (
              <span className="mr-2 text-sm text-mist-2 line-through">{formatCOP(base)}</span>
            )}
            <span className="font-display text-xl font-semibold text-cloud">{formatCOP(total)}</span>
          </div>
        </div>
      )}

      {serverError && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-morado to-naranja px-6 py-4 text-base font-medium text-white shadow-lg shadow-morado/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-morado/40 disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Enviando…
          </>
        ) : (
          <>
            <MessageCircle className="h-5 w-5" /> Enviar cotización por WhatsApp
          </>
        )}
      </button>
      <p className="mt-3 text-center text-xs text-mist-2">
        Al enviar aceptas nuestra política de tratamiento de datos. Instalación totalmente gratis.
      </p>
    </form>
  );
}
