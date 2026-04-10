import { api } from "@/lib/api-server";
import {
    unpublishPortfolioAction,
    suspendPortfolioAction,
    deletePortfolioAction,
    toggleAdminFeaturedAction,
} from "@/features/admin/actions";

interface AdminPortfolio {
    id: string;
    title: string;
    slug: string;
    status: string;
    is_featured?: boolean;
    is_suspended?: boolean;
    view_count?: number;
    user?: { id: string; email: string };
    created_at: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
    published: { label: "Publié", color: "text-emerald-400 border-emerald-400/30" },
    draft: { label: "Brouillon", color: "text-zinc-500 border-zinc-700" },
    suspended: { label: "Suspendu", color: "text-red-400 border-red-400/30" },
};

export default async function AdminPortfoliosPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; page?: string; status?: string }>;
}) {
    const params = await searchParams;
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.page) qs.set("page", params.page);
    if (params.status) qs.set("status", params.status);

    const result = await api
        .get<{ data: AdminPortfolio[]; meta?: { total?: number; current_page?: number; last_page?: number } }>(
            "/v1/admin/portfolios?" + qs.toString()
        )
        .catch(() => null);

    const portfolios: AdminPortfolio[] = result?.data ?? [];
    const meta = result?.meta;

    return (
        <div className="space-y-6">
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-orange-400/60 mb-1">ADMIN // PORTFOLIOS</p>
                <h1 className="text-2xl font-bold text-white">Portfolios</h1>
                {meta?.total !== undefined && (
                    <p className="text-xs text-zinc-500 mt-1">{meta.total} portfolio{meta.total !== 1 ? "s" : ""}</p>
                )}
            </div>

            <form method="get" className="flex gap-3">
                <input
                    name="search"
                    defaultValue={params.search ?? ""}
                    placeholder="Titre ou slug…"
                    className="flex-1 bg-zinc-900 border border-dashed border-zinc-700 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
                <select
                    name="status"
                    defaultValue={params.status ?? ""}
                    className="bg-zinc-900 border border-dashed border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                >
                    <option value="">Tous les statuts</option>
                    <option value="published">Publiés</option>
                    <option value="draft">Brouillons</option>
                    <option value="suspended">Suspendus</option>
                </select>
                <button type="submit" className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors">Filtrer</button>
            </form>

            <div className="space-y-3">
                {portfolios.length === 0 && (
                    <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-600">Aucun portfolio trouvé.</div>
                )}
                {portfolios.map((p) => {
                    const st = statusConfig[p.status] ?? statusConfig.draft;
                    return (
                        <div key={p.id} className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4 flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-white truncate">{p.title}</span>
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">/{p.slug}</span>
                                    {p.is_featured && (
                                        <span className="rounded-full border border-dashed border-amber-400/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-amber-400">featured</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`rounded-full border border-dashed px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${st.color}`}>{st.label}</span>
                                    {p.user?.email && <span className="text-[10px] text-zinc-600 truncate">{p.user.email}</span>}
                                    {p.view_count !== undefined && <span className="text-[10px] text-zinc-600">{p.view_count} vues</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <form action={toggleAdminFeaturedAction.bind(null, p.id, !p.is_featured)}>
                                    <button type="submit" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">{p.is_featured ? "Retirer featured" : "Featurer"}</button>
                                </form>
                                {p.status === "published" && (
                                    <form action={unpublishPortfolioAction.bind(null, p.id)}>
                                        <button type="submit" className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors">Dépublier</button>
                                    </form>
                                )}
                                {p.status !== "suspended" && (
                                    <form action={suspendPortfolioAction.bind(null, p.id)}>
                                        <button type="submit" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">Suspendre</button>
                                    </form>
                                )}
                                <form action={deletePortfolioAction.bind(null, p.id)}>
                                    <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors">Supprimer</button>
                                </form>
                            </div>
                        </div>
                    );
                })}
            </div>

            {meta && meta.last_page && meta.last_page > 1 && (
                <div className="flex gap-2 justify-center">
                    {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((pageNum) => (
                        <a key={pageNum} href={"?page=" + pageNum + (params.search ? "&search=" + params.search : "") + (params.status ? "&status=" + params.status : "")}
                            className={"w-8 h-8 flex items-center justify-center rounded text-xs font-mono border border-dashed " + (pageNum === (meta.current_page ?? 1) ? "border-orange-500 text-orange-400" : "border-zinc-700 text-zinc-500 hover:border-zinc-500")}>
                            {pageNum}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
