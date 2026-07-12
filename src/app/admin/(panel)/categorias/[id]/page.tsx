import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm, type CategoryFormValues } from "../CategoryForm";

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await prisma.category.findUnique({ where: { id } });
  if (!c) notFound();

  const initial: CategoryFormValues = {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    sortOrder: String(c.sortOrder),
    isActive: c.isActive,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/categorias" className="text-sm text-mist transition hover:text-cloud">
          ← Volver a categorías
        </Link>
        <h1 className="mt-2 font-display text-3xl text-cloud">Editar: {c.name}</h1>
      </div>
      <CategoryForm initial={initial} />
    </div>
  );
}
