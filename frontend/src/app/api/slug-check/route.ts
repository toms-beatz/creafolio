import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const portfolioId = searchParams.get("portfolio_id");

  if (!slug) {
    return NextResponse.json({ available: false }, { status: 400 });
  }

  const jar = await cookies();
  const token = jar.get("creafolio_token")?.value;

  const apiUrl = process.env.LARAVEL_API_URL ?? "http://backend:8000/api";
  const params = new URLSearchParams({ slug });
  if (portfolioId) params.set("portfolio_id", portfolioId);

  const res = await fetch(`${apiUrl}/v1/portfolios/slug/check?${params}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  const data = (await res.json()) as { available: boolean; reason?: string };
  return NextResponse.json(data);
}
