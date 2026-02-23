import Link from "next/link";
import { ChevronLeft, ChevronRight, AlertTriangle, Globe, User } from 'lucide-react';
import { createAdminClient } from "@/lib/supabase/server";

const statusConfig: Record<string, { label: string; color: string }> = {
    open: { label: "Ouvert", color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
    in_progress: { label: "En cours", color: "text-sky-400 bg-sky-400/10 border-sky-400/30" },
    waiting_user: { label: "Attente user", color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
    resolved: { label: "Résolu", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
    closed: { label: "Fermé", color: "text-zinc-500 bg-zinc-800 border-zinc-700" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
    low: { label: "Basse", color: "text-zinc-500" },
    normal: { label: "Normal", color: "text-zinc-400" },
    high: { label: "Haute", color: "text-orange-400" },
    urgent: { label: "Urgent", color: "text-red-400" },
};

/**
 * US-1304 : File d'attente support admin
 * Tous les tickets avec filtres, recherche, tri par priorité/date.
 */
export default async function AdminSupportPage({
    searchParams,
}: {
    searchParams: Promise<{
        status?: string;
        category?: string;
        priority?: string;
        q?: string;
        page?: string;
    }>;
}) {
    const params = await searchParams;
    const admin = createAdminClient();

    const page = parseInt(params.page ?? "1", 10);
    const perPage = 20;
    const offset = (page - 1) * perPage;

    // Build query
    let query = admin
        .from("support_tickets")
        .select("*", { count: "exact" })
        .order("priority", { ascending: false })
        .order("created_at", { ascending: true })
        .range(offset, offset + perPage - 1);

    // Filters
    if (params.status && params.status !== "all") {
        query = query.eq("status", params.status as "open" | "in_progress" | "waiting_user" | "resolved" | "closed");
    }
    if (params.category && params.category !== "all") {
        query = query.eq("category", params.category as "general" | "inscription" | "technique" | "billing" | "autre");
    }
    if (params.priority && params.priority !== "all") {
        query = query.eq("priority", params.priority as "low" | "normal" | "high" | "urgent");
    }
    if (params.q) {
        query = query.ilike("subject", `%${params.q}%`);
    }

    const { data: tickets, count } = await query;
    const totalPages = Math.ceil((count ?? 0) / perPage);

    // Stats
    const { count: openCount } = await admin
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "in_progress"]);

    const { count: waitingCount } = await admin
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
        .eq("status", "waiting_user");

    // Check 48h old without admin response
    const cutoff48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    // Build filter URL helper
    function filterUrl(overrides: Record<string, string>) {
        const p = new URLSearchParams();
        const merged = {
            status: params.status ?? "",
            category: params.category ?? "",
            priority: params.priority ?? "",
            q: params.q ?? "",
            ...overrides,
        };
        for (const [k, v] of Object.entries(merged)) {
            if (v && v !== "all") p.set(k, v);
        }
        const qs = p.toString();
        return `/admin/support${qs ? `?${qs}` : ""}`;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-orange-400/60 mb-1">
                    ADMIN // SUPPORT
                </p>
                <h1 className="text-2xl font-bold text-white">
                    File d&apos;attente Support
                </h1>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                        OUVERTS
                    </p>
                    <p className="text-2xl font-bold text-amber-400">{openCount ?? 0}</p>
                </div>
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                        ATTENTE USER
                    </p>
                    <p className="text-2xl font-bold text-sky-400">{waitingCount ?? 0}</p>
                </div>
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                        TOTAL
                    </p>
                    <p className="text-2xl font-bold text-white">{count ?? 0}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-3 sm:p-4">
                {/* Status filter */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                        Statut:
                    </span>
                    <div className="flex gap-1">
                        {[
                            { value: "all", label: "Tous" },
                            { value: "open", label: "Ouverts" },
                            { value: "in_progress", label: "En cours" },
                            { value: "waiting_user", label: "Attente" },
                            { value: "resolved", label: "Résolus" },
                            { value: "closed", label: "Fermés" },
                        ].map((opt) => (
                            <Link
                                key={opt.value}
                                href={filterUrl({ status: opt.value, page: "1" })}
                                className={`rounded-lg px-2 py-1 text-xs transition-colors ${(params.status ?? "all") === opt.value
                                    ? "bg-orange-400/10 text-orange-400 border border-dashed border-orange-400/30"
                                    : "text-zinc-500 hover:text-white"
                                    }`}
                            >
                                {opt.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Priority filter */}
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                        Priorité:
                    </span>
                    <div className="flex gap-1">
                        {[
                            { value: "all", label: "Toutes" },
                            { value: "urgent", label: "Urgent" },
                            { value: "high", label: "Haute" },
                            { value: "normal", label: "Normal" },
                        ].map((opt) => (
                            <Link
                                key={opt.value}
                                href={filterUrl({ priority: opt.value, page: "1" })}
                                className={`rounded-lg px-2 py-1 text-xs transition-colors ${(params.priority ?? "all") === opt.value
                                    ? "bg-orange-400/10 text-orange-400 border border-dashed border-orange-400/30"
                                    : "text-zinc-500 hover:text-white"
                                    }`}
                            >
                                {opt.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search */}
            <form method="GET" action="/admin/support" className="flex gap-2">
                {params.status && (
                    <input type="hidden" name="status" value={params.status} />
                )}
                {params.priority && (
                    <input type="hidden" name="priority" value={params.priority} />
                )}
                <input
                    name="q"
                    type="text"
                    defaultValue={params.q ?? ""}
                    placeholder="Rechercher par sujet..."
                    className="flex-1 rounded-lg border border-dashed border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-600 focus:border-orange-400/50 focus:outline-none transition-colors"
                />
                <button
                    type="submit"
                    className="rounded-lg bg-orange-400/10 border border-dashed border-orange-400/30 px-4 py-2 text-xs text-orange-400 hover:bg-orange-400/20 transition-colors"
                >
                    Rechercher
                </button>
            </form>

            {/* Table */}
            <div className="rounded-xl border border-dashed border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-dashed border-zinc-800 bg-zinc-900/50">
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    Sujet
                                </th>
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    Demandeur
                                </th>
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    Catégorie
                                </th>
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    Priorité
                                </th>
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    Statut
                                </th>
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dashed divide-zinc-800">
                            {(!tickets || tickets.length === 0) && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-zinc-600"
                                    >
                                        Aucun ticket trouvé.
                                    </td>
                                </tr>
                            )}
                            {(tickets ?? []).map((ticket) => {
                                const st = statusConfig[ticket.status] ?? statusConfig.open;
                                const pr = priorityConfig[ticket.priority] ?? priorityConfig.normal;
                                const isOld =
                                    !["resolved", "closed"].includes(ticket.status) &&
                                    ticket.created_at < cutoff48h;
                                const isGuest = !ticket.user_id;

                                return (
                                    <tr
                                        key={ticket.id}
                                        className={`hover:bg-zinc-900/50 transition-colors ${isOld ? "bg-red-500/5" : ""
                                            }`}
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/admin/support/${ticket.id}`}
                                                className="text-white hover:text-orange-400 transition-colors font-medium"
                                            >
                                                {ticket.subject}
                                                {isOld && (
                                                    <span className="ml-2 text-[10px] text-red-400 inline-flex items-center gap-0.5">
                                                        <AlertTriangle className="h-3 w-3" /> +48h
                                                    </span>
                                                )}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-400">
                                            <span className="text-xs">
                                                {isGuest ? (
                                                    <span title={ticket.guest_email ?? ""}>
                                                        <Globe className="inline h-3 w-3 mr-1" />{ticket.guest_name ?? ticket.guest_email ?? "Visiteur"}
                                                    </span>
                                                ) : (
                                                    <span>
                                                        <User className="inline h-3 w-3 mr-1" />{ticket.user_id?.slice(0, 8)}
                                                    </span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                                                {ticket.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`font-mono text-[9px] uppercase tracking-widest ${pr.color}`}>
                                                {pr.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-block rounded-full border border-dashed px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${st.color}`}
                                            >
                                                {st.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-zinc-600">
                                            {new Date(ticket.created_at).toLocaleDateString("fr-FR")}
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
                <div className="flex items-center justify-center gap-2">
                    {page > 1 && (
                        <Link
                            href={filterUrl({ page: String(page - 1) })}
                            className="rounded-lg border border-dashed border-zinc-800 px-3 py-1 text-xs text-zinc-500 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="inline h-3 w-3" /> Précédent
                        </Link>
                    )}
                    <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                        Page {page} / {totalPages}
                    </span>
                    {page < totalPages && (
                        <Link
                            href={filterUrl({ page: String(page + 1) })}
                            className="rounded-lg border border-dashed border-zinc-800 px-3 py-1 text-xs text-zinc-500 hover:text-white transition-colors"
                        >
                            Suivant <ChevronRight className="inline h-3 w-3" />
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
