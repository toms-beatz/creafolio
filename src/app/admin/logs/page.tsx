import { createAdminClient } from "@/lib/supabase/server";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from "next/link";

const ITEMS_PER_PAGE = 30;

const actionColors: Record<string, string> = {
    "user.": "text-sky-400",
    "portfolio.": "text-amber-400",
    "report.": "text-red-400",
    "config.": "text-violet-400",
};

function getActionColor(action: string): string {
    for (const [prefix, color] of Object.entries(actionColors)) {
        if (action.startsWith(prefix)) return color;
    }
    return "text-zinc-400";
}

/**
 * Admin Audit Log — US-1209
 * Append-only log of all admin actions, filterable.
 */
export default async function AdminLogsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; type?: string }>;
}) {
    const params = await searchParams;
    const page = Math.max(1, parseInt(params.page || "1"));
    const typeFilter = params.type || "all";

    const admin = createAdminClient();

    let query = admin
        .from("admin_audit_log")
        .select("*, profiles!admin_audit_log_admin_id_fkey(username)", {
            count: "exact",
        })
        .order("created_at", { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

    if (typeFilter !== "all") {
        query = query.like("action", `${typeFilter}.%`);
    }

    const { data: logs, count: totalCount } = await query;

    const totalPages = Math.ceil((totalCount ?? 0) / ITEMS_PER_PAGE);

    function buildUrl(newPage: number) {
        const p = new URLSearchParams();
        if (typeFilter !== "all") p.set("type", typeFilter);
        p.set("page", String(newPage));
        return `/admin/logs?${p.toString()}`;
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                    ADMIN // AUDIT LOG
                </p>
                <h1 className="text-2xl font-bold text-white">Journal d&apos;audit</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Historique de toutes les actions admin ({totalCount ?? 0} entrées).
                    Append-only — aucune suppression possible.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {["all", "user", "portfolio", "report", "config"].map((t) => (
                    <Link
                        key={t}
                        href={`/admin/logs${t !== "all" ? `?type=${t}` : ""}`}
                        className={`rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors border border-dashed ${typeFilter === t
                            ? "border-orange-400/30 bg-orange-400/10 text-orange-400"
                            : "border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600"
                            }`}
                    >
                        {t === "all" ? "Tous" : t}
                    </Link>
                ))}
            </div>

            {/* Log entries */}
            {!logs || logs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center">
                    <p className="text-zinc-500 text-sm">Aucune entrée dans le journal.</p>
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-zinc-800 overflow-hidden">
                    <div className="divide-y divide-dashed divide-zinc-800/50">
                        {logs.map((log) => {
                            const admin = log.profiles as unknown as {
                                username: string;
                            } | null;
                            const details = log.details as Record<string, unknown> | null;

                            return (
                                <div
                                    key={log.id}
                                    className="px-4 py-3 hover:bg-zinc-900/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span
                                                    className={`font-mono text-xs font-bold ${getActionColor(log.action)}`}
                                                >
                                                    {log.action}
                                                </span>
                                                <span className="text-[10px] text-zinc-600">
                                                    sur {log.target_type}:{log.target_id.slice(0, 8)}...
                                                </span>
                                            </div>
                                            {details && Object.keys(details).length > 0 && (
                                                <pre className="text-[10px] text-zinc-600 bg-zinc-900 rounded px-2 py-1 mt-1 overflow-x-auto max-w-xl">
                                                    {JSON.stringify(details, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] text-zinc-600">
                                                {admin?.username ? `@${admin.username}` : log.admin_id.slice(0, 8)}
                                            </p>
                                            <p className="text-[10px] text-zinc-700">
                                                {new Date(log.created_at).toLocaleString("fr-FR", {
                                                    dateStyle: "short",
                                                    timeStyle: "medium",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-zinc-600">
                        Page {page} sur {totalPages}
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
