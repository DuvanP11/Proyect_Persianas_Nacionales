import Link from "next/link";
import { PromoForm } from "../PromoForm";

export default function NuevoPromoPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/promociones" className="text-sm text-mist transition hover:text-cloud">
          ← Volver a códigos promo
        </Link>
        <h1 className="mt-2 font-display text-3xl text-cloud">Nuevo código</h1>
      </div>
      <PromoForm />
    </div>
  );
}
