"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

// ============================================================
// Update profile — US-805
// ============================================================
export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const username = (formData.get("username") as string)?.trim().toLowerCase();

  if (!username) {
    return { error: "Le nom d'utilisateur est requis." };
  }

  // Validation format
  if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
    return {
      error:
        "Le nom d'utilisateur doit contenir entre 3 et 30 caractères (lettres, chiffres, tirets, underscores).",
    };
  }

  // Vérifier si le username est déjà pris (par un autre user)
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", user.id)
    .maybeSingle();

  if (existing) {
    return { error: "Ce nom d'utilisateur est déjà pris." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    logger.error("settings_profile", "Erreur update username", {
      error: error.message,
    });
    return { error: "Erreur lors de la mise à jour. Réessaie." };
  }

  revalidatePath("/settings/profile");
  return { success: "Profil mis à jour !" };
}

// ============================================================
// Change password — US-805
// ============================================================
export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || !confirmPassword) {
    return { error: "Tous les champs sont requis." };
  }

  if (newPassword.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    logger.error("settings_password", "Erreur changement mdp", {
      error: error.message,
    });
    return { error: "Erreur lors du changement de mot de passe." };
  }

  return { success: "Mot de passe mis à jour !" };
}

// ============================================================
// Delete account — US-804
// ============================================================
export async function deleteAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const confirmEmail = (formData.get("confirmEmail") as string)?.trim();

  if (confirmEmail !== user.email) {
    return { error: "L'email ne correspond pas. Vérification échouée." };
  }

  try {
    const admin = createAdminClient();

    // 1. Soft-delete profile
    await admin
      .from("profiles")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    // 2. Mark all portfolios as unpublished
    await admin
      .from("portfolios")
      .update({ status: "deleted" })
      .eq("user_id", user.id);

    // 3. Cancel Stripe subscription if exists
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profile?.stripe_customer_id) {
      const stripe = (await import("stripe")).default;
      const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!);

      const subscriptions = await stripeClient.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "active",
      });

      for (const sub of subscriptions.data) {
        await stripeClient.subscriptions.cancel(sub.id);
      }
    }

    // 4. Sign out
    await supabase.auth.signOut();

    logger.info("settings_delete", "Compte supprimé (soft delete)", {
      userId: user.id,
    });
  } catch (err) {
    logger.error("settings_delete", "Erreur suppression compte", {
      error: err instanceof Error ? err.message : String(err),
    });
    return { error: "Erreur lors de la suppression. Contacte le support." };
  }

  redirect("/");
}

// ============================================================
// Export user data (RGPD Art. 20) — US-803
// ============================================================
export async function exportUserDataAction(): Promise<{
  data?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  try {
    const [profileRes, portfoliosRes, analyticsRes, subscriptionRes] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("portfolios").select("*").eq("user_id", user.id),
        supabase
          .from("portfolio_analytics")
          .select("*")
          .in(
            "portfolio_id",
            (
              await supabase
                .from("portfolios")
                .select("id")
                .eq("user_id", user.id)
            ).data?.map((p) => p.id) ?? [],
          ),
        supabase.from("subscriptions").select("*").eq("user_id", user.id),
      ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      profile: profileRes.data,
      portfolios: portfoliosRes.data,
      analytics: analyticsRes.data,
      subscriptions: subscriptionRes.data,
    };

    return { data: JSON.stringify(exportData, null, 2) };
  } catch (err) {
    logger.error("settings_export", "Erreur export données", {
      error: err instanceof Error ? err.message : String(err),
    });
    return { error: "Erreur lors de l'export." };
  }
}

// ============================================================
// Toggle allow_landing per portfolio (user consent for showcase) — US-1105
// ============================================================
export async function toggleAllowLandingAction(
  portfolioId: string,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify ownership
  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, allow_landing")
    .eq("id", portfolioId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!portfolio) {
    return { error: "Portfolio introuvable." };
  }

  const newValue = !portfolio.allow_landing;

  const { error } = await supabase
    .from("portfolios")
    .update({
      allow_landing: newValue,
      updated_at: new Date().toISOString(),
    })
    .eq("id", portfolio.id);

  if (error) {
    logger.error("settings_landing", "Erreur toggle allow_landing", {
      error: error.message,
    });
    return { error: "Erreur lors de la mise à jour." };
  }

  revalidatePath("/dashboard");
  return {
    success: newValue
      ? "Ce portfolio peut maintenant être mis en avant sur la page d'accueil."
      : "Ce portfolio ne sera plus visible sur la page d'accueil.",
  };
}

// ============================================================
// Types
// ============================================================
type ActionState = {
  error?: string;
  success?: string;
  hint?: string;
};
