import { getMe, resolveIsPremium } from "@/lib/api-server";
import { redirect } from "next/navigation";
import { getUserPortfolios } from "@/features/builder/actions";
import { AnalyticsDashboardServer } from "@/components/analytics/analytics-dashboard-server";
import { BarChart3 } from 'lucide-react';

export default async function AnalyticsPage() {
    const [meData, portfolios] = await Promise.all([
        getMe().catch(() => null),
        getUserPortfolios(),
    ]);
    if (!meData?.user) redirect("/login");

    const isPremium = resolveIsPremium(meData.user.profile);

    return (
        <div className="space-y-6">
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                    DASHBOARD // ANALYTICS
                </p>
                <h1 className="text-2xl font-bold text-white">Analytics</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Suis les performances de tes portfolios.
                </p>
            </div>

            {portfolios.length > 0 ? (
                <AnalyticsDashboardServer portfolios={portfolios} isPremium={isPremium} />
            ) : (
                <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center">
                    <BarChart3 className="h-8 w-8 text-zinc-600 mb-3 mx-auto" />
                    <p className="text-sm text-zinc-400">Aucun portfolio à analyser.</p>
                    <p className="text-xs text-zinc-600 mt-1">
                        Crée et publie un portfolio pour voir tes stats.
                    </p>
                </div>
            )}
        </div>
    );
}
