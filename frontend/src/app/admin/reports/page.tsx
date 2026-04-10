import { api } from "@/lib/api-server";
import Link from "next/link";
import { updateReportStatusAction } from "@/features/admin/actions";

interface Report {
    id: string;
    portfolio_id: string;
    reason: string;
    status: string;
    created_at: string;
    reporter_ip_hash?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "En attente", color: "text-amber-400 border-amber-400/30" },
    reviewed: { label: "Examiné", color: "text-sky-400 border-sky-400/30" },
    resolved: { label: "Résolu", color: "text-emerald-400 border-emerald-400/30" },
    dismissed: { label: "Rejeté", color: "text-zinc-500 border-zinc-700" },
};

export default async function AdminReportsPage() {
    const result = await api.get<{ data: Report[] }>("/v1/admin/reports").catch(() => null);
    const reports: Report[] = result?.data ?? [];

    return (
        <div className="space-y-6">
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-orange-400/60 mb-1">ADMIN // SIGNALEMENTS</p>
                <h1 className="text-2xl font-bold text-white">Signalements</h1>
            </div>
            <div className="rounded-xl border border-dashed border-zinc-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-dashed border-zinc-800 bg-zinc-900/50">
                            <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">Portfolio</th>
                            <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">Raison</th>
                            <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">Statut</th>
                            <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">Date</th>
                            <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-zinc-800">
                        {reports.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-600">Aucun signalement.</td></tr>
                        )}
                        {reports.map((r) => {
                            const st = statusConfig[r.status] ?? statusConfig.pending;
                            return (
                                <tr key={r.id} className="hover:bg-zinc-900/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <Link href={`/admin/portfolios?id=${r.portfolio_id}`} className="text-sky-400 hover:text-sky-300 text-xs">
                                            {r.portfolio_id.slice(0, 8)}…
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400 text-xs">{r.reason}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full border border-dashed px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${st.color}`}>{st.label}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-zinc-600">{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            {r.status === "pending" && (
                                                <form action={updateReportStatusAction.bind(null, r.id, "reviewed")}>
                                                    <button type="submit" className="text-xs text-sky-400 hover:text-sky-300 transition-colors">Examiner</button>
                                                </form>
                                            )}
                                            {r.status !== "dismissed" && (
                                                <form action={updateReportStatusAction.bind(null, r.id, "dismissed")}>
                                                    <button type="submit" className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors">Rejeter</button>
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
    );
}
