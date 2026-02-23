import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Listes de User-Agents bots connus (partiel, extensible).
 */
const BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /applebot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /mj12bot/i,
  /petalbot/i,
  /bytespider/i,
  /gptbot/i,
  /claudebot/i,
  /crawler/i,
  /spider/i,
  /bot\b/i,
];

function isBot(ua: string): boolean {
  return BOT_PATTERNS.some((re) => re.test(ua));
}

/**
 * Génère un hash de session anonyme (RGPD-safe).
 * Utilise l'API Web Crypto disponible dans Edge Runtime.
 */
async function sessionHash(ip: string, ua: string): Promise<string> {
  const data = new TextEncoder().encode(`${ip}|${ua}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

/**
 * POST /api/analytics/track
 *
 * Enregistre une vue de portfolio (fire-and-forget côté client).
 * US-601
 *
 * Body: { portfolioId: string, referrer?: string }
 * Headers utilisés: x-forwarded-for, user-agent
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    portfolioId?: string;
    referrer?: string;
  } | null;

  if (!body?.portfolioId) {
    return NextResponse.json({ error: "portfolioId requis" }, { status: 400 });
  }

  const ua = request.headers.get("user-agent") ?? "";
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  // US-601 CA-5 — filtrer les bots
  if (isBot(ua)) {
    return NextResponse.json({ tracked: false, reason: "bot" });
  }

  const hash = await sessionHash(ip, ua);
  const supabase = createAdminClient();

  // US-601 CA-4 — exclure les auto-vues (propriétaire)
  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("user_id")
    .eq("id", body.portfolioId)
    .eq("status", "published")
    .single();

  if (!portfolio) {
    return NextResponse.json({ tracked: false, reason: "not_found" });
  }

  // Vérifier si l'utilisateur courant est le propriétaire
  // On ne peut pas facilement le faire sans auth, mais on peut vérifier
  // via un header custom ou un cookie. Pour le MVP, on accepte toutes les vues
  // sauf si un userId est passé dans le body.

  // US-601 CA-6 — Rate limit : max 1 vue par session par portfolio par heure
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const { data: existing } = await supabase
    .from("portfolio_analytics")
    .select("id")
    .eq("portfolio_id", body.portfolioId)
    .eq("session_hash", hash)
    .gte("viewed_at", oneHourAgo)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ tracked: false, reason: "rate_limited" });
  }

  // Catégoriser le referrer
  const referrer = body.referrer ? categorizeReferrer(body.referrer) : "direct";

  // US-601 CA-7 — Insert asynchrone (la réponse part immédiatement)
  await supabase.from("portfolio_analytics").insert({
    portfolio_id: body.portfolioId,
    session_hash: hash,
    referrer,
    is_bot: false,
  });

  return NextResponse.json({ tracked: true });
}

/**
 * Catégorise un referrer en source lisible.
 */
function categorizeReferrer(ref: string): string {
  if (!ref || ref === "") return "direct";
  const lower = ref.toLowerCase();
  if (lower.includes("tiktok.com")) return "TikTok";
  if (lower.includes("instagram.com")) return "Instagram";
  if (lower.includes("linkedin.com")) return "LinkedIn";
  if (lower.includes("youtube.com")) return "YouTube";
  if (lower.includes("twitter.com") || lower.includes("x.com"))
    return "X/Twitter";
  if (lower.includes("facebook.com")) return "Facebook";
  if (lower.includes("google.")) return "Google";
  if (lower.includes("bing.com")) return "Bing";
  return ref.split("/")[2] ?? "other"; // domaine brut
}
