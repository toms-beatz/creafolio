import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserPortfolios } from '@/features/builder/actions';
import { PortfolioList } from '@/components/dashboard/portfolio-list';
import type { Profile } from '@/types/database';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single() as { data: Profile | null };

    if (!profile?.username) redirect('/setup/username');

    const portfolios = await getUserPortfolios();

    const isPremium =
        profile.plan === 'premium' ||
        (profile.plan === 'trial' &&
            !!profile.trial_ends_at &&
            new Date(profile.trial_ends_at) > new Date());

    const maxPortfolios = isPremium ? 5 : 1;

    return (
        <div className="space-y-6">
            {/* Heading */}
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

            {/* Portfolios */}
            <PortfolioList
                portfolios={portfolios}
                isPremium={isPremium}
                maxPortfolios={maxPortfolios}
            />
        </div>
    );
}
