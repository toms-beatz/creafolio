import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PATCH(request: NextRequest) {
  const jar = await cookies();
  const token = jar.get("creafolio_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { portfolioId, slug } = (await request.json()) as {
    portfolioId: string;
    slug: string;
  };

  if (!portfolioId || !slug) {
    return NextResponse.json(
      { error: "Paramètres manquants." },
      { status: 400 },
    );
  }

  const apiUrl = process.env.LARAVEL_API_URL ?? "http://backend:8000/api";

  const res = await fetch(`${apiUrl}/v1/portfolios/${portfolioId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ slug }),
  });

  if (!res.ok) {
    const data = (await res.json()) as { message?: string };
    return NextResponse.json(
      { error: data.message ?? "Erreur." },
      { status: res.status },
    );
  }

  return NextResponse.json({ ok: true });
}
