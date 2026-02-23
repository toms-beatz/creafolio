import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Crée un client Supabase spécialisé pour le middleware Next.js.
 * Rafraîchit le token de session expired et propage les cookies mis à jour.
 * Appelé depuis middleware.ts à la racine du projet.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh de session — NE PAS écrire de logique entre createServerClient et getUser
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const isProtectedRoute =
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/builder") ||
    url.pathname.startsWith("/settings");
  const isAuthRoute = url.pathname === "/login" || url.pathname === "/signup";

  // Redirige vers login si route protégée sans session
  if (!user && isProtectedRoute) {
    url.pathname = "/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirige vers dashboard si déjà connecté sur pages auth
  if (user && isAuthRoute) {
    url.pathname = "/dashboard";
    url.searchParams.delete("redirectTo");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
