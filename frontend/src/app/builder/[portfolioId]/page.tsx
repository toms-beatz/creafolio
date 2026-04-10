import { redirect, notFound } from 'next/navigation';
import { getMe, resolveIsPremium } from '@/lib/api-server';
import { getPortfolio } from '@/features/builder/actions';
import { FormEditorDynamic } from '@/components/builder/form-editor-dynamic';
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

    let userData;
    let portfolio;
    try {
        [userData, portfolio] = await Promise.all([
            getMe(),
            getPortfolio(portfolioId),
        ]);
    } catch {
        redirect('/login');
    }
    const profile = userData.user?.profile;

    if (!portfolio) notFound();

    const isPremium = profile ? resolveIsPremium(profile) : false;

    // Normaliser craft_state : Supabase peut retourner un objet ou une string
    // (si l'autosave avait stocké une string JSON avant le fix).
    let craftStateJson: string | null = null;
    if (portfolio.craft_state) {
        craftStateJson = typeof portfolio.craft_state === 'string'
            ? portfolio.craft_state
            : JSON.stringify(portfolio.craft_state);
    }

    // Normaliser theme — guard against non-JSON strings like 'default'
    let initialTheme = null;
    const rawTheme = portfolio.theme as unknown;
    if (rawTheme && rawTheme !== 'default') {
        try {
            initialTheme = typeof rawTheme === 'string'
                ? JSON.parse(rawTheme)
                : rawTheme;
        } catch {
            initialTheme = null;
        }
    }

    return (
        <FormEditorDynamic
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
