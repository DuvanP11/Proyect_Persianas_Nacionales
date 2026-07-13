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
 * El ícono es la placa oscura de marca con lamas claras (logo de la empresa).
 */
function BlindsMark({ className }: { className?: string }) {
  // Lamas claras como paralelogramos inclinados dentro de la placa oscura.
  const slat = (top: number) => {
    const X = 11, W = 22, H = 4.4, SKEW = 3, Yb = top + H;
    return `${X},${Yb} ${X + SKEW},${top} ${X + W + SKEW},${top} ${X + W},${Yb}`;
  };
  const SLAT = "#ede8fb";
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id="cn-badge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5a3b8c" />
          <stop offset="1" stopColor="#2c1b44" />
        </linearGradient>
      </defs>
      {/* Placa redondeada oscura */}
      <rect x="3" y="3" width="42" height="42" rx="12" fill="url(#cn-badge)" />
      {/* Lamas claras */}
      {[12.5, 20, 27.5, 35].map((top) => (
        <polygon key={top} points={slat(top)} fill={SLAT} />
      ))}
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
