import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware Next.js — Gestion sessions Supabase + protection des routes
 * Rafraîchit automatiquement les tokens expirés.
 * Redirige les non-authentifiés vers /login.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Appliquer le middleware sur toutes les routes sauf:
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation images)
     * - favicon.ico, sitemap.xml, robots.txt
     * - fichiers statiques (.png, .jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
