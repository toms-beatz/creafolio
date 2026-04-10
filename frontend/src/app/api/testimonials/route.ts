import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const backendApi = () =>
  process.env.LARAVEL_API_URL ?? "http://backend:8000/api";

/** GET /api/testimonials — public, liste les témoignages approuvés */
export async function GET() {
  const res = await fetch(`${backendApi()}/testimonials`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ data: [] }, { status: 200 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}

/** POST /api/testimonials — requiert auth (cookie token) */
export async function POST(request: NextRequest) {
  const jar = await cookies();
  const token = jar.get("creafolio_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Vous devez être connecté." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as {
    content?: string;
    rating?: number;
    displayRole?: string;
  };

  if (!body.content?.trim() || !body.rating) {
    return NextResponse.json(
      { error: "Contenu et note requis." },
      { status: 422 },
    );
  }

  const res = await fetch(`${backendApi()}/testimonials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      content: body.content,
      rating: body.rating,
      display_role: body.displayRole ?? "Créateur UGC",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: (data as { message?: string }).message ?? "Erreur serveur." },
      { status: res.status },
    );
  }

  return NextResponse.json({
    message: "Merci pour ton témoignage ! Il sera visible après modération.",
    data,
  });
}
