import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/products";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "@/components/catalog/ProductCard";

export function Categories() {
  return (
    <section id="categorias" className="scroll-mt-24 py-20 md:py-28">
      <div className="container-app">
        <SectionHeading
          eyebrow="Nuestros productos"
          title="Un diseño para cada ventana"
          subtitle="Explora nuestras líneas de cortinas y persianas. Cada una se confecciona a la medida, con múltiples telas, materiales y colores a elegir."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.08}>
              <ProductCard product={p} priority={i < 3} />
            </Reveal>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium text-cloud transition-all hover:-translate-y-0.5 hover:border-morado/60 hover:bg-white/[0.05]"
          >
            Ver catálogo completo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
