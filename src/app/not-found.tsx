import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 pt-24">
      <div className="text-center">
        <p className="font-display text-7xl font-semibold text-gradient-brand">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-cloud">Página no encontrada</h1>
        <p className="mt-2 text-mist">La página que buscas no existe o fue movida.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-morado to-naranja px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
          >
            <Home className="h-4 w-4" /> Ir al inicio
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm text-cloud transition-colors hover:border-morado/60"
          >
            <Search className="h-4 w-4" /> Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
