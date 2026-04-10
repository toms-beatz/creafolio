import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.LARAVEL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const IS_PROD = process.env.NODE_ENV === "production";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${API_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const response = NextResponse.json({ user: data.user });
  response.cookies.set("creafolio_token", data.token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
  return response;
}
