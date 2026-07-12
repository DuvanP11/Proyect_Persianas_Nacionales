import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * LOGO — Placeholder reemplazable.
 *
 * Por ahora muestra un monograma "CN" + el nombre y el slogan. Cuando tengas el
 * archivo del logo, coloca la imagen en `public/logo.svg` (o .png) y reemplaza
 * el bloque del monograma por:
 *   <Image src="/logo.svg" alt="Cortinería Nacional" width={44} height={44} priority />
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)} aria-label={siteConfig.name}>
      {/* Monograma (reemplazar por <Image> del logo real) */}
      <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-morado to-naranja text-white shadow-lg shadow-morado/30 transition-transform duration-300 group-hover:scale-105">
        <span className="font-display text-lg font-semibold">CN</span>
        <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
      </span>

      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-semibold text-cloud sm:text-lg">
            Cortinería <span className="text-morado-light">Nacional</span>
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-mist">
            {siteConfig.slogan}
          </span>
        </span>
      )}
    </Link>
  );
}
