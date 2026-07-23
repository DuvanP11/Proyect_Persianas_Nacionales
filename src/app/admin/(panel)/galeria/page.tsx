import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getWorkGallery, WORK_GALLERY_DEFAULT } from "@/lib/work-gallery";
import { WorkGalleryForm } from "./WorkGalleryForm";

export const dynamic = "force-dynamic";

export default async function GaleriaPage() {
  const items = await getWorkGallery();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-cloud">Galería de trabajos</h1>
          <p className="mt-1 text-sm text-mist">
            Las fotos y videos de instalaciones que se muestran en la página de inicio.
          </p>
        </div>
        <Link
          href="/#referencias"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-mist transition hover:border-morado/50 hover:text-cloud"
        >
          <ArrowUpRight className="h-3.5 w-3.5" /> Ver en el sitio
        </Link>
      </div>

      <WorkGalleryForm initial={items} defaults={WORK_GALLERY_DEFAULT} />
    </div>
  );
}
