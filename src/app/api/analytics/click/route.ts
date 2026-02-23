import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/analytics/click
 *
 * Enregistre un clic sur un lien de contact dans un portfolio publié.
 * US-603 CA-3
 *
 * Body: { portfolioId: string, linkType: string }
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    portfolioId?: string;
    linkType?: string;
  } | null;

  if (!body?.portfolioId || !body?.linkType) {
    return NextResponse.json(
      { error: "portfolioId et linkType requis" },
      { status: 400 },
    );
  }

  const validTypes = [
    "email",
    "tiktok",
    "instagram",
    "youtube",
    "linkedin",
    "other",
  ] as const;
  type LinkType = (typeof validTypes)[number];
  const linkType: LinkType = validTypes.includes(body.linkType as LinkType)
    ? (body.linkType as LinkType)
    : "other";

  const supabase = createAdminClient();

  // Vérifier que le portfolio existe et est publié
  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id")
    .eq("id", body.portfolioId)
    .eq("status", "published")
    .single();

  if (!portfolio) {
    return NextResponse.json({ tracked: false, reason: "not_found" });
  }

  await supabase.from("portfolio_link_clicks").insert({
    portfolio_id: body.portfolioId,
    link_type: linkType,
  });

  return NextResponse.json({ tracked: true });
}
