import { api } from "@/lib/api-server";
import { suspendUserAction, reactivateUserAction, changeUserPlanAction } from "@/features/admin/actions";

interface AdminUser {
    id: string;
    email: string;
    created_at: string;
    is_suspended?: boolean;
    profile?: {
        username?: string;
        role?: string;
        plan?: string;
        plan_status?: string;
    };
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
    const params = await searchParams;
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.page) qs.set("page", params.page);

    const result = await api.get<{ data: AdminUser[]; meta?: { total?: number; current_page?: number; last_page?: number } }>(
        `/v1/admin/users?${qs.toString()}`
    ).catch(() => null);

    const users: AdminUser[] = result?.data ?? [];
    const meta = result?.meta;

    return (
        <div className="space-y-6">
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-orange-400/60 mb-1">ADMIN // UTILISATEURS</p>
                <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
                {meta?.total !== undefined && (
                    <p className="text-xs text-zinc-500 mt-1">{meta.total} utilisateur{meta.total > 1 ? "s" : ""} au total</p>
                )}
            </div>

            <form method="get" className="flex gap-3">
                <input
                    name="search"
                    defaultValue={params.search ?? ""}
                    placeholder="Email ou username…"
                    className="flex-1 bg-zinc-900 border border-dashed border-zinc-700 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
                <button type="submit" className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors">Chercher</button>
            </form>

            <div className="space-y-3">
                {users.length === 0 && (
                    <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-600">Aucun utilisateur trouvé.</div>
                )}
                {users.map((u) => {
                    const plan = u.profile?.plan ?? "free";
                    const role = u.profile?.role ?? "user";
                    const suspended = u.is_suspended ?? false;

                    return (
                        <div key={u.id} className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4 flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-white">{u.email}</span>
                                    {u.profile?.username && (
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">@{u.profile.username}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`rounded-full border border-dashed px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${plan === "premium" ? "text-amber-400 border-amber-400/30" : "text-zinc-500 border-zinc-700"}`}>{plan}</span>
                                    {role === "admin" && (
                                        <span className="rounded-full border border-dashed border-orange-400/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-orange-400">admin</span>
                                    )}
                                    {suspended && (
                                        <span className="rounded-full border border-dashed border-red-400/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-red-400">suspendu</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                {suspended ? (
                                    <form action={reactivateUserAction.bind(null, u.id)}>
                                        <button type="submit" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Réactiver</button>
                                    </form>
                                ) : (
                                    <form action={suspendUserAction.bind(null, u.id)}>
                                        <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors">Suspendre</button>
                                    </form>
                                )}
                                {plan === "free" && (
                                    <form action={changeUserPlanAction.bind(null, u.id, "premium")}>
                                        <button type="submit" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">→ Premium</button>
                                    </form>
                                )}
                                {plan === "premium" && (
                                    <form action={changeUserPlanAction.bind(null, u.id, "free")}>
                                        <button type="submit" className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors">→ Free</button>
                                    </form>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {meta && meta.last_page && meta.last_page > 1 && (
                <div className="flex gap-2 justify-center">
                    {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                        <a key={p} href={`?page=${p}${params.search ? `&search=${params.search}` : ""}`}
                            className={`w-8 h-8 flex items-center justify-center rounded text-xs font-mono border border-dashed ${p === (meta.current_page ?? 1) ? "border-orange-500 text-orange-400" : "border-zinc-700 text-zinc-500 hover:border-zinc-500"}`}>{p}</a>
                    ))}
                </div>
            )}
        </div>
    );
}
