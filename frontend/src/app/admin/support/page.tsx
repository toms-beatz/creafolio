import { api } from "@/lib/api-server";
import Link from "next/link";
import { ChevronLeft, ChevronRight, AlertTriangle, Globe, User } from 'lucide-react';

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

interface Ticket {
    id: string;
    user_id?: string;
    guest_email?: string;
    guest_name?: string;
    subject: string;
    category: string;
    status: string;
    priority: string;
    created_at: string;
}

export default async function AdminSupportPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; category?: string; priority?: string; q?: string; page?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);

    const qs = new URLSearchParams();
    if (params.status && params.status !== "all") qs.set("status", params.status);
    if (params.category && params.category !== "all") qs.set("category", params.category);
    if (params.priority && params.priority !== "all") qs.set("priority", params.priority);
    if (params.q) qs.set("q", params.q);
    qs.set("page", String(page));

    const result = await api.get<{
        data: Ticket[];
        total: number;
        pages: number;
        open_count: number;
        waiting_count: number;
    }>(`/v1/admin/support?${qs.toString()}`).catch(() => null);

    const tickets: Ticket[] = result?.data ?? [];
    const total = result?.total ?? 0;
    const totalPages = result?.pages ?? 1;
    const openCount = result?.open_count ?? 0;
    const waitingCount = result?.waiting_count ?? 0;
    const cutoff48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

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
        const qs2 = p.toString();
        return `/admin/support${qs2 ? `?${qs2}` : ""}`;
    }

    return (
        <div className="space-y-6">
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-orange-400/60 mb-1">ADMIN // SUPPORT</p>
                <h1 className="text-2xl font-bold text-white">File d&apos;attente Support</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">OUVERTS</p>
                    <p className="text-2xl font-bold text-amber-400">{openCount}</p>
                </div>
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">ATTENTE USER</p>
                    <p className="text-2xl font-bold text-sky-400">{waitingCount}</p>
                </div>
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">TOTAL</p>
                    <p className="text-2xl font-bold text-white">{total}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-3 sm:p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">Statut:</span>
                    <div className="flex gap-1">
                        {[{ value: "all", label: "Tous" }, { value: "open", label: "Ouverts" }, { value: "in_progress", label: "En cours" }, { value: "waiting_user", label: "Attente" }, { value: "resolved", label: "Résolus" }, { value: "closed", label: "Fermés" }].map((opt) => (
                            <Link key={opt.value} href={filterUrl({ status: opt.value, page: "1" })}
                                className={`rounded-lg px-2 py-1 text-xs transition-colors ${(params.status ?? "all") === opt.value ? "bg-orange-400/10 text-orange-400 border border-dashed border-orange-400/30" : "text-zinc-500 hover:text-white"}`}>
                                {opt.label}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">Priorité:</span>
                    <div className="flex gap-1">
                        {[{ value: "all", label: "Toutes" }, { value: "urgent", label: "Urgent" }, { value: "high", label: "Haute" }, { value: "normal", label: "Normal" }].map((opt) => (
                            <Link key={opt.value} href={filterUrl({ priority: opt.value, page: "1" })}
                                className={`rounded-lg px-2 py-1 text-xs transition-colors ${(params.priority ?? "all") === opt.value ? "bg-orange-400/10 text-orange-400 border border-dashed border-orange-400/30" : "text-zinc-500 hover:text-white"}`}>
                                {opt.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <form method="GET" action="/admin/support" className="flex gap-2">
                {params.status && <input type="hidden" name="status" value={params.status} />}
                {params.priority && <input type="hidden" name="priority" value={params.priority} />}
                <input name="q" type="text" defaultValue={params.q ?? ""} placeholder="Rechercher par sujet..."
                    className="flex-1 rounded-lg border border-dashed border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-600 focus:border-orange-400/50 focus:outline-none transition-colors" />
                <button type="submit" className="rounded-lg bg-orange-400/10 border border-dashed border-orange-400/30 px-4 py-2 text-xs text-orange-400 hover:bg-orange-400/20 transition-colors">
                    Rechercher
                </button>
            </form>

            <div className="rounded-xl border border-dashed border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-dashed border-zinc-800 bg-zinc-900/50">
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">Sujet</th>
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">Demandeur</th>
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">Catégorie</th>
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">Priorité</th>
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">Statut</th>
                                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dashed divide-zinc-800">
                            {tickets.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-600">Aucun ticket trouvé.</td></tr>
                            )}
                            {tickets.map((ticket) => {
                                const st = statusConfig[ticket.status] ?? statusConfig.open;
                                const pr = priorityConfig[ticket.priority] ?? priorityConfig.normal;
                                const isOld = !["resolved", "closed"].includes(ticket.status) && ticket.created_at < cutoff48h;
                                const isGuest = !ticket.user_id;
                                return (
                                    <tr key={ticket.id} className={`hover:bg-zinc-900/50 transition-colors ${isOld ? "bg-red-500/5" : ""}`}>
                                        <td className="px-4 py-3">
                                            <Link href={`/admin/support/${ticket.id}`} className="text-white hover:text-orange-400 transition-colors font-medium">
                                                {ticket.subject}
                                                {isOld && <span className="ml-2 text-[10px] text-red-400 inline-flex items-center gap-0.5"><AlertTriangle className="h-3 w-3" /> +48h</span>}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-400 text-xs">
                                            {isGuest ? (
                                                <span title={ticket.guest_email ?? ""}><Globe className="inline h-3 w-3 mr-1" />{ticket.guest_name ?? ticket.guest_email ?? "Visiteur"}</span>
                                            ) : (
                                                <span><User className="inline h-3 w-3 mr-1" />{ticket.user_id?.slice(0, 8)}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3"><span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{ticket.category}</span></td>
                                        <td className="px-4 py-3"><span className={`font-mono text-[9px] uppercase tracking-widest ${pr.color}`}>{pr.label}</span></td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block rounded-full border border-dashed px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${st.color}`}>{st.label}</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-zinc-600">{new Date(ticket.created_at).toLocaleDateString("fr-FR")}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    {page > 1 && (
                        <Link href={filterUrl({ page: String(page - 1) })} className="rounded-lg border border-dashed border-zinc-800 px-3 py-1 text-xs text-zinc-500 hover:text-white transition-colors">
                            <ChevronLeft className="inline h-3 w-3" /> Précédent
                        </Link>
                    )}
                    <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">Page {page} / {totalPages}</span>
                    {page < totalPages && (
                        <Link href={filterUrl({ page: String(page + 1) })} className="rounded-lg border border-dashed border-zinc-800 px-3 py-1 text-xs text-zinc-500 hover:text-white transition-colors">
                            Suivant <ChevronRight className="inline h-3 w-3" />
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
