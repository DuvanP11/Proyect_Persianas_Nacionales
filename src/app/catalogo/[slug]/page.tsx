import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Clock, MessageCircle, BadgeCheck, Image as ImageIcon, Play } from "lucide-react";
import { getCatalogProductBySlug, getCatalogProducts, getCatalogSlugs } from "@/lib/catalog";
import { siteConfig } from "@/lib/site-config";
import { formatCOP } from "@/lib/utils";
import { buildWhatsAppUrl, quickQuoteMessage } from "@/lib/whatsapp";
import { ProductMedia } from "@/components/catalog/ProductMedia";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

export async function generateStaticParams() {
  const slugs = await getCatalogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.short,
    openGraph: { title: `${product.name} · ${siteConfig.name}`, description: product.short },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) notFound();

  const all = await getCatalogProducts();
  const related = all.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div className="pt-28 md:pt-36">
      <div className="container-app">
        <Link href="/catalogo" className="inline-flex items-center gap-2 text-sm text-mist transition-colors hover:text-cloud">
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          {/* Galería */}
          <div>
            <div className="group overflow-hidden rounded-3xl border border-line">
              <ProductMedia product={product} className="aspect-[4/3]" priority />
            </div>
            {/* Miniaturas / videos — espacio preparado para los archivos reales */}
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-line bg-ink-soft text-mist-2">
                  <ImageIcon className="h-5 w-5" />
                </div>
              ))}
              <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-line bg-ink-soft text-mist-2">
                <Play className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-mist-2">Galería lista para cargar fotos y videos.</p>
          </div>

          {/* Info */}
          <div>
            <h1 className="font-display text-4xl font-semibold text-cloud sm:text-5xl">{product.name}</h1>
            <p className="mt-4 text-lg leading-relaxed text-mist">{product.description}</p>

            {/* Precio */}
            <div className="mt-6 flex items-end gap-6">
              <div>
                <span className="block text-xs uppercase tracking-wide text-mist-2">Precio por metro</span>
                <span className="font-display text-3xl font-semibold text-gradient-brand">
                  {product.pricePerMeter ? `${formatCOP(product.pricePerMeter)}` : "Cotiza tu medida"}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 pb-1 text-sm text-mist">
                <Clock className="h-4 w-4 text-morado-light" />
                {product.productionTime}
              </span>
            </div>

            {/* Ficha técnica */}
            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-line bg-white/[0.02] p-5 text-sm">
              <div>
                <dt className="text-mist-2">Tipo de tela</dt>
                <dd className="mt-1 text-cloud">{product.tela}</dd>
              </div>
              <div>
                <dt className="text-mist-2">Material</dt>
                <dd className="mt-1 text-cloud">{product.material}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-mist-2">Diseño</dt>
                <dd className="mt-1 text-cloud">{product.diseno}</dd>
              </div>
            </dl>

            {/* Colores */}
            <div className="mt-6">
              <p className="text-sm text-mist-2">Colores disponibles</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <span key={c.name} className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.02] py-1 pl-1.5 pr-3 text-xs text-cloud">
                    <span className="h-4 w-4 rounded-full ring-1 ring-line" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Características */}
            <div className="mt-6">
              <p className="text-sm text-mist-2">Características</p>
              <ul className="mt-2 grid grid-cols-2 gap-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-cloud">
                    <Check className="h-4 w-4 shrink-0 text-morado-light" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/cotizar?producto=${encodeURIComponent(product.name)}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-morado to-naranja px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-morado/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-morado/40"
              >
                Cotizar este producto
              </Link>
              <a
                href={buildWhatsAppUrl(quickQuoteMessage(product.name))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-[#25D366]/25 transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>

            {/* Instalación gratis */}
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-naranja/25 bg-naranja/[0.07] py-3 text-sm font-medium text-naranja-light">
              <BadgeCheck className="h-5 w-5" /> {siteConfig.freeInstall}
            </div>
          </div>
        </div>

        {/* Relacionados */}
        <section className="mt-24">
          <h2 className="font-display text-2xl font-semibold text-cloud">También te puede gustar</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <Reveal key={p.slug}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
