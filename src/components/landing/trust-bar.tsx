import { CoordLabel } from '@/components/ui/coord-label';
import { createAdminClient } from '@/lib/supabase/server';
import { TrustBarStats } from '@/components/landing/trust-bar-stats';

/**
 * Barre de confiance — métriques réelles + social proof.
 * Server Component (data) → TrustBarStats (client, NumberTicker).
 * US-1106
 */
export async function TrustBar() {
    const supabase = createAdminClient();

    // Fetch real metrics
    const [portfoliosRes, creatorsRes] = await Promise.all([
        supabase
            .from('portfolios')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'published')
            .is('deleted_at', null),
        supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .is('deleted_at', null),
    ]);

    const portfolioCount = portfoliosRes.count ?? 0;
    const creatorCount = creatorsRes.count ?? 0;

    const stats = [
        { label: 'Portfolios créés', numericValue: portfolioCount, suffix: '+' },
        { label: 'Créateurs actifs', numericValue: creatorCount, suffix: '+' },
        { label: 'Templates disponibles', numericValue: 5, suffix: '+' },
        { label: 'Satisfaction', numericValue: 100, suffix: '%' },
    ];

    return (
        <section className="relative py-12 lg:py-16">
            <div className="mx-auto max-w-5xl px-4 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <span className="flex-1 border-t border-dashed border-zinc-800" />
                    <CoordLabel
                        text="[ METRICS // LIVE ]"
                        className="text-sky-400/60 text-[10px] tracking-[0.2em]"
                    />
                    <span className="flex-1 border-t border-dashed border-zinc-800" />
                </div>

                {/* Stats cards */}
                <TrustBarStats stats={stats} />
            </div>
        </section>
    );
}
