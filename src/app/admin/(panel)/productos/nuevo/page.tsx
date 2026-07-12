import Link from "next/link";
import { ProductForm } from "../ProductForm";

export default function NuevoProductoPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/productos" className="text-sm text-mist transition hover:text-cloud">
          ← Volver a productos
        </Link>
        <h1 className="mt-2 font-display text-3xl text-cloud">Nuevo producto</h1>
      </div>
      <ProductForm />
    </div>
  );
}
