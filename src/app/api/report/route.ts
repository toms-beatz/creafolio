import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

/**
 * POST /api/report — US-807
 * Signalement anonyme d'un portfolio.
 * Rate limit : max 3 par hash IP par 24h.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { portfolioId, motif, description } = body;

    // Validation
    if (!portfolioId || !motif) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants." },
        { status: 400 },
      );
    }

    const validMotifs = ["nsfw", "haineux", "spam", "autre"];
    if (!validMotifs.includes(motif)) {
      return NextResponse.json({ error: "Motif invalide." }, { status: 400 });
    }

    // Hash IP pour rate limiting anonyme
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const reporterHash = crypto
      .createHash("sha256")
      .update(ip + process.env.STRIPE_WEBHOOK_SECRET) // sel secret
      .digest("hex")
      .slice(0, 16);

    const supabase = createAdminClient();

    // Rate limit: max 3 signalements par hash par 24h
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();

    const { count } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("reporter_hash", reporterHash)
      .gte("created_at", twentyFourHoursAgo);

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        {
          error: "Limite de signalements atteinte (3/24h). Réessaie plus tard.",
        },
        { status: 429 },
      );
    }

    // Vérifier que le portfolio existe
    const { data: portfolio } = await supabase
      .from("portfolios")
      .select("id")
      .eq("id", portfolioId)
      .single();

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio introuvable." },
        { status: 404 },
      );
    }

    // Insérer le signalement
    const { error } = await supabase.from("reports").insert({
      portfolio_id: portfolioId,
      motif,
      description: description?.slice(0, 500) ?? null,
      reporter_hash: reporterHash,
    });

    if (error) {
      console.error("[report] Insert error:", error.message);
      return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[report] Unexpected error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
