"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type ProductFormState = { error?: string };

/** Revalida todas las rutas públicas que muestran el catálogo. */
function revalidateCatalog(slug?: string) {
  revalidatePath("/"); // home (sección categorías)
  revalidatePath("/catalogo");
  revalidatePath("/cotizar");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/catalogo/${slug}`);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Convierte un textarea (una línea por elemento) en arreglo, sin vacíos. */
function linesToArray(raw: string): string[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Parsea líneas "Nombre #hex" a [{ name, hex }]. */
function parseColors(raw: string): { name: string; hex: string }[] {
  return linesToArray(raw)
    .map((line) => {
      const match = line.match(/(#[0-9a-fA-F]{3,8})\s*$/);
      const hex = match ? match[1] : "#cccccc";
      const name = (match ? line.slice(0, match.index).trim() : line).trim();
      return { name, hex };
    })
    .filter((c) => c.name.length > 0);
}

function num(raw: FormDataEntryValue | null): number | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const n = Number(s.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : null;
}

export async function saveProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre es obligatorio." };

  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || name);
  if (!slug) return { error: "No se pudo generar un slug válido; revisa el nombre." };

  // Slug único (permitiendo el propio producto al editar).
  const clash = await prisma.product.findUnique({ where: { slug } });
  if (clash && clash.id !== id) {
    return { error: `Ya existe un producto con el slug "${slug}". Usa otro.` };
  }

  const images = linesToArray(String(formData.get("images") ?? ""));
  const videos = linesToArray(String(formData.get("videos") ?? ""));

  const data = {
    slug,
    name,
    shortDesc: String(formData.get("shortDesc") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    fabric: String(formData.get("fabric") ?? "").trim() || null,
    material: String(formData.get("material") ?? "").trim() || null,
    design: String(formData.get("design") ?? "").trim() || null,
    colors: parseColors(String(formData.get("colors") ?? "")),
    pricePerMeter: num(formData.get("pricePerMeter")),
    productionTime: String(formData.get("productionTime") ?? "").trim() || null,
    features: linesToArray(String(formData.get("features") ?? "")),
    gradient:
      String(formData.get("gradient") ?? "").trim() ||
      "from-slate-800 via-slate-700 to-slate-900",
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  };

  const mediaRows = [
    ...images.map((url, idx) => ({ type: "IMAGE" as const, url, sortOrder: idx })),
    ...videos.map((url, idx) => ({ type: "VIDEO" as const, url, sortOrder: idx })),
  ];

  if (id) {
    await prisma.product.update({ where: { id }, data });
    await prisma.productMedia.deleteMany({ where: { productId: id } });
    if (mediaRows.length > 0) {
      await prisma.productMedia.createMany({
        data: mediaRows.map((m) => ({ ...m, productId: id })),
      });
    }
  } else {
    const created = await prisma.product.create({ data });
    if (mediaRows.length > 0) {
      await prisma.productMedia.createMany({
        data: mediaRows.map((m) => ({ ...m, productId: created.id })),
      });
    }
  }

  revalidateCatalog(slug);
  redirect("/admin/productos");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const product = await prisma.product.findUnique({ where: { id } });
  await prisma.product.delete({ where: { id } });
  revalidateCatalog(product?.slug);
}

export async function toggleProductActive(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  await prisma.product.update({
    where: { id },
    data: { isActive: !product.isActive },
  });
  revalidateCatalog(product.slug);
}

export async function toggleProductFeatured(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  await prisma.product.update({
    where: { id },
    data: { isFeatured: !product.isFeatured },
  });
  revalidateCatalog(product.slug);
}
