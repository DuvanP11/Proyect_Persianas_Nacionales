import Link from "next/link";
import { CategoryForm } from "../CategoryForm";

export default function NuevaCategoriaPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/categorias" className="text-sm text-mist transition hover:text-cloud">
          ← Volver a categorías
        </Link>
        <h1 className="mt-2 font-display text-3xl text-cloud">Nueva categoría</h1>
      </div>
      <CategoryForm />
    </div>
  );
}
