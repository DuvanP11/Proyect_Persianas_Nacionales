"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export type CategoryFormState = { error?: string };

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
}

export async function saveCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre es obligatorio." };

  const slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  if (!slug) return { error: "No se pudo generar un slug válido; revisa el nombre." };

  const clash = await prisma.category.findUnique({ where: { slug } });
  if (clash && clash.id !== id) {
    return { error: `Ya existe una categoría con el slug "${slug}". Usa otro.` };
  }

  const sortRaw = String(formData.get("sortOrder") ?? "").trim();
  const sortOrder = Number.isFinite(Number(sortRaw)) ? Math.trunc(Number(sortRaw)) : 0;

  const data = {
    slug,
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    sortOrder,
    isActive: formData.get("isActive") === "on",
  };

  if (id) {
    await prisma.category.update({ where: { id }, data });
  } else {
    await prisma.category.create({ data });
  }

  revalidateCatalog();
  redirect("/admin/categorias");
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  // Desasocia los productos (categoryId → null) antes de borrar para no violar la FK.
  await prisma.product.updateMany({
    where: { categoryId: id },
    data: { categoryId: null },
  });
  await prisma.category.delete({ where: { id } });
  revalidateCatalog();
}

export async function toggleCategoryActive(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) return;
  await prisma.category.update({
    where: { id },
    data: { isActive: !cat.isActive },
  });
  revalidateCatalog();
}
