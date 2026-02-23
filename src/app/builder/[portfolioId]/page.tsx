import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPortfolio } from '@/features/builder/actions';
import { BuilderEditorDynamic } from '@/components/builder/builder-editor-dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Builder',
    robots: { index: false, follow: false },
};

interface Props {
    params: Promise<{ portfolioId: string }>;
}

/**
 * Page builder — Server Component.
 * Vérifie l'ownership, charge le portfolio, puis rend le BuilderEditor (client ssr:false).
 * US-201
 */
export default async function BuilderPage({ params }: Props) {
    const { portfolioId } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const portfolio = await getPortfolio(portfolioId);
    if (!portfolio) notFound(); // 404 = pas le bon owner ou pas trouvé — US-201 CA-4

    const { data: profile } = await supabase
        .from('profiles')
        .select('plan, username, trial_ends_at')
        .eq('id', user.id)
        .single();

    const isPremium =
        profile?.plan === 'premium' ||
        (profile?.plan === 'trial' &&
            !!profile.trial_ends_at &&
            new Date(profile.trial_ends_at) > new Date());

    // Normaliser craft_state : Supabase peut retourner un objet ou une string
    // (si l'autosave avait stocké une string JSON avant le fix).
    let craftStateJson: string | null = null;
    if (portfolio.craft_state) {
        craftStateJson = typeof portfolio.craft_state === 'string'
            ? portfolio.craft_state
            : JSON.stringify(portfolio.craft_state);
    }

    // Normaliser theme
    let initialTheme = null;
    if (portfolio.theme) {
        initialTheme = typeof portfolio.theme === 'string'
            ? JSON.parse(portfolio.theme)
            : portfolio.theme;
    }

    return (
        <BuilderEditorDynamic
            portfolioId={portfolio.id}
            portfolioTitle={portfolio.title}
            portfolioStatus={portfolio.status}
            portfolioSlug={portfolio.slug}
            craftStateJson={craftStateJson}
            updatedAt={portfolio.updated_at}
            isPremium={isPremium}
            username={profile?.username ?? 'user'}
            initialTheme={initialTheme}
        />
    );
}
