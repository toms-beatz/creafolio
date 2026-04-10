import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getAuthHeaders(): Promise<Record<string, string> | null> {
  const jar = await cookies();
  const token = jar.get("creafolio_token")?.value;
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

const backendApi = () =>
  process.env.LARAVEL_API_URL ?? "http://backend:8000/api";

/** PATCH /api/media  — rename a media file */
export async function PATCH(request: NextRequest) {
  const headers = await getAuthHeaders();
  if (!headers)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = (await request.json()) as {
    id?: string;
    displayName?: string;
  };

  if (!body.id || !body.displayName?.trim()) {
    return NextResponse.json(
      { error: "Paramètres manquants." },
      { status: 400 },
    );
  }

  const res = await fetch(`${backendApi()}/v1/media/${body.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ display_name: body.displayName }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    return NextResponse.json(
      { error: err.message ?? "Erreur renommage." },
      { status: res.status },
    );
  }

  return NextResponse.json({ ok: true });
}

/** DELETE /api/media  — delete a media file */
export async function DELETE(request: NextRequest) {
  const headers = await getAuthHeaders();
  if (!headers)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = (await request.json()) as { id?: string };

  if (!body.id) {
    return NextResponse.json({ error: "ID manquant." }, { status: 400 });
  }

  const res = await fetch(`${backendApi()}/v1/media/${body.id}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok && res.status !== 404) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    return NextResponse.json(
      { error: err.message ?? "Erreur suppression." },
      { status: res.status },
    );
  }

  return NextResponse.json({ ok: true });
}
