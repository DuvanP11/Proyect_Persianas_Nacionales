"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type ItemFormState = { error?: string };

const CATEGORIES = ["TELA", "MATERIAL", "ACCESORIO", "MOTOR", "INSUMO"] as const;
type Category = (typeof CATEGORIES)[number];

export async function saveItem(
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre es obligatorio." };

  const category = String(formData.get("category") ?? "MATERIAL");
  if (!CATEGORIES.includes(category as Category)) return { error: "Categoría inválida." };

  const data = {
    name,
    category: category as Category,
    unit: String(formData.get("unit") ?? "").trim() || "unidad",
    stock: Math.max(0, Number(formData.get("stock") ?? 0) || 0),
    minStock: Math.max(0, Number(formData.get("minStock") ?? 0) || 0),
  };

  if (id) {
    await prisma.inventoryItem.update({ where: { id }, data });
  } else {
    await prisma.inventoryItem.create({ data });
  }

  revalidatePath("/admin/inventario");
  redirect("/admin/inventario");
}

export async function deleteItem(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.inventoryItem.delete({ where: { id } });
  revalidatePath("/admin/inventario");
}

/** Registra una entrada/salida y ajusta el stock del artículo. */
export async function registerMovement(formData: FormData): Promise<void> {
  await requireAdmin();
  const itemId = String(formData.get("itemId") ?? "");
  const type = String(formData.get("type") ?? "");
  const quantity = Math.abs(Number(formData.get("quantity") ?? 0) || 0);
  const reason = String(formData.get("reason") ?? "").trim() || null;
  if (!itemId || quantity <= 0 || (type !== "ENTRADA" && type !== "SALIDA")) return;

  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item) return;

  const newStock =
    type === "ENTRADA" ? item.stock + quantity : Math.max(0, item.stock - quantity);

  await prisma.$transaction([
    prisma.inventoryMovement.create({
      data: { itemId, type: type as "ENTRADA" | "SALIDA", quantity, reason },
    }),
    prisma.inventoryItem.update({ where: { id: itemId }, data: { stock: newStock } }),
  ]);

  revalidatePath("/admin/inventario");
  revalidatePath(`/admin/inventario/${itemId}`);
}
