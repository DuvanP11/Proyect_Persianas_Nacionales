import type { Metadata } from "next";
import { CatalogClient } from "@/components/catalog/CatalogClient";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Explora el catálogo de cortinas y persianas de Cortinería Nacional: Blackout, Sheer Elegance, persianas motorizadas y más. Confección a la medida con instalación gratis.",
};

export default function CatalogoPage() {
  return (
    <div className="pt-28 md:pt-36">
      <div className="container-app">
        <header className="max-w-2xl">
          <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-morado-light">
            <span className="h-px w-6 bg-morado/60" />
            Catálogo
          </span>
          <h1 className="font-display text-4xl font-semibold leading-tight text-cloud sm:text-5xl">
            Encuentra la cortina <span className="text-gradient-brand">perfecta</span>
          </h1>
          <p className="mt-4 text-mist">
            Filtra por tipo, tela, material, color o diseño. Todos nuestros productos se confeccionan
            a la medida e incluyen instalación totalmente gratis.
          </p>
        </header>

        <CatalogClient />
      </div>
    </div>
  );
}
