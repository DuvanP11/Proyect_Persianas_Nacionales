/**
 * Capa de datos del catálogo — Cortinería Nacional.
 *
 * Fuente de verdad: la base de datos (modelos `Product`/`ProductMedia`/`Category`).
 * Estas funciones devuelven exactamente la interfaz `Product` de la Fase 1, de modo
 * que los componentes públicos (tarjetas, ficha, buscador, formulario) no cambian.
 *
 * Degradación elegante: si no hay `DATABASE_URL` configurada, o la consulta falla,
 * se devuelve el catálogo estático de `products.ts`. Así el sitio nunca se rompe,
 * ni siquiera durante un build de producción sin base de datos.
 */

import { prisma, hasDatabase } from "@/lib/prisma";
import {
  products as staticProducts,
  type Product,
  type ProductColor,
} from "@/lib/products";

export type { Product, ProductColor } from "@/lib/products";

type DbProductWithMedia = {
  slug: string;
  name: string;
  shortDesc: string | null;
  description: string | null;
  fabric: string | null;
  material: string | null;
  design: string | null;
  colors: unknown;
  pricePerMeter: number | null;
  productionTime: string | null;
  features: string[];
  gradient: string | null;
  isFeatured: boolean;
  media: { type: string; url: string; sortOrder: number }[];
  category: { slug: string; name: string; isActive: boolean } | null;
};

/** Convierte una fila de la BD a la interfaz `Product` que consume el sitio. */
function mapDbProduct(p: DbProductWithMedia): Product {
  const media = [...p.media].sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    slug: p.slug,
    name: p.name,
    short: p.shortDesc ?? "",
    description: p.description ?? "",
    tela: p.fabric ?? "",
    material: p.material ?? "",
    diseno: p.design ?? "",
    colors: Array.isArray(p.colors) ? (p.colors as ProductColor[]) : [],
    pricePerMeter: p.pricePerMeter ?? null,
    productionTime: p.productionTime ?? "",
    features: p.features ?? [],
    images: media.filter((m) => m.type === "IMAGE").map((m) => m.url),
    videos: media.filter((m) => m.type === "VIDEO").map((m) => m.url),
    gradient: p.gradient ?? "from-slate-800 via-slate-700 to-slate-900",
    featured: p.isFeatured,
    // Solo se expone la categoría al público si está activa.
    category:
      p.category && p.category.isActive
        ? { slug: p.category.slug, name: p.category.name }
        : null,
  };
}

/** Todos los productos activos, ordenados igual que el catálogo estático. */
export async function getCatalogProducts(): Promise<Product[]> {
  if (!hasDatabase) return staticProducts;
  try {
    const rows = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "asc" }],
      include: { media: true, category: true },
    });
    if (rows.length === 0) return staticProducts;
    return rows.map(mapDbProduct);
  } catch {
    return staticProducts;
  }
}

/** Un producto activo por su slug (o `undefined` si no existe). */
export async function getCatalogProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  if (!hasDatabase) return staticProducts.find((p) => p.slug === slug);
  try {
    const row = await prisma.product.findFirst({
      where: { slug, isActive: true },
      include: { media: true, category: true },
    });
    if (!row) {
      // Puede que la BD esté vacía (pre-seed): cae al estático.
      const count = await prisma.product.count();
      if (count === 0) return staticProducts.find((p) => p.slug === slug);
      return undefined;
    }
    return mapDbProduct(row);
  } catch {
    return staticProducts.find((p) => p.slug === slug);
  }
}

/** Slugs de todos los productos activos (para sitemap y generateStaticParams). */
export async function getCatalogSlugs(): Promise<string[]> {
  if (!hasDatabase) return staticProducts.map((p) => p.slug);
  try {
    const rows = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    if (rows.length === 0) return staticProducts.map((p) => p.slug);
    return rows.map((r) => r.slug);
  } catch {
    return staticProducts.map((p) => p.slug);
  }
}
