import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.LARAVEL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export async function POST(_req: NextRequest) {
  const jar = await cookies();
  const token = jar.get("creafolio_token")?.value;

  if (token) {
    await fetch(`${API_URL}/v1/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    }).catch(() => {});
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("creafolio_token");
  return response;
}
