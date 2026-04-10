"use server";

import { api } from "@/lib/api-server";

export interface AnalyticsSummary {
  totalViews: number;
  views7d: number;
  views30d: number;
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

export async function getAnalyticsSummary(
  portfolioId: string,
): Promise<AnalyticsSummary> {
  const data = await api.get<{
    data: {
      totalViews: number;
      views30d: number;
      views7d: number;
      byDay: { date: string; views: number }[];
    };
  }>(`/v1/analytics/${portfolioId}/summary`);

  return {
    totalViews: data.data.totalViews,
    views7d: data.data.views7d,
    views30d: data.data.views30d,
    chartData: data.data.byDay ?? [],
  };
}

export async function getReferrerSources(
  portfolioId: string,
): Promise<ReferrerSource[]> {
  const data = await api.get<{
    data: { referrer: string | null; count: number }[];
  }>(`/v1/analytics/${portfolioId}/referrers?days=30`);

  const totalViews = data.data.reduce((sum, r) => sum + r.count, 0) || 1;
  return data.data.map((r) => ({
    source: r.referrer ?? "Direct",
    views: r.count,
    percentage: Math.round((r.count / totalViews) * 100),
  }));
}

export async function getLinkClicks(
  portfolioId: string,
): Promise<LinkClickSummary[]> {
  const data = await api.get<{ data: { link_type: string; count: number }[] }>(
    `/v1/analytics/${portfolioId}/clicks?days=30`,
  );

  return data.data.map((r) => ({ linkType: r.link_type, clicks: r.count }));
}

export interface VisitorRow {
  viewed_at: string;
  country_code: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  referrer: string | null;
  page_path: string | null;
}

export async function getVisitors(
  portfolioId: string,
  sort = "viewed_at",
  dir: "asc" | "desc" = "desc",
): Promise<VisitorRow[]> {
  const data = await api.get<{ data: VisitorRow[] }>(
    `/v1/analytics/${portfolioId}/visitors?days=30&sort=${sort}&dir=${dir}`,
  );
  return data.data ?? [];
}

export async function exportAnalyticsCSV(
  portfolioId: string,
): Promise<string | null> {
  try {
    const res = await import("@/lib/api-server").then((m) =>
      m.api.get<{ csv?: string }>(`/v1/analytics/${portfolioId}/export`),
    );
    return (res as { csv?: string }).csv ?? null;
  } catch {
    return null;
  }
}
