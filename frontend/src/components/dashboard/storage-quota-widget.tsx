import { getStorageUsage } from "@/features/media/actions";
import Link from "next/link";
import { HardDrive } from "lucide-react";

/** Format bytes to KB/MB/GB human readable */
function formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} Ko`;
    return `${bytes} octets`;
}

/**
 * Composant quota stockage — Server Component.
 * US-1701 — affiché dans /dashboard/account
 */
export async function StorageQuotaWidget() {
    const { totalBytes, quota } = await getStorageUsage();

    const pct = Math.min(100, Math.round((totalBytes / quota) * 100));
    const barColor =
        pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
    const textColor =
        pct >= 90 ? "text-red-400" : pct >= 70 ? "text-amber-400" : "text-zinc-400";

    return (
        <section className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-zinc-500" />
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                        STOCKAGE
                    </p>
                </div>
                <Link
                    href="/dashboard/media"
                    className="text-[10px] text-[#ad7b60] hover:text-[#d4a485] transition-colors"
                >
                    Gérer →
                </Link>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${pct}%`, minWidth: totalBytes > 0 ? '3px' : '0' }}
                />
            </div>

            <p className={`mt-2 text-xs ${textColor}`}>
                {formatBytes(totalBytes)} utilisés / {formatBytes(quota)}
            </p>

            {pct >= 90 && (
                <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
                    Stockage presque plein —{" "}
                    <Link href="/dashboard/media" className="underline hover:text-red-200">
                        gérer mes fichiers
                    </Link>
                </div>
            )}
        </section>
    );
}
