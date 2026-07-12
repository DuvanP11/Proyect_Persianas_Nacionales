import Link from "next/link";
import { ItemForm } from "../ItemForm";

export default function NuevoItemPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/inventario" className="text-sm text-mist transition hover:text-cloud">
          ← Volver a inventario
        </Link>
        <h1 className="mt-2 font-display text-3xl text-cloud">Nuevo artículo</h1>
      </div>
      <ItemForm />
    </div>
  );
}
