/**
 * Importa el catálogo estático de la Fase 1 a la base de datos.
 *
 * Es idempotente: usa `upsert` por `slug`, así que puedes correrlo cuantas veces
 * quieras sin duplicar. Los productos ya editados desde el panel NO se pisan en
 * sus campos propios salvo que cambies este script (upsert actualiza todo).
 *
 * Uso (Node 26 lee TypeScript de forma nativa):
 *   node --env-file=.env scripts/seed-products.mts
 */
import { PrismaClient } from "@prisma/client";
import { products } from "../src/lib/products.ts";

const prisma = new PrismaClient();

async function main() {
  let created = 0;
  let updated = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });

    const data = {
      name: p.name,
      shortDesc: p.short,
      description: p.description,
      fabric: p.tela,
      material: p.material,
      design: p.diseno,
      colors: p.colors,
      pricePerMeter: p.pricePerMeter,
      productionTime: p.productionTime,
      features: p.features,
      gradient: p.gradient,
      isActive: true,
      isFeatured: Boolean(p.featured),
    };

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...data },
      update: data,
    });

    // Media (imágenes/videos): reemplaza el set completo por el del catálogo.
    await prisma.productMedia.deleteMany({ where: { productId: product.id } });
    const media = [
      ...p.images.map((url, idx) => ({ type: "IMAGE" as const, url, sortOrder: idx })),
      ...p.videos.map((url, idx) => ({ type: "VIDEO" as const, url, sortOrder: idx })),
    ];
    if (media.length > 0) {
      await prisma.productMedia.createMany({
        data: media.map((m) => ({ ...m, productId: product.id })),
      });
    }

    if (existing) updated++;
    else created++;
    console.log(`  ${existing ? "↻" : "+"} ${p.name}`);
  }

  console.log(`\n✔ Catálogo sembrado: ${created} creados, ${updated} actualizados.`);
}

main()
  .catch((e) => {
    console.error("Error sembrando el catálogo:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
