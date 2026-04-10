import { api } from "@/lib/api-server";
import { updateConfigAction } from "@/features/admin/actions";

export default async function AdminConfigPage() {
    const result = await api.get<{ data: Record<string, string> }>("/v1/admin/config").catch(() => null);
    const config = result?.data ?? {};

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-orange-400/60 mb-1">ADMIN // CONFIG</p>
                <h1 className="text-2xl font-bold text-white">Configuration</h1>
            </div>
            <form action={async (fd: FormData) => {
                "use server";
                const obj: Record<string, string> = {};
                for (const [k, v] of fd.entries()) { obj[k] = v as string; }
                await updateConfigAction(obj);
            }} className="space-y-4">
                {[
                    { key: "maintenance_mode", label: "Mode maintenance (true/false)", type: "text" },
                    { key: "max_portfolios_free", label: "Max portfolios (plan free)", type: "number" },
                    { key: "max_portfolios_premium", label: "Max portfolios (plan premium)", type: "number" },
                    { key: "storage_limit_free_mb", label: "Stockage max free (MB)", type: "number" },
                    { key: "storage_limit_premium_mb", label: "Stockage max premium (MB)", type: "number" },
                ].map((field) => (
                    <div key={field.key}>
                        <label className="block font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">{field.label}</label>
                        <input
                            type={field.type}
                            name={field.key}
                            defaultValue={config[field.key] ?? ""}
                            className="w-full rounded-lg border border-dashed border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-orange-400/50 focus:outline-none transition-colors"
                        />
                    </div>
                ))}
                <button type="submit" className="rounded-lg bg-orange-400/10 border border-dashed border-orange-400/30 px-6 py-2 text-sm text-orange-400 hover:bg-orange-400/20 transition-colors">
                    Enregistrer
                </button>
            </form>
        </div>
    );
}
