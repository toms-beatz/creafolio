import { createAdminClient } from "@/lib/supabase/server";
import { ExternalLink } from 'lucide-react';

/**
 * Admin Billing Dashboard — US-1205
 * MRR, ARR, churn rate, ARPU, revenue breakdown.
 */
export default async function AdminBillingPage() {
    const admin = createAdminClient();

    const monthlyPriceId = process.env.STRIPE_PRICE_MONTHLY_ID;
    const yearlyPriceId = process.env.STRIPE_PRICE_YEARLY_ID;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
    // const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000).toISOString();

    const [
        { data: allSubs },
        { count: totalPremium },
        { count: totalFree },
        { count: totalTrial },
        { data: recentCancellations },
        { data: recentNewSubs },
    ] = await Promise.all([
        admin
            .from("subscriptions")
            .select("stripe_price_id, status, created_at, canceled_at, current_period_end"),
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
        admin
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("plan", "trial")
            .is("deleted_at", null),
        admin
            .from("subscriptions")
            .select("id, canceled_at")
            .not("canceled_at", "is", null)
            .gte("canceled_at", thirtyDaysAgo),
        admin
            .from("subscriptions")
            .select("id, created_at, stripe_price_id")
            .gte("created_at", thirtyDaysAgo)
            .in("status", ["active", "trialing"]),
    ]);

    // Calculate metrics
    const activeSubs = (allSubs ?? []).filter((s) =>
        ["active", "trialing"].includes(s.status ?? ""),
    );

    const monthlySubs = activeSubs.filter(
        (s) => s.stripe_price_id === monthlyPriceId,
    ).length;
    const yearlySubs = activeSubs.filter(
        (s) => s.stripe_price_id === yearlyPriceId,
    ).length;

    const mrr = monthlySubs * 11 + yearlySubs * (79 / 12);
    const arr = mrr * 12;
    const arpu =
        activeSubs.length > 0 ? mrr / activeSubs.length : 0;

    // Churn rate (30 days)
    const churnRate =
        activeSubs.length + (recentCancellations?.length ?? 0) > 0
            ? ((recentCancellations?.length ?? 0) /
                (activeSubs.length + (recentCancellations?.length ?? 0))) *
            100
            : 0;

    // LTV estimate
    const avgLifetimeMonths = churnRate > 0 ? 100 / churnRate : 24; // default 24 months if no churn
    const ltv = arpu * avgLifetimeMonths;

    // Growth
    const newMonthly = (recentNewSubs ?? []).filter(
        (s) => s.stripe_price_id === monthlyPriceId,
    ).length;
    const newYearly = (recentNewSubs ?? []).filter(
        (s) => s.stripe_price_id === yearlyPriceId,
    ).length;
    const newMRR = newMonthly * 11 + newYearly * (79 / 12);
    const lostMRR =
        (recentCancellations?.length ?? 0) * arpu;
    const netMRR = newMRR - lostMRR;

    // Revenue cards
    const cards = [
        {
            label: "MRR",
            value: `${mrr.toFixed(0)}€`,
            color: "emerald",
        },
        {
            label: "ARR",
            value: `${arr.toFixed(0)}€`,
            color: "emerald",
        },
        {
            label: "ARPU",
            value: `${arpu.toFixed(2)}€`,
            sub: "Revenu moyen par utilisateur payant",
            color: "sky",
        },
        {
            label: "LTV estimé",
            value: `${ltv.toFixed(0)}€`,
            sub: `Durée vie moy. : ${avgLifetimeMonths.toFixed(1)} mois`,
            color: "sky",
        },
        {
            label: "Churn (30j)",
            value: `${churnRate.toFixed(1)}%`,
            sub: `${recentCancellations?.length ?? 0} annulation(s) sur 30j`,
            color: churnRate > 10 ? "red" : churnRate > 5 ? "amber" : "emerald",
        },
        {
            label: "Net New MRR (30j)",
            value: `${netMRR >= 0 ? "+" : ""}${netMRR.toFixed(0)}€`,
            sub: `+${newMRR.toFixed(0)}€ new · -${lostMRR.toFixed(0)}€ churn`,
            color: netMRR >= 0 ? "emerald" : "red",
        },
    ];

    const colorMap: Record<string, string> = {
        sky: "border-sky-400/30 bg-sky-400/5 text-sky-400",
        emerald: "border-emerald-400/30 bg-emerald-400/5 text-emerald-400",
        violet: "border-violet-400/30 bg-violet-400/5 text-violet-400",
        red: "border-red-400/30 bg-red-400/5 text-red-400",
        amber: "border-amber-400/30 bg-amber-400/5 text-amber-400",
        orange: "border-orange-400/30 bg-orange-400/5 text-orange-400",
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                    ADMIN // BILLING
                </p>
                <h1 className="text-2xl font-bold text-white">Tableau de bord revenus</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Métriques financières et abonnements. Données temps réel.
                </p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className={`rounded-xl border border-dashed p-5 ${colorMap[card.color]}`}
                    >
                        <p className="font-mono text-[9px] uppercase tracking-widest opacity-60 mb-2">
                            {card.label}
                        </p>
                        <p className="text-3xl font-bold">{card.value}</p>
                        {card.sub && (
                            <p className="mt-1 text-xs opacity-70">{card.sub}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subscription breakdown */}
                <div className="rounded-xl border border-dashed border-zinc-800 p-5">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-4">
                        RÉPARTITION ABONNEMENTS
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-400">Mensuel (11€/mois)</span>
                            <span className="font-mono text-sm text-white">
                                {monthlySubs} abonnés
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-400">
                                Annuel (79€/an ≈ 6,58€/mois)
                            </span>
                            <span className="font-mono text-sm text-white">
                                {yearlySubs} abonnés
                            </span>
                        </div>
                        <div className="border-t border-dashed border-zinc-800 pt-3 flex items-center justify-between">
                            <span className="text-sm text-zinc-400">Total actifs</span>
                            <span className="font-mono text-sm text-white font-bold">
                                {activeSubs.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Plan distribution */}
                <div className="rounded-xl border border-dashed border-zinc-800 p-5">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-4">
                        DISTRIBUTION DES PLANS
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                                <span className="text-sm text-zinc-400">Free</span>
                            </span>
                            <span className="font-mono text-sm text-white">
                                {totalFree ?? 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                <span className="text-sm text-zinc-400">Trial</span>
                            </span>
                            <span className="font-mono text-sm text-white">
                                {totalTrial ?? 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-sky-400" />
                                <span className="text-sm text-zinc-400">Premium</span>
                            </span>
                            <span className="font-mono text-sm text-white">
                                {totalPremium ?? 0}
                            </span>
                        </div>
                        <div className="border-t border-dashed border-zinc-800 pt-3">
                            <p className="text-xs text-zinc-600">
                                Taux conversion free→premium:{" "}
                                <span className="text-white">
                                    {(totalFree ?? 0) + (totalPremium ?? 0) > 0
                                        ? (
                                            ((totalPremium ?? 0) /
                                                ((totalFree ?? 0) + (totalPremium ?? 0))) *
                                            100
                                        ).toFixed(1)
                                        : "0"}
                                    %
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stripe link */}
            <div className="mt-8 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-5">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-2">
                    GESTION AVANCÉE
                </p>
                <p className="text-sm text-zinc-400 mb-3">
                    Pour la gestion avancée des paiements, remboursements et factures.
                </p>
                <a
                    href="https://dashboard.stripe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-dashed border-violet-400/30 bg-violet-400/5 px-4 py-2 text-sm text-violet-400 hover:bg-violet-400/10 transition-colors"
                >
                    Ouvrir Stripe Dashboard <ExternalLink className="inline h-3.5 w-3.5" />
                </a>
            </div>
        </div>
    );
}
