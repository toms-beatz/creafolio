"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, resolveIsPremium } from "@/lib/api-server";
import { generateTemplate } from "@/lib/templates";
import { UGC_PROFILES } from "@/lib/themes";
import type { PortfolioTheme } from "@/types/theme";

export type PortfolioActionState = {
  error?: string;
  success?: string;
  portfolioId?: string;
  warning?: string;
};

interface Portfolio {
  id: string;
  user_id: number;
  title: string;
  slug: string;
  status: string;
  craft_state: Record<string, unknown> | null;
  content: Record<string, unknown> | null;
  theme: PortfolioTheme | null;
  description: string | null;
  allow_landing: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getPortfolio(
  portfolioId: string,
): Promise<Portfolio | null> {
  try {
    const data = await api.get<{ data: Portfolio }>(
      `/v1/portfolios/${portfolioId}`,
    );
    return data.data;
  } catch {
    return null;
  }
}

export async function getUserPortfolios(): Promise<Portfolio[]> {
  try {
    const data = await api.get<{ data: Portfolio[] }>("/v1/portfolios");
    return data.data;
  } catch {
    return [];
  }
}

export async function createPortfolioAction(
  _prev: PortfolioActionState,
  formData: FormData,
): Promise<PortfolioActionState> {
  const title = (formData.get("title") as string)?.trim();
  // The form may send 'templateId' (wizard) or 'template' (legacy form)
  const template =
    (formData.get("templateId") as string) ??
    (formData.get("template") as string) ??
    "classic";

  if (!title) return { error: "Le titre est requis." };

  const craftState = generateTemplate(template);

  let portfolioId: string;
  try {
    const res = await api.post<{ data: Portfolio }>("/v1/portfolios", {
      title,
      craft_state: craftState,
      status: "draft",
    });
    portfolioId = res.data.id;
  } catch (err: unknown) {
    const e = err as { errors?: { slug?: string[] }; message?: string };
    if (e.errors?.slug)
      return { error: "Ce slug est déjà utilisé. Choisis-en un autre." };
    return { error: e.message ?? "Erreur lors de la création." };
  }

  revalidatePath("/dashboard");
  redirect(`/builder/${portfolioId}`);
}

export async function saveCraftStateAction(
  portfolioId: string,
  craftState: Record<string, unknown>,
): Promise<{ error?: string }> {
  try {
    await api.patch(`/v1/portfolios/${portfolioId}`, {
      craft_state: craftState,
    });
    return {};
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

export async function publishPortfolioAction(
  portfolioId: string,
  publish: boolean,
): Promise<{ error?: string; warning?: string }> {
  try {
    const portfolio = await getPortfolio(portfolioId);
    if (!portfolio) return { error: "Portfolio introuvable." };

    if (publish) {
      const state = portfolio.craft_state as Record<
        string,
        { nodes?: string[] }
      > | null;
      const rootChildren = state?.ROOT?.nodes ?? [];
      if (rootChildren.length === 0) {
        return { error: "Ajoute au moins un bloc avant de publier." };
      }
    }

    await api.patch(`/v1/portfolios/${portfolioId}`, {
      status: publish ? "published" : "draft",
      published_at: publish ? new Date().toISOString() : null,
    });

    const state = portfolio.craft_state as Record<
      string,
      { nodes?: string[] }
    > | null;
    const count = state?.ROOT?.nodes?.length ?? 0;
    const warning =
      publish && count > 0 && count < 3
        ? `Ton portfolio n'a que ${count} bloc(s). Ajoute-en davantage pour un meilleur rendu.`
        : undefined;

    revalidatePath("/dashboard");
    return { warning };
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

export async function deletePortfolioAction(
  portfolioId: string,
): Promise<{ error?: string }> {
  try {
    await api.delete(`/v1/portfolios/${portfolioId}`);
    revalidatePath("/dashboard");
    return {};
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

export async function resetCraftState(
  portfolioId: string,
): Promise<{ error?: string }> {
  const freshState = generateTemplate("classic");
  return saveCraftStateAction(
    portfolioId,
    freshState as Record<string, unknown>,
  );
}

export async function saveThemeAction(
  portfolioId: string,
  theme: PortfolioTheme,
): Promise<{ error?: string }> {
  try {
    const profile_match = UGC_PROFILES.find((p) => p.themeId === theme.id);
    if (profile_match?.premium) {
      const data = await api.get<{
        user: {
          profile: { plan: string; role: string; trial_ends_at: string | null };
        };
      }>("/v1/auth/me");
      const userProfile = data.user?.profile;
      const isPremium = userProfile ? resolveIsPremium(userProfile) : false;
      if (!isPremium)
        return { error: "Ce thème est réservé aux membres Premium." };
    }
    await api.patch(`/v1/portfolios/${portfolioId}`, { theme });
    return {};
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

export async function togglePublishAction(
  portfolioId: string,
  publish: boolean,
): Promise<PortfolioActionState> {
  try {
    const data = await api.patch<{ data: Portfolio }>(
      `/v1/portfolios/${portfolioId}`,
      {
        status: publish ? "published" : "draft",
      },
    );
    return {
      portfolioId: data.data.id,
      success: publish ? "Portfolio publié." : "Portfolio dépublié.",
    };
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}
