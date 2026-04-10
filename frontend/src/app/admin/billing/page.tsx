import { api } from "@/lib/api-server";

export default async function AdminBillingPage() {
    const stats = await api.get<{
        subscriptions?: { active?: number; mrr?: number; arr?: number };
    }>("/v1/admin/stats").catch(() => null);

    const subs = stats?.subscriptions ?? {};

    return (
        <div className="space-y-6">
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-orange-400/60 mb-1">ADMIN // FACTURATION</p>
                <h1 className="text-2xl font-bold text-white">Facturation</h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">ABONNÉS ACTIFS</p>
                    <p className="text-2xl font-bold text-emerald-400">{subs.active ?? "—"}</p>
                </div>
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">MRR</p>
                    <p className="text-2xl font-bold text-sky-400">
                        {subs.mrr != null ? `${(subs.mrr / 100).toFixed(2)} €` : "—"}
                    </p>
                </div>
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">ARR</p>
                    <p className="text-2xl font-bold text-white">
                        {subs.arr != null ? `${(subs.arr / 100).toFixed(2)} €` : "—"}
                    </p>
                </div>
            </div>
            <p className="text-xs text-zinc-600">
                Données détaillées disponibles dans le dashboard Stripe.
            </p>
        </div>
    );
}
