"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api-server";

export async function requireAdmin() {
  try {
    const data = await api.get<{ user: { profile: { role: string } } }>(
      "/v1/auth/me",
    );
    if (data.user?.profile?.role !== "admin") redirect("/dashboard");
    return data.user;
  } catch {
    redirect("/login");
  }
}

export async function getAdminStats() {
  try {
    return await api.get("/v1/admin/stats");
  } catch {
    return null;
  }
}

export async function getAdminUsers(search?: string) {
  try {
    const suffix = search ? `?search=${encodeURIComponent(search)}` : "";
    return await api.get<{ data: unknown[] }>(`/v1/admin/users${suffix}`);
  } catch {
    return { data: [] };
  }
}

export async function getAdminReports() {
  try {
    return await api.get("/v1/admin/reports");
  } catch {
    return { data: [] };
  }
}

export async function getAdminTestimonials() {
  try {
    return await api.get("/v1/admin/testimonials");
  } catch {
    return { data: [] };
  }
}

export async function approveTestimonialAction(
  id: string,
  status: "approved" | "rejected",
  adminNote?: string,
): Promise<void> {
  await api
    .patch(`/v1/admin/testimonials/${id}`, { status, admin_note: adminNote })
    .catch(() => null);
}

// ============================================================
// Custom themes admin
// ============================================================
export async function getCustomThemesAction(): Promise<unknown[]> {
  try {
    const result = await api.get<{ data: unknown[] }>("/v1/admin/themes");
    return result?.data ?? [];
  } catch {
    return [];
  }
}

export async function upsertCustomThemeAction(
  theme: Record<string, unknown>,
): Promise<void> {
  const id = theme.id as string | undefined;
  if (id) {
    await api.patch(`/v1/admin/themes/${id}`, theme).catch(() => null);
  } else {
    await api.post("/v1/admin/themes", theme).catch(() => null);
  }
}

export async function deleteCustomThemeAction(id: string): Promise<void> {
  await api.delete(`/v1/admin/themes/${id}`).catch(() => null);
}

// ============================================================
// App config
// ============================================================
export async function updateConfigAction(
  config: Record<string, unknown>,
): Promise<void> {
  await api.post("/v1/admin/config", config).catch(() => null);
}

// ============================================================
// Admin portfolio actions
// ============================================================
export async function toggleAdminFeaturedAction(
  portfolioId: string,
  featured: boolean,
): Promise<void> {
  await api
    .patch(`/v1/admin/portfolios/${portfolioId}`, { is_featured: featured })
    .catch(() => null);
}

export async function unpublishPortfolioAction(
  portfolioId: string,
): Promise<void> {
  await api
    .patch(`/v1/admin/portfolios/${portfolioId}`, { status: "draft" })
    .catch(() => null);
}

export async function suspendPortfolioAction(
  portfolioId: string,
): Promise<void> {
  await api
    .patch(`/v1/admin/portfolios/${portfolioId}`, { status: "suspended" })
    .catch(() => null);
}

export async function deletePortfolioAction(
  portfolioId: string,
): Promise<void> {
  await api.delete(`/v1/admin/portfolios/${portfolioId}`).catch(() => null);
}

// ============================================================
// Admin report actions
// ============================================================
export async function updateReportStatusAction(
  id: string,
  status: string,
): Promise<void> {
  await api.patch(`/v1/admin/reports/${id}`, { status }).catch(() => null);
}

// ============================================================
// Admin user actions
// ============================================================
export async function suspendUserAction(userId: string): Promise<void> {
  await api
    .patch(`/v1/admin/users/${userId}`, { action: "suspend" })
    .catch(() => null);
}

export async function reactivateUserAction(userId: string): Promise<void> {
  await api
    .patch(`/v1/admin/users/${userId}`, { action: "reactivate" })
    .catch(() => null);
}

export async function changeUserPlanAction(
  userId: string,
  plan: string,
): Promise<void> {
  await api
    .patch(`/v1/admin/users/${userId}`, { action: "change_plan", plan })
    .catch(() => null);
}

export async function extendTrialAction(
  userId: string,
  days: number,
): Promise<void> {
  await api
    .patch(`/v1/admin/users/${userId}`, { action: "extend_trial", days })
    .catch(() => null);
}

export async function setTemplatePremiumAction(
  templateId: string,
  isPremium: boolean,
): Promise<void> {
  await api
    .patch(`/v1/admin/templates/${templateId}`, { is_premium: isPremium })
    .catch(() => null);
}
