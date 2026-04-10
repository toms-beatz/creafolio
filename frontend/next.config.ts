import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../"),
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
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
