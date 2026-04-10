import { api, getMe, resolveIsPremium } from "@/lib/api-server";
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { StaticPortfolioRenderer } from '@/components/portfolio/static-renderer';
import { DEFAULT_THEME, getGoogleFontsUrl } from '@/lib/themes';
import { themeToCssVars } from '@/types/theme';
import type { PortfolioTheme } from '@/types/theme';
import type { Metadata } from 'next';

interface Props { params: Promise<{ portfolioId: string }> }

export const metadata: Metadata = { title: 'Preview', robots: { index: false, follow: false } };

export default async function PreviewPage({ params }: Props) {
    const { portfolioId } = await params;

    const [result, meData] = await Promise.all([
        api.get<{ data: { id: string; craft_state: unknown; user_id: string; status: string; theme: unknown } }>(`/v1/portfolios/${portfolioId}`).catch(() => null),
        getMe().catch(() => null),
    ]);
    if (!result?.data) notFound();

    const portfolio = result.data;
    if (!portfolio.craft_state) redirect(`/builder/${portfolioId}`);

    const isPremium = meData?.user?.profile ? resolveIsPremium(meData.user.profile) : false;

    const craftJson = typeof portfolio.craft_state === 'string'
        ? portfolio.craft_state
        : JSON.stringify(portfolio.craft_state);

    const portfolioTheme: PortfolioTheme = (() => {
        if (!portfolio.theme || portfolio.theme === 'default') return DEFAULT_THEME;
        if (typeof portfolio.theme !== 'string') return portfolio.theme as unknown as PortfolioTheme;
        try { return JSON.parse(portfolio.theme) as PortfolioTheme; } catch { return DEFAULT_THEME; }
    })();
    const themeCssVars = themeToCssVars(portfolioTheme);
    const fontsUrl = getGoogleFontsUrl(portfolioTheme);

    return (
        <div className="flex min-h-screen flex-col bg-zinc-900">
            <div className="flex h-10 shrink-0 items-center justify-center gap-4 border-b border-dashed border-zinc-800 bg-zinc-950">
                <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest">PREVIEW MODE</span>
                <a href={`/builder/${portfolioId}`} className="text-xs text-zinc-500 hover:text-white transition-colors">
                    <ArrowLeft className="inline h-3 w-3" /> Retour au builder
                </a>
            </div>
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
                                <a href="https://creafolio.fr" className="text-sky-400/60 hover:text-sky-400 transition-colors">Creafolio</a>
                            </span>
                        </div>
                    )}
                    <StaticPortfolioRenderer craftStateJson={craftJson} />
                </div>
            </div>
        </div>
    );
}
