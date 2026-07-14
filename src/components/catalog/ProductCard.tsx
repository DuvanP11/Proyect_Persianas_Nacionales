import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import type { Product } from "@/lib/products";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl, quickQuoteMessage } from "@/lib/whatsapp";
import { ProductMedia } from "./ProductMedia";
import { CardAddToCart } from "./QuickAddModal";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article className="group card-premium flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-morado/50 hover:shadow-[0_30px_60px_-30px_rgba(139,92,246,0.5)]">
      <Link href={`/catalogo/${product.slug}`} className="block">
        <ProductMedia product={product} className="aspect-[4/3]" priority={priority} />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {product.category && (
          <Link
            href={`/catalogo?categoria=${product.category.slug}`}
            className="mb-1 inline-block w-fit text-[11px] font-semibold uppercase tracking-[0.14em] text-morado-light transition-colors hover:text-naranja"
          >
            {product.category.name}
          </Link>
        )}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-cloud">
            <Link href={`/catalogo/${product.slug}`} className="transition-colors hover:text-morado-light">
              {product.name}
            </Link>
          </h3>
          <span className="shrink-0 rounded-full bg-morado/15 px-2.5 py-1 text-[11px] font-medium text-morado-light">
            {product.diseno.split(",")[0]}
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-mist">{product.short}</p>

        {/* Ficha rápida */}
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <dt className="text-mist-2">Tela</dt>
            <dd className="mt-0.5 text-cloud">{product.tela}</dd>
          </div>
          <div>
            <dt className="text-mist-2">Material</dt>
            <dd className="mt-0.5 text-cloud">{product.material}</dd>
          </div>
        </dl>

        {/* Colores */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-mist-2">Colores:</span>
          <div className="flex -space-x-1">
            {product.colors.slice(0, 5).map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-5 w-5 rounded-full border border-line ring-1 ring-ink"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="mt-5 flex gap-2">
          <CardAddToCart product={product} />
          <a
            href={buildWhatsAppUrl(quickQuoteMessage(product.name))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Contactar por WhatsApp sobre ${product.name}`}
            className="inline-flex items-center justify-center rounded-full border border-line px-3.5 py-2.5 text-[#25D366] transition-all hover:-translate-y-0.5 hover:border-[#25D366]/50 hover:bg-[#25D366]/10"
          >
            <WhatsAppIcon className="h-4 w-4" />
          </a>
        </div>
        <Link
          href={`/catalogo/${product.slug}`}
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-line bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-cloud transition-all hover:-translate-y-0.5 hover:border-morado/60 hover:bg-white/[0.05]"
        >
          Ver detalle y personalizar
        </Link>

        {/* Distintivo instalación gratis */}
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-naranja/25 bg-naranja/[0.07] py-2 text-sm font-medium text-naranja-light">
          <BadgeCheck className="h-4 w-4" />
          {siteConfig.freeInstall}
        </div>
      </div>
    </article>
  );
}
