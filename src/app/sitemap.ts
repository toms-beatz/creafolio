import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://blooprint.fr";

/**
 * Sitemap XML dynamique — US-703
 * Inclut : home, pricing, et tous les portfolios publiés.
 * Route : /sitemap.xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("slug, updated_at")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(50000);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${APP_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${APP_URL}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/guide/portfolio-ugc`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const portfolioPages: MetadataRoute.Sitemap = (portfolios ?? []).map((p) => ({
    url: `${APP_URL}/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...portfolioPages];
}
