/**
 * API client for Server Components and Server Actions.
 * Reads the Sanctum token from the httpOnly cookie.
 */
import { cache } from "react";
import { cookies } from "next/headers";

const API_URL =
  process.env.LARAVEL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api";

async function getToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get("creafolio_token")?.value;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers = new Headers(options.headers as HeadersInit);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw Object.assign(new Error(body.message ?? "API error"), {
      status: res.status,
      errors: body.errors ?? null,
    });
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/** Deduplicated /v1/auth/me — one fetch per RSC render tree regardless of how many times called. */
export const getMe = cache(async () => {
  return request<{
    user: {
      id: number;
      name: string;
      email: string;
      profile: {
        username: string;
        plan: string;
        role: string;
        trial_ends_at: string | null;
        bio: string | null;
        avatar_url: string | null;
        onboarding_completed: boolean;
      };
    };
  }>("/v1/auth/me");
});

/**
 * Resolves whether a user has premium access.
 * Admins always get full access regardless of their billing plan.
 */
export function resolveIsPremium(profile: {
  plan?: string;
  role?: string;
  trial_ends_at?: string | null;
}): boolean {
  if (profile.role === "admin") return true;
  if (profile.plan === "premium") return true;
  if (
    profile.plan === "trial" &&
    !!profile.trial_ends_at &&
    new Date(profile.trial_ends_at) > new Date()
  )
    return true;
  return false;
}

/** Upload a file multipart to Laravel */
export async function apiUpload(
  path: string,
  formData: FormData,
): Promise<Response> {
  const token = await getToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
}
