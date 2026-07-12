import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/productos" className="text-sm text-mist transition hover:text-cloud">
          ← Volver a productos
        </Link>
        <h1 className="mt-2 font-display text-3xl text-cloud">Nuevo producto</h1>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
