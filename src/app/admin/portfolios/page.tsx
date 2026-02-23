import { createAdminClient } from "@/lib/supabase/server";
import {
    suspendPortfolioAction,
    unpublishPortfolioAction,
    deletePortfolioAction,
    toggleAdminFeaturedAction,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Flag, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Link from "next/link";

const ITEMS_PER_PAGE = 20;

const statusColors: Record<string, string> = {
    published: "border-emerald-400/30 text-emerald-400 bg-emerald-400/5",
    draft: "border-zinc-700 text-zinc-500",
    suspended: "border-red-400/30 text-red-400 bg-red-400/5",
    deleted: "border-zinc-800 text-zinc-700",
};

/**
 * Admin Portfolios — US-1203
 * Paginated portfolio list with search, filters, and moderation actions.
 */
export default async function AdminPortfoliosPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
    const params = await searchParams;
    const search = params.search || "";
    const statusFilter = params.status || "all";
    const page = Math.max(1, parseInt(params.page || "1"));

    const admin = createAdminClient();

    let query = admin
        .from("portfolios")
        .select("*, profiles!inner(username, email)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

    if (search) {
        query = query.or(
            `title.ilike.%${search}%,slug.ilike.%${search}%`,
        );
    }

    if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as "draft" | "published" | "suspended" | "deleted");
    } else {
        // Exclude soft-deleted by default
        query = query.is("deleted_at", null);
    }

    const { data: portfolios, count: totalCount } = await query;

    // Get report counts per portfolio
    const portfolioIds = (portfolios ?? []).map((p) => p.id);
    const { data: reportCounts } = portfolioIds.length
        ? await admin
            .from("reports")
            .select("portfolio_id")
            .in("portfolio_id", portfolioIds)
            .eq("status", "pending")
        : { data: [] };

    const reportCountMap = new Map<string, number>();
    (reportCounts ?? []).forEach((r) => {
        reportCountMap.set(
            r.portfolio_id,
            (reportCountMap.get(r.portfolio_id) ?? 0) + 1,
        );
    });

    // Get analytics counts (total views)
    const { data: viewCounts } = portfolioIds.length
        ? await admin
            .from("portfolio_analytics")
            .select("portfolio_id")
            .in("portfolio_id", portfolioIds)
        : { data: [] };

    const viewCountMap = new Map<string, number>();
    (viewCounts ?? []).forEach((v) => {
        viewCountMap.set(
            v.portfolio_id,
            (viewCountMap.get(v.portfolio_id) ?? 0) + 1,
        );
    });

    const totalPages = Math.ceil((totalCount ?? 0) / ITEMS_PER_PAGE);

    function buildUrl(newPage: number) {
        const p = new URLSearchParams();
        if (search) p.set("search", search);
        if (statusFilter !== "all") p.set("status", statusFilter);
        p.set("page", String(newPage));
        return `/admin/portfolios?${p.toString()}`;
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                    ADMIN // PORTFOLIOS
                </p>
                <h1 className="text-2xl font-bold text-white">Gestion des portfolios</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    {totalCount ?? 0} portfolios trouvés
                </p>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <form method="GET" action="/admin/portfolios" className="flex-1 min-w-[200px]">
                    {statusFilter !== "all" && (
                        <input type="hidden" name="status" value={statusFilter} />
                    )}
                    <input
                        type="text"
                        name="search"
                        defaultValue={search}
                        placeholder="Rechercher par titre ou slug..."
                        className="w-full rounded-lg border border-dashed border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-600 focus:border-orange-400/50 focus:outline-none transition-colors"
                    />
                </form>

                <div className="flex gap-2">
                    {["all", "published", "draft", "suspended"].map((s) => (
                        <Link
                            key={s}
                            href={`/admin/portfolios?${search ? `search=${search}&` : ""}${s !== "all" ? `status=${s}` : ""}`}
                            className={`rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors border border-dashed ${statusFilter === s
                                ? "border-orange-400/30 bg-orange-400/10 text-orange-400"
                                : "border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600"
                                }`}
                        >
                            {s === "all" ? "Tous" : s}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Portfolios Table */}
            <div className="rounded-xl border border-dashed border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-dashed border-zinc-800 bg-zinc-900/50">
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    Portfolio
                                </th>
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    Propriétaire
                                </th>
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    Vues
                                </th>
                                <th className="px-4 py-3 text-right font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dashed divide-zinc-800/50">
                            {(portfolios ?? []).map((portfolio) => {
                                const profile = portfolio.profiles as unknown as {
                                    username: string;
                                    email: string;
                                };
                                const reports = reportCountMap.get(portfolio.id) ?? 0;
                                const views = viewCountMap.get(portfolio.id) ?? 0;

                                return (
                                    <tr
                                        key={portfolio.id}
                                        className="hover:bg-zinc-900/30 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {portfolio.title || "Sans titre"}
                                                    </p>
                                                    <p className="text-xs text-zinc-600">
                                                        /{portfolio.slug}
                                                    </p>
                                                </div>
                                                {reports > 0 && (
                                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/20 px-1.5 font-mono text-[10px] text-red-400">
                                                        {reports}<Flag className="inline h-3 w-3 ml-0.5" />
                                                    </span>
                                                )}
                                                {portfolio.admin_featured && (
                                                    <span className="flex h-5 items-center gap-0.5 rounded-full bg-sky-400/10 border border-sky-400/30 px-1.5 font-mono text-[10px] text-sky-400">
                                                        <Star className="h-2.5 w-2.5 fill-sky-400" /> Landing
                                                    </span>
                                                )}
                                                {portfolio.allow_landing && !portfolio.admin_featured && (
                                                    <span className="flex h-5 items-center rounded-full bg-zinc-800 px-1.5 font-mono text-[10px] text-zinc-500" title="Consentement donné">
                                                        Consent ✓
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-zinc-400">@{profile.username}</p>
                                            <p className="text-[10px] text-zinc-600">
                                                {profile.email}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full border border-dashed px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${statusColors[portfolio.status] ?? statusColors.draft}`}
                                            >
                                                {portfolio.status}
                                            </span>
                                            {portfolio.published_at && (
                                                <p className="text-[10px] text-zinc-600 mt-1">
                                                    Publié le{" "}
                                                    {new Date(portfolio.published_at).toLocaleDateString(
                                                        "fr-FR",
                                                    )}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-400 font-mono text-xs">
                                            {views}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Preview */}
                                                <Link
                                                    href={`/${portfolio.slug}`}
                                                    target="_blank"
                                                    className="rounded px-2 py-1 text-[10px] text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                                                    title="Voir le portfolio"
                                                >
                                                    Voir
                                                </Link>

                                                {/* Featured toggle — only if published + user consented */}
                                                {portfolio.status === "published" && portfolio.allow_landing && (
                                                    <form action={toggleAdminFeaturedAction}>
                                                        <input type="hidden" name="portfolioId" value={portfolio.id} />
                                                        <input type="hidden" name="adminFeatured" value={String(portfolio.admin_featured)} />
                                                        <Button
                                                            type="submit"
                                                            variant="ghost"
                                                            size="sm"
                                                            className={`text-[10px] h-7 px-2 ${portfolio.admin_featured
                                                                ? 'text-sky-400 hover:text-sky-300'
                                                                : 'text-zinc-500 hover:text-sky-400'
                                                                }`}
                                                            title={portfolio.admin_featured ? 'Retirer de la landing' : 'Mettre en avant sur la landing'}
                                                        >
                                                            <Star className={`h-3 w-3 mr-0.5 ${portfolio.admin_featured ? 'fill-sky-400' : ''}`} />
                                                            {portfolio.admin_featured ? 'Landing ✓' : 'Landing'}
                                                        </Button>
                                                    </form>
                                                )}

                                                {/* Unpublish */}
                                                {portfolio.status === "published" && (
                                                    <form action={unpublishPortfolioAction}>
                                                        <input
                                                            type="hidden"
                                                            name="portfolioId"
                                                            value={portfolio.id}
                                                        />
                                                        <Button
                                                            type="submit"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-[10px] text-amber-400/60 hover:text-amber-400 h-7 px-2"
                                                        >
                                                            Dépublier
                                                        </Button>
                                                    </form>
                                                )}

                                                {/* Suspend */}
                                                {portfolio.status !== "suspended" &&
                                                    portfolio.status !== "deleted" && (
                                                        <form action={suspendPortfolioAction}>
                                                            <input
                                                                type="hidden"
                                                                name="portfolioId"
                                                                value={portfolio.id}
                                                            />
                                                            <Button
                                                                type="submit"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-[10px] text-red-400/60 hover:text-red-400 h-7 px-2"
                                                            >
                                                                Suspendre
                                                            </Button>
                                                        </form>
                                                    )}

                                                {/* Delete */}
                                                {portfolio.status !== "deleted" && (
                                                    <form action={deletePortfolioAction}>
                                                        <input
                                                            type="hidden"
                                                            name="portfolioId"
                                                            value={portfolio.id}
                                                        />
                                                        <Button
                                                            type="submit"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-[10px] text-red-400/60 hover:text-red-400 h-7 px-2"
                                                        >
                                                            Suppr
                                                        </Button>
                                                    </form>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
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
        </div>
    );
}
