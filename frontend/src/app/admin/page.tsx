import { api } from "@/lib/api-server";
import Link from "next/link";
import { Users, FolderOpen, BarChart2, AlertTriangle, Headphones, Star } from "lucide-react";

export default async function AdminDashboardPage() {
    const stats = await api.get<{
        users?: { total?: number; new_this_month?: number };
        portfolios?: { total?: number; published?: number };
        testimonials?: { pending?: number };
        reports?: { pending?: number };
    }>("/v1/admin/stats").catch(() => null);

    const u = stats?.users ?? {};
    const p = stats?.portfolios ?? {};
    const r = stats?.reports ?? {};
    const t = stats?.testimonials ?? {};

    const kpis = [
        { label: "Utilisateurs", value: u.total ?? "—", sub: `+${u.new_this_month ?? 0} ce mois`, icon: Users, color: "text-sky-400" },
        { label: "Portfolios", value: p.total ?? "—", sub: `${p.published ?? 0} publiés`, icon: FolderOpen, color: "text-emerald-400" },
        { label: "Signalements", value: r.pending ?? "—", sub: "en attente", icon: AlertTriangle, color: "text-amber-400" },
        { label: "Avis", value: t.pending ?? "—", sub: "à valider", icon: Star, color: "text-purple-400" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-orange-400/60 mb-1">ADMIN // DASHBOARD</p>
                <h1 className="text-2xl font-bold text-white">Vue d&apos;ensemble</h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4">
                        <kpi.icon className={`h-4 w-4 mb-2 ${kpi.color}`} />
                        <p className="text-2xl font-bold text-white">{String(kpi.value)}</p>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mt-1">{kpi.label}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                    { href: "/admin/users", label: "Utilisateurs", icon: Users },
                    { href: "/admin/portfolios", label: "Portfolios", icon: FolderOpen },
                    { href: "/admin/reports", label: "Signalements", icon: AlertTriangle },
                    { href: "/admin/testimonials", label: "Témoignages", icon: Star },
                    { href: "/admin/support", label: "Support", icon: Headphones },
                    { href: "/admin/billing", label: "Facturation", icon: BarChart2 },
                ].map((link) => (
                    <Link key={link.href} href={link.href}
                        className="flex items-center gap-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4 hover:border-orange-400/30 transition-colors">
                        <link.icon className="h-4 w-4 text-orange-400" />
                        <span className="text-sm text-zinc-300">{link.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
