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
  return (
    <svg viewBox="0 0 44 44" className={className} role="img" aria-hidden="true" fill="none">
      <defs>
        <linearGradient id="cn-blinds" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      {/* Lamas de la persiana */}
      {[2.5, 11.5, 20.5, 29.5].map((y) => (
        <g key={y}>
          <rect x="3" y={y} width="27" height="6.6" rx="1.6" fill="url(#cn-blinds)" />
          <rect x="5.5" y={y + 1.5} width="22" height="0.9" rx="0.45" fill="#ffffff" opacity="0.2" />
          <rect x="5.5" y={y + 3.7} width="22" height="0.9" rx="0.45" fill="#000000" opacity="0.14" />
        </g>
      ))}
      {/* Soporte + base */}
      <rect x="33.4" y="2" width="2.6" height="36" rx="1.3" fill="url(#cn-blinds)" />
      <circle cx="34.7" cy="41" r="2.7" fill="url(#cn-blinds)" />
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
