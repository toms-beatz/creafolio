"use server";

import { createClient } from "@/lib/supabase/server";

/* ── Types ─────────────────────────────────────────────────── */
export interface AnalyticsSummary {
  totalViews: number;
  views7d: number;
  views30d: number;
  uniqueVisitors7d: number;
  uniqueVisitors30d: number;
  chartData: { date: string; views: number }[];
}

export interface ReferrerSource {
  source: string;
  views: number;
  percentage: number;
}

export interface LinkClickSummary {
  linkType: string;
  clicks: number;
}

/* ── Fetch analytics basiques (Free + Premium) ─────────────── */
export async function getAnalyticsSummary(
  portfolioId: string,
): Promise<AnalyticsSummary> {
  const supabase = await createClient();

  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 86400000).toISOString();
  const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();

  // Vues totales
  const { count: totalViews } = await supabase
    .from("portfolio_analytics")
    .select("id", { count: "exact", head: true })
    .eq("portfolio_id", portfolioId)
    .eq("is_bot", false);

  // Vues 7 jours
  const { count: views7d } = await supabase
    .from("portfolio_analytics")
    .select("id", { count: "exact", head: true })
    .eq("portfolio_id", portfolioId)
    .eq("is_bot", false)
    .gte("viewed_at", d7);

  // Vues 30 jours
  const { count: views30d } = await supabase
    .from("portfolio_analytics")
    .select("id", { count: "exact", head: true })
    .eq("portfolio_id", portfolioId)
    .eq("is_bot", false)
    .gte("viewed_at", d30);

  // Visiteurs uniques 7j (distinct session_hash)
  const { data: unique7dData } = await supabase
    .from("portfolio_analytics")
    .select("session_hash")
    .eq("portfolio_id", portfolioId)
    .eq("is_bot", false)
    .gte("viewed_at", d7);

  const uniqueVisitors7d = new Set(
    unique7dData?.map((r) => r.session_hash) ?? [],
  ).size;

  // Visiteurs uniques 30j
  const { data: unique30dData } = await supabase
    .from("portfolio_analytics")
    .select("session_hash")
    .eq("portfolio_id", portfolioId)
    .eq("is_bot", false)
    .gte("viewed_at", d30);

  const uniqueVisitors30d = new Set(
    unique30dData?.map((r) => r.session_hash) ?? [],
  ).size;

  // Chart data — vues par jour sur 30 jours
  const { data: rawViews } = await supabase
    .from("portfolio_analytics")
    .select("viewed_at")
    .eq("portfolio_id", portfolioId)
    .eq("is_bot", false)
    .gte("viewed_at", d30)
    .order("viewed_at", { ascending: true });

  // Agréger par date
  const dayMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    dayMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const row of rawViews ?? []) {
    const day = new Date(row.viewed_at).toISOString().slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }

  const chartData = Array.from(dayMap.entries()).map(([date, views]) => ({
    date,
    views,
  }));

  return {
    totalViews: totalViews ?? 0,
    views7d: views7d ?? 0,
    views30d: views30d ?? 0,
    uniqueVisitors7d,
    uniqueVisitors30d,
    chartData,
  };
}

/* ── Fetch sources de trafic (Premium) ─────────────────────── */
export async function getReferrerSources(
  portfolioId: string,
): Promise<ReferrerSource[]> {
  const supabase = await createClient();

  const d30 = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data } = await supabase
    .from("portfolio_analytics")
    .select("referrer")
    .eq("portfolio_id", portfolioId)
    .eq("is_bot", false)
    .gte("viewed_at", d30);

  if (!data || data.length === 0) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    const src = row.referrer || "Direct";
    counts.set(src, (counts.get(src) ?? 0) + 1);
  }

  const total = data.length;
  return Array.from(counts.entries())
    .map(([source, views]) => ({
      source,
      views,
      percentage: Math.round((views / total) * 100),
    }))
    .sort((a, b) => b.views - a.views);
}

/* ── Fetch clics sur liens (Premium) ───────────────────────── */
export async function getLinkClicks(
  portfolioId: string,
): Promise<LinkClickSummary[]> {
  const supabase = await createClient();

  const d30 = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data } = await supabase
    .from("portfolio_link_clicks")
    .select("link_type")
    .eq("portfolio_id", portfolioId)
    .gte("clicked_at", d30);

  if (!data || data.length === 0) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    counts.set(row.link_type, (counts.get(row.link_type) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([linkType, clicks]) => ({ linkType, clicks }))
    .sort((a, b) => b.clicks - a.clicks);
}

/* ── Export CSV (Premium) ──────────────────────────────────── */
export async function exportAnalyticsCSV(portfolioId: string): Promise<string> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("portfolio_analytics")
    .select("viewed_at, referrer, session_hash, is_bot")
    .eq("portfolio_id", portfolioId)
    .order("viewed_at", { ascending: false })
    .limit(10000);

  if (!data || data.length === 0) return "date,referrer,session_hash,is_bot\n";

  const header = "date,referrer,session_hash,is_bot";
  const rows = data.map(
    (r) =>
      `${r.viewed_at},"${(r.referrer ?? "").replace(/"/g, '""')}",${r.session_hash},${r.is_bot}`,
  );

  return [header, ...rows].join("\n");
}
