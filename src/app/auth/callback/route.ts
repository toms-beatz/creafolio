import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * GET /auth/callback?code=xxx
 *
 * Échange le code d'autorisation Supabase contre une session.
 * Redirige vers /setup/username si l'user n'a pas encore de username.
 * Redirige vers /dashboard sinon.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    logger.warn("auth_callback", "Code manquant dans le callback", {});
    return NextResponse.redirect(`${origin}/login?error=callback_invalid`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logger.error("auth_callback", "Échec échange code Supabase", {
      message: error.message,
    });
    return NextResponse.redirect(`${origin}/login?error=callback_failed`);
  }

  // Vérifier si l'user a déjà configuré son username
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = (await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle()) as unknown as {
      data: { username: string | null } | null;
    };

    if (!profile?.username) {
      logger.info("auth_callback", "Redirect vers setup/username", {});
      return NextResponse.redirect(`${origin}/setup/username`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
