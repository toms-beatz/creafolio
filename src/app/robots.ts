import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://blooprint.fr";

/**
 * robots.txt dynamique — US-704
 * Route : /robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/builder", "/settings", "/api"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
