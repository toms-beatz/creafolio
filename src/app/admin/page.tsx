import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";

/**
 * Admin Dashboard — US-1201
 * KPIs : users, portfolios, subscriptions, MRR, reports pending.
 */
export default async function AdminDashboardPage() {
    const admin = createAdminClient();

    // ── Fetch all KPIs in parallel ──
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

    const [
        { count: totalUsers },
        { count: newUsers7d },
        { count: newUsers30d },
        { count: totalPortfolios },
        { count: publishedPortfolios },
        { count: draftPortfolios },
        { count: activeSubscriptions },
        { count: pendingReports },
        { count: openTickets },
        { data: subscriptions },
        { count: trialUsers },
        { count: premiumUsers },
        { count: freeUsers },
    ] = await Promise.all([
        admin
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .is("deleted_at", null),
        admin
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .is("deleted_at", null)
            .gte("created_at", sevenDaysAgo),
        admin
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .is("deleted_at", null)
            .gte("created_at", thirtyDaysAgo),
        admin
            .from("portfolios")
            .select("*", { count: "exact", head: true })
            .is("deleted_at", null),
        admin
            .from("portfolios")
            .select("*", { count: "exact", head: true })
            .eq("status", "published"),
        admin
            .from("portfolios")
            .select("*", { count: "exact", head: true })
            .eq("status", "draft"),
        admin
            .from("subscriptions")
            .select("*", { count: "exact", head: true })
            .eq("status", "active"),
        admin
            .from("reports")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        admin
            .from("support_tickets")
            .select("*", { count: "exact", head: true })
            .in("status", ["open", "in_progress"]),
        admin
            .from("subscriptions")
            .select("stripe_price_id, status")
            .in("status", ["active", "trialing"]),
        admin
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("plan", "trial")
            .is("deleted_at", null),
        admin
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("plan", "premium")
            .is("deleted_at", null),
        admin
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("plan", "free")
            .is("deleted_at", null),
    ]);

    // ── MRR calculation ──
    const monthlyPriceId = process.env.STRIPE_PRICE_MONTHLY_ID;
    const yearlyPriceId = process.env.STRIPE_PRICE_YEARLY_ID;

    const monthlySubs =
        subscriptions?.filter((s) => s.stripe_price_id === monthlyPriceId).length ??
        0;
    const yearlySubs =
        subscriptions?.filter((s) => s.stripe_price_id === yearlyPriceId).length ??
        0;

    const mrr = monthlySubs * 11 + yearlySubs * (79 / 12);
    const arr = mrr * 12;

    const kpiCards = [
        {
            label: "Utilisateurs",
            value: totalUsers ?? 0,
            sub: `+${newUsers7d ?? 0} (7j) / +${newUsers30d ?? 0} (30j)`,
            color: "sky",
        },
        {
            label: "Portfolios",
            value: totalPortfolios ?? 0,
            sub: `${publishedPortfolios ?? 0} publiés · ${draftPortfolios ?? 0} brouillons`,
            color: "sky",
        },
        {
            label: "MRR",
            value: `${mrr.toFixed(0)}€`,
            sub: `ARR ${arr.toFixed(0)}€ · ${monthlySubs} mens. · ${yearlySubs} ann.`,
            color: "emerald",
        },
        {
            label: "Abonnements actifs",
            value: activeSubscriptions ?? 0,
            sub: `${premiumUsers ?? 0} premium · ${trialUsers ?? 0} trial · ${freeUsers ?? 0} free`,
            color: "violet",
        },
        {
            label: "Signalements en attente",
            value: pendingReports ?? 0,
            sub: pendingReports && pendingReports > 0 ? "Action requise" : "Aucun signalement",
            color: (pendingReports ?? 0) > 0 ? "red" : "emerald",
        },
        {
            label: "Tickets support ouverts",
            value: openTickets ?? 0,
            sub: (openTickets ?? 0) > 0 ? "Tickets à traiter" : "Aucun ticket ouvert",
            color: (openTickets ?? 0) > 0 ? "orange" : "emerald",
        },
    ];

    const colorMap: Record<string, string> = {
        sky: "border-sky-400/30 bg-sky-400/5 text-sky-400",
        emerald: "border-emerald-400/30 bg-emerald-400/5 text-emerald-400",
        violet: "border-violet-400/30 bg-violet-400/5 text-violet-400",
        red: "border-red-400/30 bg-red-400/5 text-red-400",
        orange: "border-orange-400/30 bg-orange-400/5 text-orange-400",
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                    ADMIN // OVERVIEW
                </p>
                <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Vue d&apos;ensemble de la plateforme Blooprint.
                </p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpiCards.map((kpi) => (
                    <div
                        key={kpi.label}
                        className={`rounded-xl border border-dashed p-5 ${colorMap[kpi.color]}`}
                    >
                        <p className="font-mono text-[9px] uppercase tracking-widest opacity-60 mb-2">
                            {kpi.label}
                        </p>
                        <p className="text-3xl font-bold">{kpi.value}</p>
                        <p className="mt-1 text-xs opacity-70">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                    href="/admin/reports"
                    className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-4 hover:border-orange-400/30 hover:bg-orange-400/5 transition-colors group"
                >
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 group-hover:text-orange-400 mb-1">
                        MODÉRATION
                    </p>
                    <p className="text-sm text-zinc-400 group-hover:text-white">
                        {(pendingReports ?? 0) > 0
                            ? `${pendingReports} signalement(s) à traiter`
                            : "Aucun signalement en attente"}
                    </p>
                </Link>
                <Link
                    href="/admin/users"
                    className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-4 hover:border-sky-400/30 hover:bg-sky-400/5 transition-colors group"
                >
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 group-hover:text-sky-400 mb-1">
                        UTILISATEURS
                    </p>
                    <p className="text-sm text-zinc-400 group-hover:text-white">
                        Gérer les comptes et plans
                    </p>
                </Link>
                <Link
                    href="/admin/billing"
                    className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-4 hover:border-emerald-400/30 hover:bg-emerald-400/5 transition-colors group"
                >
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 group-hover:text-emerald-400 mb-1">
                        REVENUS
                    </p>
                    <p className="text-sm text-zinc-400 group-hover:text-white">
                        MRR: {mrr.toFixed(0)}€ — ARR: {arr.toFixed(0)}€
                    </p>
                </Link>
                <Link
                    href="/admin/support"
                    className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-4 hover:border-orange-400/30 hover:bg-orange-400/5 transition-colors group"
                >
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 group-hover:text-orange-400 mb-1">
                        SUPPORT
                    </p>
                    <p className="text-sm text-zinc-400 group-hover:text-white">
                        {(openTickets ?? 0) > 0
                            ? `${openTickets} ticket(s) à traiter`
                            : "Aucun ticket en attente"}
                    </p>
                </Link>
            </div>
        </div>
    );
}
