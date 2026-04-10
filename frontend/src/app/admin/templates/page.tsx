import { getTemplatesWithConfig } from "@/lib/get-templates";
import { setTemplatePremiumAction } from "@/features/admin/actions";

export default async function AdminTemplatesPage() {
    const templates = await getTemplatesWithConfig();

    return (
        <div className="space-y-6">
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-orange-400/60 mb-1">ADMIN // TEMPLATES</p>
                <h1 className="text-2xl font-bold text-white">Templates</h1>
            </div>
            <div className="rounded-xl border border-dashed border-zinc-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-dashed border-zinc-800 bg-zinc-900/50">
                            <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">Template</th>
                            <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">Catégorie</th>
                            <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600">Premium</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-zinc-800">
                        {templates.map((t) => (
                            <tr key={t.id} className="hover:bg-zinc-900/50 transition-colors">
                                <td className="px-4 py-3 text-white font-medium">{t.name}</td>
                                <td className="px-4 py-3 text-zinc-400 text-xs">{t.niches?.[0] ?? "—"}</td>
                                <td className="px-4 py-3">
                                    <form action={setTemplatePremiumAction.bind(null, t.id, !t.premium)}>
                                        <button type="submit" className={`rounded-full border border-dashed px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest transition-colors ${t.premium ? "border-amber-400/30 text-amber-400 hover:bg-red-400/10 hover:border-red-400/30 hover:text-red-400" : "border-zinc-700 text-zinc-500 hover:bg-emerald-400/10 hover:border-emerald-400/30 hover:text-emerald-400"}`}>
                                            {t.premium ? "Premium" : "Gratuit"}
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
