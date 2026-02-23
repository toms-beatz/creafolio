import { createAdminClient } from "@/lib/supabase/server";
import { updateReportStatusAction, suspendUserAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const motifLabels: Record<string, string> = {
    nsfw: "Contenu NSFW",
    haineux: "Contenu haineux",
    spam: "Spam",
    autre: "Autre",
};

const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "En attente", color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
    reviewed: { label: "Examiné", color: "text-sky-400 bg-sky-400/10 border-sky-400/30" },
    dismissed: { label: "Classé", color: "text-zinc-400 bg-zinc-800 border-zinc-700" },
    actioned: { label: "Action prise", color: "text-red-400 bg-red-400/10 border-red-400/30" },
};

/**
 * Admin Reports Queue — US-1204
 * Shows all reports sorted by oldest pending first.
 */
export default async function AdminReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ filter?: string }>;
}) {
    const params = await searchParams;
    const filter = params.filter || "pending";
    const admin = createAdminClient();

    let query = admin
        .from("reports")
        .select("*, portfolios(id, title, slug, user_id, status)")
        .order("created_at", { ascending: true })
        .limit(50);

    if (filter !== "all") {
        query = query.eq("status", filter as "pending" | "reviewed" | "dismissed" | "actioned");
    }

    const { data: reports } = await query;

    // Get portfolio owner usernames
    const userIds = [
        ...new Set(
            (reports ?? [])
                .map((r) => {
                    const p = r.portfolios as unknown as { user_id: string } | null;
                    return p?.user_id;
                })
                .filter(Boolean) as string[],
        ),
    ];

    const { data: owners } = userIds.length
        ? await admin
            .from("profiles")
            .select("id, username, email")
            .in("id", userIds)
        : { data: [] };

    const ownerMap = new Map(
        (owners ?? []).map((o) => [o.id, o]),
    );

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                    ADMIN // MODÉRATION
                </p>
                <h1 className="text-2xl font-bold text-white">Signalements</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    File de modération — les plus anciens en premier.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {["pending", "reviewed", "actioned", "dismissed", "all"].map((f) => (
                    <Link
                        key={f}
                        href={`/admin/reports?filter=${f}`}
                        className={`rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors border border-dashed ${filter === f
                            ? "border-orange-400/30 bg-orange-400/10 text-orange-400"
                            : "border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600"
                            }`}
                    >
                        {f === "all" ? "Tous" : f}
                    </Link>
                ))}
            </div>

            {/* Reports list */}
            {!reports || reports.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center">
                    <p className="text-zinc-500 text-sm">
                        Aucun signalement {filter !== "all" ? `(${filter})` : ""}.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reports.map((report) => {
                        const portfolio = report.portfolios as unknown as {
                            id: string;
                            title: string;
                            slug: string;
                            user_id: string;
                            status: string;
                        } | null;
                        const owner = portfolio
                            ? ownerMap.get(portfolio.user_id)
                            : undefined;
                        const statusInfo =
                            statusLabels[report.status] ?? statusLabels.pending;

                        return (
                            <div
                                key={report.id}
                                className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-5"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                            <span
                                                className={`rounded-full border border-dashed px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${statusInfo.color}`}
                                            >
                                                {statusInfo.label}
                                            </span>
                                            <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-[9px] text-zinc-400">
                                                {motifLabels[report.motif] ?? report.motif}
                                            </span>
                                            <span className="text-[10px] text-zinc-600">
                                                {new Date(report.created_at).toLocaleString("fr-FR", {
                                                    dateStyle: "short",
                                                    timeStyle: "short",
                                                })}
                                            </span>
                                        </div>

                                        {/* Portfolio info */}
                                        {portfolio && (
                                            <div className="mb-2">
                                                <p className="text-sm text-white">
                                                    Portfolio:{" "}
                                                    <Link
                                                        href={`/${portfolio.slug}`}
                                                        target="_blank"
                                                        className="text-sky-400 hover:underline"
                                                    >
                                                        {portfolio.title || portfolio.slug}
                                                    </Link>
                                                    <span className="text-zinc-600 ml-2">
                                                        ({portfolio.status})
                                                    </span>
                                                </p>
                                                {owner && (
                                                    <p className="text-xs text-zinc-500">
                                                        Propriétaire:{" "}
                                                        <Link
                                                            href={`/admin/users?search=${owner.username}`}
                                                            className="text-zinc-400 hover:text-white"
                                                        >
                                                            @{owner.username}
                                                        </Link>
                                                        {" · "}
                                                        {owner.email}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Description */}
                                        {report.description && (
                                            <p className="text-xs text-zinc-400 mt-1 bg-zinc-800/50 rounded-lg px-3 py-2">
                                                &ldquo;{report.description}&rdquo;
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {report.status === "pending" && (
                                        <div className="flex flex-row sm:flex-col gap-2 shrink-0 flex-wrap">
                                            {/* Dismiss */}
                                            <form action={updateReportStatusAction}>
                                                <input type="hidden" name="reportId" value={report.id} />
                                                <input type="hidden" name="status" value="dismissed" />
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-zinc-500 hover:text-white text-xs w-full justify-start"
                                                >
                                                    Classer sans suite
                                                </Button>
                                            </form>

                                            {/* Reviewed */}
                                            <form action={updateReportStatusAction}>
                                                <input type="hidden" name="reportId" value={report.id} />
                                                <input type="hidden" name="status" value="reviewed" />
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-sky-400 hover:text-sky-300 text-xs w-full justify-start"
                                                >
                                                    Marquer examiné
                                                </Button>
                                            </form>

                                            {/* Action — suspend portfolio */}
                                            <form action={updateReportStatusAction}>
                                                <input type="hidden" name="reportId" value={report.id} />
                                                <input type="hidden" name="status" value="actioned" />
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-amber-400 hover:text-amber-300 text-xs w-full justify-start"
                                                >
                                                    Suspendre portfolio
                                                </Button>
                                            </form>

                                            {/* Action + Ban user */}
                                            {portfolio && (
                                                <form action={suspendUserAction}>
                                                    <input
                                                        type="hidden"
                                                        name="userId"
                                                        value={portfolio.user_id}
                                                    />
                                                    <Button
                                                        type="submit"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-400 hover:text-red-300 text-xs w-full justify-start"
                                                    >
                                                        Bannir l&apos;utilisateur
                                                    </Button>
                                                </form>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
