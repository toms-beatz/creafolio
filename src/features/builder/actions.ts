"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateTemplate } from "@/lib/templates";
import type { Json } from "@/types/database";
import type { PortfolioTheme } from "@/types/theme";

export type PortfolioActionState = {
  error?: string;
  success?: string;
  portfolioId?: string;
};

/* ── Fetch portfolio (ownership check) ─────────────────────── */
export async function getPortfolio(portfolioId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", portfolioId)
    .eq("user_id", user.id) // ownership check — US-201 CA-4
    .is("deleted_at", null)
    .single();

  if (error || !data) return null;
  return data;
}

/* ── Fetch all portfolios for a user ───────────────────────── */
export async function getUserPortfolios() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("portfolios")
    .select(
      "id, title, slug, status, published_at, created_at, updated_at, craft_state, allow_landing",
    )
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  return data ?? [];
}

/* ── Create portfolio ───────────────────────────────────────── */
export async function createPortfolioAction(
  _prev: PortfolioActionState,
  formData: FormData,
): Promise<PortfolioActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  // Vérifier la limite plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const { data: existing } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  const isPremium = profile?.plan === "premium" || profile?.plan === "trial";
  const maxPortfolios = isPremium ? 5 : 1;

  if ((existing?.length ?? 0) >= maxPortfolios) {
    return {
      error: isPremium
        ? "Tu as atteint la limite de 5 portfolios."
        : "Le plan Free est limité à 1 portfolio. Passe en Premium pour en créer davantage.",
    };
  }

  const title = (formData.get("title") as string)?.trim() || "Mon Portfolio";
  // Générer un slug depuis le titre
  const baseSlug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) || "portfolio";

  // Unicité du slug globale (suffixe numérique si besoin)
  let slug = baseSlug;
  let suffix = 1;
  while (true) {
    const { data: conflict } = await supabase
      .from("portfolios")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!conflict) break;
    slug = `${baseSlug}-${suffix++}`;
  }

  const templateId = (formData.get("templateId") as string) || "classic";
  const craftState = generateTemplate(templateId) as Json;

  const { data, error } = await supabase
    .from("portfolios")
    .insert({ user_id: user.id, title, slug, craft_state: craftState })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createPortfolio] Supabase error:", error);
    return { error: "Erreur lors de la création du portfolio." };
  }

  revalidatePath("/dashboard");
  return { success: "Portfolio créé.", portfolioId: data.id };
}

/* ── Save craft_state (autosave) ────────────────────────────── */
export async function saveCraftState(
  portfolioId: string,
  craftState: Json,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  // Sécurité : si craftState est une string JSON, on parse en objet
  // pour éviter le double-encodage dans la colonne jsonb.
  let safeState: Json = craftState;
  if (typeof craftState === "string") {
    try {
      safeState = JSON.parse(craftState) as Json;
    } catch {
      // pas du JSON → on laisse tel quel
    }
  }

  // US-506 CA-1 — vérification limite blocs côté serveur (Free = 6 max)
  const parsed = safeState as Record<string, { nodes?: string[] }> | null;
  const blockCount = parsed?.ROOT?.nodes?.length ?? 0;

  if (blockCount > 0) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, trial_ends_at")
      .eq("id", user.id)
      .single();

    const isPremium =
      profile?.plan === "premium" ||
      (profile?.plan === "trial" &&
        !!profile.trial_ends_at &&
        new Date(profile.trial_ends_at) > new Date());

    if (!isPremium && blockCount > 6) {
      return {
        error:
          "Limite de 6 blocs en plan Free. Passe Premium pour en ajouter davantage.",
      };
    }
  }

  const { error } = await supabase
    .from("portfolios")
    .update({ craft_state: safeState, updated_at: new Date().toISOString() })
    .eq("id", portfolioId)
    .eq("user_id", user.id) // ownership check
    .is("deleted_at", null);

  if (error) return { error: error.message };
  return {};
}

/* ── Publish / Unpublish ─────────────────────────────────────── */
export async function togglePublishAction(
  portfolioId: string,
  publish: boolean,
): Promise<{ error?: string; warning?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  // Validation avant publication
  if (publish) {
    const { data: portfolio } = await supabase
      .from("portfolios")
      .select("craft_state")
      .eq("id", portfolioId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (!portfolio?.craft_state) {
      return { error: "Ajoute au moins un bloc avant de publier." };
    }

    // Compter les blocs (enfants du ROOT)
    const state = portfolio.craft_state as Record<string, { nodes?: string[] }>;
    const rootChildren = state?.ROOT?.nodes ?? [];
    if (rootChildren.length === 0) {
      return { error: "Ajoute au moins un bloc avant de publier." };
    }
  }

  let warning: string | undefined;

  // Avertissement si < 3 blocs
  if (publish) {
    const { data: p } = await supabase
      .from("portfolios")
      .select("craft_state")
      .eq("id", portfolioId)
      .eq("user_id", user.id)
      .single();
    const st = p?.craft_state as Record<string, { nodes?: string[] }> | null;
    const count = st?.ROOT?.nodes?.length ?? 0;
    if (count > 0 && count < 3) {
      warning = `Ton portfolio n'a que ${count} bloc(s). Ajoute-en davantage pour un meilleur rendu.`;
    }
  }

  const { error } = await supabase
    .from("portfolios")
    .update({
      status: publish ? "published" : "draft",
      published_at: publish ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", portfolioId)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { warning };
}

/* ── Soft-delete portfolio ───────────────────────────────────── */
export async function deletePortfolioAction(
  portfolioId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("portfolios")
    .update({ deleted_at: new Date().toISOString(), status: "deleted" })
    .eq("id", portfolioId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}

/* ── Reset craft_state (réinitialise avec template classique) ── */
export async function resetCraftState(
  portfolioId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const freshState = generateTemplate("classic") as Json;

  const { error } = await supabase
    .from("portfolios")
    .update({
      craft_state: freshState,
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", portfolioId)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath(`/builder/${portfolioId}`);
  return {};
}

/* ── Save portfolio theme ───────────────────────────────────── */
export async function saveThemeAction(
  portfolioId: string,
  theme: PortfolioTheme,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("portfolios")
    .update({
      theme: theme as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("id", portfolioId)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) return { error: error.message };
  return {};
}
