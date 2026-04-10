import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.LARAVEL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export async function GET(_req: NextRequest) {
  const jar = await cookies();
  const token = jar.get("creafolio_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const res = await fetch(`${API_URL}/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const response = NextResponse.json({ user: null });
    response.cookies.delete("creafolio_token");
    return response;
  }

  const data = await res.json();
  return NextResponse.json({ user: data.user });
}
