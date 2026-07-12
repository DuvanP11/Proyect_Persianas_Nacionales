"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";

type SortKey = "relevancia" | "precio-asc" | "precio-desc" | "tiempo";

export function CatalogClient({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [color, setColor] = useState<string>("");
  const [material, setMaterial] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("relevancia");
  const [showFilters, setShowFilters] = useState(false);

  // Colores y materiales agregados para los filtros (derivados del catálogo).
  const allColors = useMemo(
    () =>
      Array.from(
        new Map(products.flatMap((p) => p.colors).map((c) => [c.name, c])).values(),
      ).sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  );
  const allMaterials = useMemo(
    () => Array.from(new Set(products.map((p) => p.material))).sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = products.filter((p) => {
      // Buscador inteligente: nombre, descripción, tela, material, diseño, colores
      const haystack = [
        p.name,
        p.short,
        p.description,
        p.tela,
        p.material,
        p.diseno,
        ...p.colors.map((c) => c.name),
        ...p.features,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !q || q.split(/\s+/).every((term) => haystack.includes(term));
      const matchesColor = !color || p.colors.some((c) => c.name === color);
      const matchesMaterial = !material || p.material === material;
      return matchesQuery && matchesColor && matchesMaterial;
    });

    switch (sort) {
      case "precio-asc":
        list = [...list].sort((a, b) => (a.pricePerMeter ?? Infinity) - (b.pricePerMeter ?? Infinity));
        break;
      case "precio-desc":
        list = [...list].sort((a, b) => (b.pricePerMeter ?? 0) - (a.pricePerMeter ?? 0));
        break;
      case "tiempo":
        list = [...list].sort((a, b) => a.productionTime.localeCompare(b.productionTime));
        break;
    }
    return list;
  }, [products, query, color, material, sort]);

  const hasActiveFilters = color || material || query;

  const clearAll = () => {
    setQuery("");
    setColor("");
    setMaterial("");
    setSort("relevancia");
  };

  return (
    <div className="mt-10">
      {/* Barra de búsqueda */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, tela, material, color o diseño…"
            className="w-full rounded-full border border-line bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-cloud placeholder:text-mist-2 focus:border-morado/60 focus:outline-none focus:ring-2 focus:ring-morado/30"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-5 py-3 text-sm text-cloud transition-colors hover:border-morado/60 hover:bg-white/[0.05]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </button>
      </div>

      {/* Panel de filtros */}
      <div className={cn("grid gap-3 overflow-hidden transition-all duration-300 sm:grid-cols-3", showFilters ? "mt-4 max-h-96" : "max-h-0")}>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-mist-2">Color</span>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="rounded-xl border border-line bg-ink-soft px-4 py-2.5 text-sm text-cloud focus:border-morado/60 focus:outline-none"
          >
            <option value="">Todos los colores</option>
            {allColors.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-mist-2">Material</span>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="rounded-xl border border-line bg-ink-soft px-4 py-2.5 text-sm text-cloud focus:border-morado/60 focus:outline-none"
          >
            <option value="">Todos los materiales</option>
            {allMaterials.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-mist-2">Ordenar por</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-xl border border-line bg-ink-soft px-4 py-2.5 text-sm text-cloud focus:border-morado/60 focus:outline-none"
          >
            <option value="relevancia">Relevancia</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="tiempo">Tiempo de fabricación</option>
          </select>
        </label>
      </div>

      {/* Resumen de resultados */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-mist">
          {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
        </p>
        {hasActiveFilters && (
          <button onClick={clearAll} className="inline-flex items-center gap-1 text-sm text-morado-light hover:text-cloud">
            <X className="h-3.5 w-3.5" /> Limpiar filtros
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <ProductCard key={p.slug} product={p} priority={i < 3} />
          ))}
        </div>
      ) : (
        <div className="card-premium mt-6 flex flex-col items-center gap-2 p-12 text-center">
          <p className="font-display text-lg text-cloud">Sin resultados</p>
          <p className="text-sm text-mist">Prueba con otros términos o limpia los filtros.</p>
        </div>
      )}
    </div>
  );
}
