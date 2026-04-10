import type { MetadataRoute } from "next";
import { api } from "@/lib/api-server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://creafolio.fr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let portfolios: { slug: string; updated_at: string }[] = [];
  try {
    const data = await api.get<{ data: { slug: string; updated_at: string }[] }>(
      "/v1/portfolios?status=published&limit=50000"
    );
    portfolios = data.data ?? [];
  } catch { /* fail silently */ }

  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${APP_URL}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/signup`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const portfolioPages: MetadataRoute.Sitemap = portfolios.map((p) => ({
    url: `${APP_URL}/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...portfolioPages];
}
