"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";

type ActionState = {
  error?: string;
  hint?: string;
  success?: string;
  suggestions?: string[];
};
export type { ActionState };

const API_URL =
  process.env.LARAVEL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api";
const IS_PROD = process.env.NODE_ENV === "production";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

async function setToken(token: string) {
  const jar = await cookies();
  jar.set("creafolio_token", token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

// ============================================================
// Signup
// ============================================================
export async function signupAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const cgu = formData.get("cgu");

  if (!name || !email || !password)
    return { error: "Tous les champs sont requis." };
  if (!cgu)
    return {
      error: "Tu dois accepter les CGU et la Politique de Confidentialité.",
    };
  if (password !== confirmPassword)
    return { error: "Les mots de passe ne correspondent pas." };
  if (password.length < 8)
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };

  const res = await fetch(`${API_URL}/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: confirmPassword,
    }),
  });
  const data = await res.json();

  if (!res.ok) {
    logger.warn("auth_signup", "Signup échoué", { status: res.status });
    if (data.errors?.email)
      return { error: "Un compte existe déjà avec cet email.", hint: "login" };
    return { error: data.message ?? "Erreur lors de la création du compte." };
  }

  await setToken(data.token);
  redirect("/setup/username");
}

// ============================================================
// Login
// ============================================================
export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Email et mot de passe requis." };

  const res = await fetch(`${API_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (!res.ok) {
    logger.warn("auth_login", "Échec login", { status: res.status });
    return { error: "Email ou mot de passe incorrect." };
  }

  await setToken(data.token);
  redirect("/dashboard");
}

// ============================================================
// Logout
// ============================================================
export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  const token = jar.get("creafolio_token")?.value;

  if (token) {
    await fetch(`${API_URL}/v1/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    }).catch(() => {});
  }

  jar.delete("creafolio_token");
  redirect("/login");
}

// ============================================================
// Update password
// ============================================================
export async function updatePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword)
    return { error: "Les nouveaux mots de passe ne correspondent pas." };
  if (newPassword.length < 8)
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };

  const jar = await cookies();
  const token = jar.get("creafolio_token")?.value;
  if (!token) redirect("/login");

  const res = await fetch(`${API_URL}/v1/auth/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    return { error: data.message ?? "Impossible de changer le mot de passe." };
  }

  return {};
}

// ============================================================
// Forgot / Reset Password
// ============================================================
export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email requis." };
  try {
    await fetch(`${API_URL}/v1/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
    });
    return {
      success:
        "Si cette adresse existe, tu recevras un email dans quelques minutes.",
    };
  } catch {
    return { error: "Erreur réseau." };
  }
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = formData.get("token") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const password_confirmation = formData.get("password_confirmation") as string;
  if (!token || !email || !password)
    return { error: "Champs requis manquants." };
  try {
    const res = await fetch(`${API_URL}/v1/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ token, email, password, password_confirmation }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      return { error: data.message ?? "Lien invalide ou expiré." };
    }
    redirect("/login");
  } catch {
    return { error: "Erreur réseau." };
  }
}

// ============================================================
// Setup username (onboarding)
// ============================================================
export async function setupUsernameAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const username = formData.get("username") as string;
  if (!username) return { error: "Nom d'utilisateur requis." };
  try {
    const jar = await cookies();
    const token = jar.get("creafolio_token")?.value;
    const res = await fetch(`${API_URL}/v1/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ username, onboarding_completed: true }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      return { error: data.message ?? "Erreur lors de la configuration." };
    }
    redirect("/dashboard");
  } catch (err: unknown) {
    if ((err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))
      throw err;
    return { error: "Erreur réseau." };
  }
}
