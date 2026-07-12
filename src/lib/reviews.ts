import { prisma, hasDatabase } from "@/lib/prisma";

export type PublicReview = {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
};

export type ReviewsSummary = {
  reviews: PublicReview[];
  average: number | null;
  count: number;
};

/**
 * Reseñas aprobadas para el sitio público, con el promedio de calificación.
 * Degrada a lista vacía (el componente muestra sus placeholders) si no hay BD
 * o la consulta falla.
 */
export async function getApprovedReviews(limit = 6): Promise<ReviewsSummary> {
  if (!hasDatabase) return { reviews: [], average: null, count: 0 };
  try {
    const rows = await prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
    });
    if (rows.length === 0) return { reviews: [], average: null, count: 0 };
    const average =
      rows.reduce((sum, r) => sum + r.rating, 0) / rows.length;
    return {
      reviews: rows.slice(0, limit).map((r) => ({
        id: r.id,
        authorName: r.authorName,
        rating: r.rating,
        comment: r.comment,
      })),
      average: Math.round(average * 10) / 10,
      count: rows.length,
    };
  } catch {
    return { reviews: [], average: null, count: 0 };
  }
}
