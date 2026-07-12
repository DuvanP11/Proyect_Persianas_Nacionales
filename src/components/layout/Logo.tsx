import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * LOGO — Cortinería Nacional.
 *
 * Ícono de persianas (SVG vectorial, en morado de marca) + wordmark.
 * El texto usa `text-cloud`, que en Tailwind v4 compila a `color: var(--color-cloud)`.
 * Como `--color-cloud` es el color de primer plano del tema, la letra es:
 *   · tema oscuro (actual)  → blanca
 *   · tema claro (si se agrega, redefiniendo el token) → negra
 * El ícono es morado en ambos casos (color de acento de la marca).
 */
function BlindsMark({ className }: { className?: string }) {
  // Lamas como paralelogramos inclinados (top desplazado a la derecha).
  const slat = (top: number) => {
    const X = 11.5, W = 18.5, H = 4.4, SKEW = 3, Yb = top + H;
    return `${X},${Yb} ${X + SKEW},${top} ${X + W + SKEW},${top} ${X + W},${Yb}`;
  };
  const AUBERGINE = "#3f2a5c";
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-hidden="true">
      {/* Placa circular */}
      <circle cx="24" cy="24" r="23" fill="#ffffff" stroke="#241a33" strokeWidth="1.5" />
      {/* Lamas de la persiana */}
      {[12.8, 19, 25.2, 31.4].map((top) => (
        <polygon key={top} points={slat(top)} fill={AUBERGINE} />
      ))}
      {/* Asta */}
      <rect x="33.6" y="11" width="1.8" height="25" rx="0.9" fill={AUBERGINE} />
      {/* Base / pesa */}
      <path d="M32.9 35.8 L35.9 35.8 L35.1 38.4 L34.4 39.6 L33.7 38.4 Z" fill={AUBERGINE} />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)} aria-label={siteConfig.name}>
      <BlindsMark className="h-10 w-10 shrink-0 transition-transform duration-300 group-hover:scale-105" />

      {!compact && (
        <span className="flex flex-col leading-none text-cloud">
          <span className="text-lg font-extrabold uppercase tracking-[0.02em]">
            Cortineria
          </span>
          <span className="mt-1 text-[13px] font-medium uppercase tracking-[0.40em] text-cloud/85">
            Nacional
          </span>
        </span>
      )}
    </Link>
  );
}
