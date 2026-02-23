import { createAdminClient } from "@/lib/supabase/server";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    changeUserPlanAction,
    extendTrialAction,
    suspendUserAction,
    reactivateUserAction,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ITEMS_PER_PAGE = 20;

const planColors: Record<string, string> = {
    free: "border-zinc-700 text-zinc-500",
    trial: "border-amber-400/30 text-amber-400 bg-amber-400/5",
    premium: "border-sky-400/30 text-sky-400 bg-sky-400/5",
};

/**
 * Admin Users — US-1202
 * Paginated user list with search, filters, and inline actions.
 */
export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; plan?: string; page?: string }>;
}) {
    const params = await searchParams;
    const search = params.search || "";
    const planFilter = params.plan || "all";
    const page = Math.max(1, parseInt(params.page || "1"));

    const admin = createAdminClient();

    let query = admin
        .from("profiles")
        .select("*", { count: "exact" })
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

    if (search) {
        query = query.or(
            `username.ilike.%${search}%,email.ilike.%${search}%`,
        );
    }

    if (planFilter !== "all") {
        query = query.eq("plan", planFilter as "free" | "trial" | "premium");
    }

    const { data: users, count: totalCount } = await query;

    // Get portfolio counts per user
    const userIds = (users ?? []).map((u) => u.id);
    const { data: portfolioCounts } = userIds.length
        ? await admin
            .from("portfolios")
            .select("user_id")
            .in("user_id", userIds)
            .is("deleted_at", null)
        : { data: [] };

    const portfolioCountMap = new Map<string, number>();
    (portfolioCounts ?? []).forEach((p) => {
        portfolioCountMap.set(p.user_id, (portfolioCountMap.get(p.user_id) ?? 0) + 1);
    });

    // Also get suspended users count
    const { count: suspendedCount } = await admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .not("deleted_at", "is", null);

    const totalPages = Math.ceil((totalCount ?? 0) / ITEMS_PER_PAGE);

    // Build search params for pagination
    function buildUrl(newPage: number) {
        const p = new URLSearchParams();
        if (search) p.set("search", search);
        if (planFilter !== "all") p.set("plan", planFilter);
        p.set("page", String(newPage));
        return `/admin/users?${p.toString()}`;
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                    ADMIN // UTILISATEURS
                </p>
                <h1 className="text-2xl font-bold text-white">Gestion des utilisateurs</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    {totalCount ?? 0} utilisateurs actifs · {suspendedCount ?? 0} suspendus
                </p>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <form method="GET" action="/admin/users" className="flex-1 min-w-[200px]">
                    {planFilter !== "all" && (
                        <input type="hidden" name="plan" value={planFilter} />
                    )}
                    <input
                        type="text"
                        name="search"
                        defaultValue={search}
                        placeholder="Rechercher par username ou email..."
                        className="w-full rounded-lg border border-dashed border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-600 focus:border-orange-400/50 focus:outline-none transition-colors"
                    />
                </form>

                <div className="flex gap-2">
                    {["all", "free", "trial", "premium"].map((plan) => (
                        <Link
                            key={plan}
                            href={`/admin/users?${search ? `search=${search}&` : ""}${plan !== "all" ? `plan=${plan}` : ""}`}
                            className={`rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors border border-dashed ${planFilter === plan
                                ? "border-orange-400/30 bg-orange-400/10 text-orange-400"
                                : "border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600"
                                }`}
                        >
                            {plan === "all" ? "Tous" : plan}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-xl border border-dashed border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-dashed border-zinc-800 bg-zinc-900/50">
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    Utilisateur
                                </th>
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    Plan
                                </th>
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    Portfolios
                                </th>
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    Inscrit le
                                </th>
                                <th className="px-4 py-3 text-right font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dashed divide-zinc-800/50">
                            {(users ?? []).map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-zinc-900/30 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <p className="text-white font-medium">@{user.username}</p>
                                        <p className="text-xs text-zinc-600">{user.email}</p>
                                        <p className="text-[10px] text-zinc-700 font-mono">
                                            {user.id.slice(0, 8)}...
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`rounded-full border border-dashed px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${planColors[user.plan] ?? planColors.free}`}
                                        >
                                            {user.plan}
                                        </span>
                                        {user.plan === "trial" && user.trial_ends_at && (
                                            <p className="text-[10px] text-zinc-600 mt-1">
                                                Expire:{" "}
                                                {new Date(user.trial_ends_at).toLocaleDateString(
                                                    "fr-FR",
                                                )}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400">
                                        {portfolioCountMap.get(user.id) ?? 0}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-500 text-xs">
                                        {new Date(user.created_at).toLocaleDateString("fr-FR")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {/* Change plan dropdown */}
                                            <form action={changeUserPlanAction} className="flex items-center gap-1">
                                                <input type="hidden" name="userId" value={user.id} />
                                                <select
                                                    name="plan"
                                                    defaultValue={user.plan}
                                                    className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-400 focus:border-orange-400/50 focus:outline-none"
                                                >
                                                    <option value="free">Free</option>
                                                    <option value="trial">Trial</option>
                                                    <option value="premium">Premium</option>
                                                </select>
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-[10px] text-zinc-500 hover:text-white h-7 px-2"
                                                >
                                                    OK
                                                </Button>
                                            </form>

                                            {/* Extend trial */}
                                            <form action={extendTrialAction}>
                                                <input type="hidden" name="userId" value={user.id} />
                                                <input type="hidden" name="days" value="7" />
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-[10px] text-amber-400/60 hover:text-amber-400 h-7 px-2"
                                                    title="Extend trial +7 days"
                                                >
                                                    +7j
                                                </Button>
                                            </form>

                                            {/* Suspend */}
                                            <form action={suspendUserAction}>
                                                <input type="hidden" name="userId" value={user.id} />
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-[10px] text-red-400/60 hover:text-red-400 h-7 px-2"
                                                    title="Suspendre ce compte"
                                                >
                                                    Ban
                                                </Button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-zinc-600">
                        Page {page} sur {totalPages} ({totalCount} résultats)
                    </p>
                    <div className="flex gap-2">
                        {page > 1 && (
                            <Link
                                href={buildUrl(page - 1)}
                                className="rounded-lg border border-dashed border-zinc-800 px-3 py-1.5 text-xs text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
                            >
                                <ChevronLeft className="inline h-3 w-3" /> Précédent
                            </Link>
                        )}
                        {page < totalPages && (
                            <Link
                                href={buildUrl(page + 1)}
                                className="rounded-lg border border-dashed border-zinc-800 px-3 py-1.5 text-xs text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
                            >
                                Suivant <ChevronRight className="inline h-3 w-3" />
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Suspended users section */}
            {(suspendedCount ?? 0) > 0 && (
                <SuspendedUsersSection />
            )}
        </div>
    );
}

/**
 * Inline component showing suspended users
 */
async function SuspendedUsersSection() {
    const admin = createAdminClient();
    const { data: suspended } = await admin
        .from("profiles")
        .select("id, username, email, deleted_at")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })
        .limit(10);

    if (!suspended || suspended.length === 0) return null;

    return (
        <div className="mt-8">
            <p className="font-mono text-[9px] uppercase tracking-widest text-red-400/60 mb-3">
                COMPTES SUSPENDUS
            </p>
            <div className="rounded-xl border border-dashed border-red-900/30 overflow-hidden">
                <div className="divide-y divide-dashed divide-red-900/20">
                    {suspended.map((user) => (
                        <div
                            key={user.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 px-4 py-3 bg-red-400/5"
                        >
                            <div>
                                <p className="text-sm text-zinc-300">@{user.username}</p>
                                <p className="text-xs text-zinc-600">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-3 self-end sm:self-auto">
                                <span className="text-[10px] text-zinc-600">
                                    Suspendu le{" "}
                                    {user.deleted_at
                                        ? new Date(user.deleted_at).toLocaleDateString("fr-FR")
                                        : "—"}
                                </span>
                                <form action={reactivateUserAction}>
                                    <input type="hidden" name="userId" value={user.id} />
                                    <Button
                                        type="submit"
                                        variant="ghost"
                                        size="sm"
                                        className="text-[10px] text-emerald-400/60 hover:text-emerald-400 h-7"
                                    >
                                        Réactiver
                                    </Button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
