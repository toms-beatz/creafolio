import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/auth/check-username?username=xxx
 *
 * Vérifie si un username est disponible.
 * Utilisé en temps réel (debounce 500ms) dans le formulaire setup/username (US-103).
 * Authentification requise pour éviter l'énumération de usernames.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = (searchParams.get("username") ?? "").toLowerCase().trim();

  // Validation format RG-001
  const usernameRegex = /^[a-z0-9-]{3,30}$/;
  if (!username || !usernameRegex.test(username)) {
    return NextResponse.json(
      { available: false, error: "Format invalide" },
      { status: 400 },
    );
  }

  // Auth check — évite l'énumération publique
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  return NextResponse.json({ available: !data });
}
