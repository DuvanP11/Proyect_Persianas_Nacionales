import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm, type ProductFormValues } from "../ProductForm";

type ColorJson = { name: string; hex: string };

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [p, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { media: true } }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  if (!p) notFound();

  const media = [...p.media].sort((a, b) => a.sortOrder - b.sortOrder);
  const colors = Array.isArray(p.colors) ? (p.colors as unknown as ColorJson[]) : [];

  const initial: ProductFormValues = {
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDesc: p.shortDesc ?? "",
    description: p.description ?? "",
    fabric: p.fabric ?? "",
    material: p.material ?? "",
    design: p.design ?? "",
    designRef: p.designRef ?? "",
    allowChainSide: p.allowChainSide,
    productionTime: p.productionTime ?? "",
    gradient: p.gradient ?? "",
    pricePerMeter: p.pricePerMeter != null ? String(p.pricePerMeter) : "",
    colors: colors.map((c) => `${c.name} ${c.hex}`).join("\n"),
    features: (p.features ?? []).join("\n"),
    images: media.filter((m) => m.type === "IMAGE").map((m) => m.url).join("\n"),
    videos: media.filter((m) => m.type === "VIDEO").map((m) => m.url).join("\n"),
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    categoryId: p.categoryId ?? "",
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/productos" className="text-sm text-mist transition hover:text-cloud">
          ← Volver a productos
        </Link>
        <h1 className="mt-2 font-display text-3xl text-cloud">Editar: {p.name}</h1>
        <a
          href={`/catalogo/${p.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-morado-light hover:underline"
        >
          Ver en el sitio →
        </a>
      </div>
      <ProductForm initial={initial} categories={categories} />
    </div>
  );
}
