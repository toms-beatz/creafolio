"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { api } from "@/lib/api-server";
import { logger } from "@/lib/logger";

type ActionState = { error?: string; success?: string; hint?: string };

// ============================================================
// Update profile — US-805
// ============================================================
export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const display_name = (formData.get("display_name") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim();

  if (username && !/^[a-z0-9_-]{3,30}$/.test(username)) {
    return { error: "Le nom d'utilisateur doit contenir entre 3 et 30 caractères (lettres, chiffres, tirets, underscores)." };
  }

  try {
    await api.patch("/v1/profile", { username, display_name, bio });
    revalidatePath("/settings");
    return { success: "Profil mis à jour !" };
  } catch (err: unknown) {
    const e = err as { errors?: { username?: string[] }; message?: string };
    if (e.errors?.username) return { error: "Ce nom d'utilisateur est déjà pris." };
    logger.error("settings_profile", "Erreur update profile", { error: e.message });
    return { error: "Erreur lors de la mise à jour. Réessaie." };
  }
}

// ============================================================
// Change password — US-805
// ============================================================
export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) return { error: "Tous les champs sont requis." };
  if (newPassword.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  if (newPassword !== confirmPassword) return { error: "Les mots de passe ne correspondent pas." };

  try {
    await api.patch("/v1/auth/password", {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    });
    return { success: "Mot de passe mis à jour !" };
  } catch (err: unknown) {
    return { error: (err as Error).message ?? "Erreur lors du changement de mot de passe." };
  }
}

// ============================================================
// Delete account — US-804
// ============================================================
export async function deleteAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const confirmEmail = (formData.get("confirmEmail") as string)?.trim();

  try {
    const me = await api.get<{ user: { email: string } }>("/v1/auth/me");
    if (confirmEmail !== me.user?.email) {
      return { error: "L'email ne correspond pas. Vérification échouée." };
    }
    await api.delete("/v1/auth/account");
  } catch (err: unknown) {
    logger.error("settings_delete", "Erreur suppression compte", { error: (err as Error).message });
    return { error: "Erreur lors de la suppression. Contacte le support." };
  }

  const jar = await cookies();
  jar.delete("creafolio_token");
  redirect("/");
}

// ============================================================
// Export user data (RGPD Art. 20) — US-803
// ============================================================
export async function exportUserDataAction(): Promise<{ data?: string; error?: string }> {
  try {
    const [portfolios, me] = await Promise.all([
      api.get<{ data: unknown[] }>("/v1/portfolios"),
      api.get<{ user: unknown }>("/v1/auth/me"),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user: me.user,
      portfolios: portfolios.data,
    };

    return { data: JSON.stringify(exportData, null, 2) };
  } catch (err: unknown) {
    logger.error("settings_export", "Erreur export données", { error: (err as Error).message });
    return { error: "Erreur lors de l'export." };
  }
}

// ============================================================
// Toggle allow_landing per portfolio — US-1105
// ============================================================
export async function toggleAllowLandingAction(
  portfolioId: string,
): Promise<ActionState> {
  try {
    const portfolio = await api.get<{ data: { allow_landing: boolean } }>(`/v1/portfolios/${portfolioId}`);
    const newValue = !portfolio.data?.allow_landing;
    await api.patch(`/v1/portfolios/${portfolioId}`, { allow_landing: newValue });
    revalidatePath("/dashboard");
    return {
      success: newValue
        ? "Ce portfolio peut maintenant être mis en avant sur la page d'accueil."
        : "Ce portfolio ne sera plus visible sur la page d'accueil.",
    };
  } catch (err: unknown) {
    logger.error("settings_landing", "Erreur toggle allow_landing", { error: (err as Error).message });
    return { error: "Erreur lors de la mise à jour." };
  }
}
