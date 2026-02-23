import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StaticPortfolioRenderer } from '@/components/portfolio/static-renderer';
import { DEFAULT_THEME, getGoogleFontsUrl } from '@/lib/themes';
import { themeToCssVars } from '@/types/theme';
import type { PortfolioTheme } from '@/types/theme';
import type { Metadata } from 'next';

interface Props {
    params: Promise<{ portfolioId: string }>;
}

export const metadata: Metadata = {
    title: 'Preview',
    robots: { index: false, follow: false },
};

/**
 * Page de preview builder — rendu statique (pas de Craft.js).
 * US-206
 */
export default async function PreviewPage({ params }: Props) {
    const { portfolioId } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: portfolio } = await supabase
        .from('portfolios')
        .select('id, craft_state, user_id, status, theme')
        .eq('id', portfolioId)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single();

    if (!portfolio) notFound();
    if (!portfolio.craft_state) {
        redirect(`/builder/${portfolioId}`);
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('plan, trial_ends_at')
        .eq('id', user.id)
        .single();

    const isPremium =
        profile?.plan === 'premium' ||
        (profile?.plan === 'trial' &&
            !!profile.trial_ends_at &&
            new Date(profile.trial_ends_at) > new Date());

    // Normaliser : Supabase peut retourner un objet ou une string
    const craftJson = typeof portfolio.craft_state === 'string'
        ? portfolio.craft_state
        : JSON.stringify(portfolio.craft_state);

    // Thème — EPIC 15
    const portfolioTheme: PortfolioTheme = portfolio.theme
        ? (typeof portfolio.theme === 'string'
            ? JSON.parse(portfolio.theme) as PortfolioTheme
            : portfolio.theme as unknown as PortfolioTheme)
        : DEFAULT_THEME;
    const themeCssVars = themeToCssVars(portfolioTheme);
    const fontsUrl = getGoogleFontsUrl(portfolioTheme);

    return (
        <div className="flex min-h-screen flex-col bg-zinc-900">
            {/* Toolbar preview */}
            <div className="flex h-10 shrink-0 items-center justify-center gap-4 border-b border-dashed border-zinc-800 bg-zinc-950">
                <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest">
                    PREVIEW MODE
                </span>
                <a
                    href={`/builder/${portfolioId}`}
                    className="text-xs text-zinc-500 hover:text-white transition-colors"
                >
                    <ArrowLeft className="inline h-3 w-3" /> Retour au builder
                </a>
            </div>

            {/* Rendu statique centré avec theme */}
            <div className="flex flex-1 justify-center overflow-auto bg-zinc-800/60 py-6 px-4">
                <div
                    className="w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl"
                    style={{ ...themeCssVars, background: 'var(--theme-bg, #030712)', fontFamily: 'var(--theme-font-body, inherit)' } as React.CSSProperties}
                >
                    {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
                    {!isPremium && (
                        <div className="sticky top-0 z-50 w-full border-b border-dashed border-zinc-800 bg-zinc-950/80 py-1.5 text-center backdrop-blur-sm">
                            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                Built with{' '}
                                <a href="https://blooprint.fr" className="text-sky-400/60 hover:text-sky-400 transition-colors">
                                    Blooprint
                                </a>
                            </span>
                        </div>
                    )}
                    <StaticPortfolioRenderer craftStateJson={craftJson} />
                </div>
            </div>
        </div>
    );
}