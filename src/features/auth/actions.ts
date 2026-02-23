"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

// ============================================================
// Signup — US-101
// ============================================================
export async function signupAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validation basique (double protection : zod fait ça côté client aussi)
  if (!email || !password || !confirmPassword) {
    return { error: "Tous les champs sont requis." };
  }

  // Validation CGU — US-802 CA-4
  const cgu = formData.get("cgu");
  if (!cgu) {
    return {
      error: "Tu dois accepter les CGU et la Politique de Confidentialité.",
    };
  }

  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    logger.warn("auth_signup", error.message, {
      email: email.split("@")[0] + "@...",
    });

    // Supabase retourne "User already registered" si email pris
    if (
      error.message.toLowerCase().includes("already registered") ||
      error.message.toLowerCase().includes("already been registered")
    ) {
      return {
        error: "Un compte existe déjà avec cet email.",
        hint: "login",
      };
    }
    return {
      error: "Erreur lors de la création du compte. Réessaie dans un moment.",
    };
  }

  logger.info("auth_signup", "Signup réussi, email de confirmation envoyé", {});
  redirect("/verify-email");
}

// ============================================================
// Login — US-105
// ============================================================
export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    logger.warn("auth_login", "Échec login", { code: error.code ?? "unknown" });

    // Email non confirmé
    if (error.code === "email_not_confirmed") {
      return {
        error:
          "Vérifie ta boîte mail pour confirmer ton adresse email avant de te connecter.",
        hint: "resend",
      };
    }

    // Rate limiting Supabase
    if (error.message.toLowerCase().includes("too many")) {
      return {
        error:
          "Trop de tentatives. Attends quelques minutes avant de réessayer.",
      };
    }

    // Message générique — pas de leak info (US-105 CA-3)
    return { error: "Email ou mot de passe incorrect." };
  }

  // Vérifier si l'user a un username configuré
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = (await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle()) as unknown as {
      data: { username: string | null } | null;
    };

    if (!profile?.username) {
      redirect("/setup/username");
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ============================================================
// Logout — US-107
// ============================================================
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// ============================================================
// Mot de passe oublié — US-106
// ============================================================
export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Adresse email requise." };
  }

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  });

  if (error) {
    logger.warn("auth_forgot_password", error.message, {});
    // Message neutre pour ne pas révéler si l'email existe (US-106 CA-3)
  }

  // Toujours retourner succès (anti-enumeration)
  return {
    success: "Si ce compte existe, un email de réinitialisation a été envoyé.",
  };
}

// ============================================================
// Reset password — US-106
// ============================================================
export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { error: "Tous les champs sont requis." };
  }
  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    logger.warn("auth_reset_password", error.message, {});
    return {
      error:
        "Erreur lors de la mise à jour du mot de passe. Le lien est peut-être expiré.",
    };
  }

  redirect("/login?reset=success");
}

// ============================================================
// Setup username — US-103 + US-104
// ============================================================
export async function setupUsernameAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const username = ((formData.get("username") as string) ?? "")
    .toLowerCase()
    .trim();

  // Validation format RG-001
  const usernameRegex = /^[a-z0-9-]{3,30}$/;
  if (!usernameRegex.test(username)) {
    return {
      error:
        "Username invalide. Utilise uniquement des lettres minuscules, chiffres et tirets (3-30 caractères).",
    };
  }
  if (username.startsWith("-") || username.endsWith("-")) {
    return {
      error: "Le username ne peut pas commencer ou finir par un tiret.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Session expirée. Reconnecte-toi." };
  }

  // Vérifier unicité (la contrainte UNIQUE en BDD est le filet final)
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    const suggestions = generateUsernameSuggestions(username);
    return {
      error: `Le username "${username}" est déjà utilisé.`,
      suggestions,
    };
  }

  // Activer trial 7 jours — US-104 (RG-003 : vérifier si déjà eu un trial)
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  const { error: updateError } = await supabase
    .from("profiles")
    // Type workaround: @supabase/ssr 0.8 ne résout pas le generic Update correctement
    .update({
      username,
      plan: "trial" as const,
      trial_ends_at: trialEndsAt.toISOString(),
    } as unknown as never)
    .eq("id", user.id);

  if (updateError) {
    logger.error("auth_setup_username", updateError.message, {
      userId: user.id,
    });

    // Contrainte UNIQUE violée (race condition)
    if (updateError.code === "23505") {
      const suggestions = generateUsernameSuggestions(username);
      return {
        error: `Le username "${username}" vient d'être pris.`,
        suggestions,
      };
    }

    return { error: "Erreur lors de la configuration du username. Réessaie." };
  }

  logger.info("auth_setup_username", "Username configuré + trial activé", {
    username,
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ============================================================
// Helpers
// ============================================================

/** Génère 3 suggestions de username à partir d'une base */
function generateUsernameSuggestions(base: string): string[] {
  const clean = base.replace(/-+$/, "");
  return [
    `${clean}${Math.floor(Math.random() * 99 + 1)}`,
    `${clean}-ugc`,
    `${clean}-creator`,
  ];
}

// ============================================================
// Types
// ============================================================

export interface ActionState {
  error?: string;
  success?: string;
  hint?: "login" | "resend";
  suggestions?: string[];
}
