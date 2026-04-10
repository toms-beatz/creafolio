import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false, // Disable double-render in dev for performance
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        // Supabase Storage — images portfolios
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Local dev storage fallback
        protocol: "http",
        hostname: "localhost",
        pathname: "/storage/**",
      },
      {
        // R2 public URL (Cloudflare)
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      {
        // Custom R2 domain
        protocol: "https",
        hostname: "*.blooprint.fr",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["@craftjs/core", "lucide-react"],
  },
};

export default nextConfig;
