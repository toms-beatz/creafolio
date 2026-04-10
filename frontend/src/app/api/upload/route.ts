import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const jar = await cookies();
    const token = jar.get("creafolio_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const formData = await request.formData();
    const apiUrl = process.env.LARAVEL_API_URL ?? "http://backend:8000/api";

    const res = await fetch(`${apiUrl}/v1/media/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: formData,
    });

    const data = (await res.json()) as {
      data?: { url: string; file_key: string; id: string };
      message?: string;
    };

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message ?? "Upload échoué." },
        { status: res.status },
      );
    }

    return NextResponse.json({
      url: data.data!.url,
      key: data.data!.file_key,
      id: data.data!.id,
    });
  } catch (err: unknown) {
    console.error("[/api/upload]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
