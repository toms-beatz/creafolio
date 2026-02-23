"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Json } from "@/types/database";

/**
 * Vérifie que l'utilisateur courant est admin.
 * Redirige vers /dashboard si non-admin.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/dashboard");

  return { userId: user.id, profile };
}

/**
 * Log une action admin dans admin_audit_log — US-1209
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  details?: Record<string, unknown>,
) {
  const admin = createAdminClient();
  await admin.from("admin_audit_log").insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    details: (details as Json) ?? null,
  });
}

// ============================================================
// User management actions — US-1202
// ============================================================

export async function changeUserPlanAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const targetUserId = formData.get("userId") as string;
  const newPlan = formData.get("plan") as string;

  if (!targetUserId || !["free", "trial", "premium"].includes(newPlan)) return;

  const admin = createAdminClient();

  const { data: oldProfile } = await admin
    .from("profiles")
    .select("plan")
    .eq("id", targetUserId)
    .single();

  await admin
    .from("profiles")
    .update({
      plan: newPlan as "free" | "trial" | "premium",
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetUserId);

  await logAdminAction(userId, "user.plan_changed", "user", targetUserId, {
    old_plan: oldProfile?.plan,
    new_plan: newPlan,
  });
}

export async function extendTrialAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const targetUserId = formData.get("userId") as string;
  const days = parseInt(formData.get("days") as string) || 7;

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("trial_ends_at")
    .eq("id", targetUserId)
    .single();

  const base = profile?.trial_ends_at
    ? new Date(profile.trial_ends_at)
    : new Date();
  const newEnd = new Date(base.getTime() + days * 86400000);

  await admin
    .from("profiles")
    .update({
      plan: "trial",
      trial_ends_at: newEnd.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetUserId);

  await logAdminAction(userId, "user.trial_extended", "user", targetUserId, {
    days,
    new_trial_ends_at: newEnd.toISOString(),
  });
}

export async function suspendUserAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const targetUserId = formData.get("userId") as string;

  const admin = createAdminClient();

  await admin
    .from("profiles")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetUserId);

  // Unpublish all their portfolios
  await admin
    .from("portfolios")
    .update({ status: "suspended" })
    .eq("user_id", targetUserId)
    .eq("status", "published");

  await logAdminAction(userId, "user.suspended", "user", targetUserId);
}

export async function reactivateUserAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const targetUserId = formData.get("userId") as string;

  const admin = createAdminClient();

  await admin
    .from("profiles")
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq("id", targetUserId);

  await logAdminAction(userId, "user.reactivated", "user", targetUserId);
}

// ============================================================
// Portfolio moderation actions — US-1203
// ============================================================

export async function suspendPortfolioAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const portfolioId = formData.get("portfolioId") as string;

  const admin = createAdminClient();

  await admin
    .from("portfolios")
    .update({ status: "suspended", updated_at: new Date().toISOString() })
    .eq("id", portfolioId);

  await logAdminAction(userId, "portfolio.suspended", "portfolio", portfolioId);
}

export async function unpublishPortfolioAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const portfolioId = formData.get("portfolioId") as string;

  const admin = createAdminClient();

  await admin
    .from("portfolios")
    .update({ status: "draft", updated_at: new Date().toISOString() })
    .eq("id", portfolioId);

  await logAdminAction(
    userId,
    "portfolio.unpublished",
    "portfolio",
    portfolioId,
  );
}

export async function deletePortfolioAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const portfolioId = formData.get("portfolioId") as string;

  const admin = createAdminClient();

  await admin
    .from("portfolios")
    .update({
      status: "deleted",
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", portfolioId);

  await logAdminAction(userId, "portfolio.deleted", "portfolio", portfolioId);
}

// ============================================================
// Toggle admin_featured (showcase on landing) — US-1203
// ============================================================

export async function toggleAdminFeaturedAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const portfolioId = formData.get("portfolioId") as string;
  const currentValue = formData.get("adminFeatured") === "true";

  const admin = createAdminClient();

  if (!currentValue) {
    // Turning ON — check max 3 featured
    const { count } = await admin
      .from("portfolios")
      .select("*", { count: "exact", head: true })
      .eq("admin_featured", true)
      .eq("status", "published")
      .eq("allow_landing", true);

    if ((count ?? 0) >= 3) {
      // Remove the oldest featured to make room
      const { data: oldest } = await admin
        .from("portfolios")
        .select("id")
        .eq("admin_featured", true)
        .order("updated_at", { ascending: true })
        .limit(1)
        .single();

      if (oldest) {
        await admin
          .from("portfolios")
          .update({
            admin_featured: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", oldest.id);
      }
    }
  }

  await admin
    .from("portfolios")
    .update({
      admin_featured: !currentValue,
      updated_at: new Date().toISOString(),
    })
    .eq("id", portfolioId);

  await logAdminAction(
    userId,
    currentValue ? "portfolio.unfeatured" : "portfolio.featured",
    "portfolio",
    portfolioId,
  );
}

// ============================================================
// Report moderation actions — US-1204
// ============================================================

export async function updateReportStatusAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const reportId = formData.get("reportId") as string;
  const status = formData.get("status") as string;

  if (!["reviewed", "dismissed", "actioned"].includes(status)) return;

  const admin = createAdminClient();

  await admin
    .from("reports")
    .update({ status: status as "reviewed" | "dismissed" | "actioned" })
    .eq("id", reportId);

  // If actioned, also suspend the portfolio
  if (status === "actioned") {
    const { data: report } = await admin
      .from("reports")
      .select("portfolio_id")
      .eq("id", reportId)
      .single();

    if (report) {
      await admin
        .from("portfolios")
        .update({ status: "suspended", updated_at: new Date().toISOString() })
        .eq("id", report.portfolio_id);
    }
  }

  await logAdminAction(userId, `report.${status}`, "report", reportId);
}

// ============================================================
// App config actions — US-1208
// ============================================================

export async function updateConfigAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const key = formData.get("key") as string;
  const value = formData.get("value") as string;

  const admin = createAdminClient();

  const { data: old } = await admin
    .from("app_config")
    .select("value")
    .eq("key", key)
    .single();

  await admin.from("app_config").upsert({
    key,
    value: value as unknown as Json,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  });

  await logAdminAction(userId, "config.updated", "config", key, {
    old_value: old?.value,
    new_value: value,
  });
}
