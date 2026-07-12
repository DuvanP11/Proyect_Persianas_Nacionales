import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PromoForm, type PromoFormValues } from "../PromoForm";

export default async function EditarPromoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await prisma.promoCode.findUnique({ where: { id } });
  if (!p) notFound();

  const initial: PromoFormValues = {
    id: p.id,
    code: p.code,
    discountPct: String(p.discountPct),
    validUntil: p.validUntil ? new Date(p.validUntil).toISOString().slice(0, 10) : "",
    maxUses: p.maxUses != null ? String(p.maxUses) : "",
    isActive: p.isActive,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/promociones" className="text-sm text-mist transition hover:text-cloud">
          ← Volver a códigos promo
        </Link>
        <h1 className="mt-2 font-display text-3xl text-cloud">Editar: {p.code}</h1>
      </div>
      <PromoForm initial={initial} />
    </div>
  );
}
