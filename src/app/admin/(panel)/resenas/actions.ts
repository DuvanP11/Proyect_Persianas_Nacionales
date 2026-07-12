"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function revalidateReviews() {
  revalidatePath("/admin/resenas");
  revalidatePath("/"); // testimonios en la home
}

export async function createReview(formData: FormData): Promise<void> {
  await requireAdmin();
  const authorName = String(formData.get("authorName") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating") ?? 5) || 5));
  if (!authorName || !comment) return;

  await prisma.review.create({
    data: { authorName, comment, rating, isApproved: true },
  });
  revalidateReviews();
}

export async function toggleReviewApproved(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const r = await prisma.review.findUnique({ where: { id } });
  if (!r) return;
  await prisma.review.update({
    where: { id },
    data: { isApproved: !r.isApproved },
  });
  revalidateReviews();
}

export async function deleteReview(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.review.delete({ where: { id } });
  revalidateReviews();
}
