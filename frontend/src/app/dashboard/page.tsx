import { redirect } from 'next/navigation';
import { getMe, resolveIsPremium } from '@/lib/api-server';
import { getUserPortfolios } from '@/features/builder/actions';
import { PortfolioList } from '@/components/dashboard/portfolio-list';

export default async function DashboardPage() {
    let user;
    try {
        // getPorfolios in parallel with getMe (both independent)
        const [meData, portfolios] = await Promise.all([
            getMe(),
            getUserPortfolios(),
        ]);
        user = meData.user;

        const profile = user?.profile;
        if (!profile?.username) redirect('/setup/username');

        const isPremium = resolveIsPremium(profile);

        const maxPortfolios = isPremium ? 5 : 1;

        return (
            <div className="space-y-6">
                <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                        DASHBOARD // PORTFOLIOS
                    </p>
                    <h1 className="text-2xl font-bold text-white">
                        Mes portfolios
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Crée, édite et publie tes portfolios UGC.
                    </p>
                </div>

                <PortfolioList
                    portfolios={portfolios}
                    isPremium={isPremium}
                    maxPortfolios={maxPortfolios}
                />
            </div>
        );
    } catch {
        redirect('/login');
    }
}
