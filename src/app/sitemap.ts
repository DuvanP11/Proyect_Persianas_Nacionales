import type { MetadataRoute } from "next";
import { getCatalogSlugs } from "@/lib/catalog";
import { siteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();
  const slugs = await getCatalogSlugs();

  const staticRoutes = ["", "/catalogo", "/cotizar", "/como-medir"].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const productRoutes = slugs.map((slug) => ({
    url: `${base}/catalogo/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
