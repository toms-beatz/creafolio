import { notFound } from 'next/navigation';
import { api } from '@/lib/api-server';
import { StaticPortfolioRenderer } from '@/components/portfolio/static-renderer';
import { AnalyticsTracker } from '@/components/analytics/analytics-tracker';
import { ReportButton } from '@/components/portfolio/report-modal';
import { DEFAULT_THEME, getGoogleFontsUrl, COLOR_VARIANTS } from '@/lib/themes';
import { themeToModeStyleTag } from '@/types/theme';
import type { PortfolioTheme } from '@/types/theme';
import { ColorModeToggle } from '@/components/portfolio/color-mode-toggle';
import type { Metadata } from 'next';

/* ── ISR : revalidate toutes les 60 secondes ─────────────── */
export const revalidate = 60;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://creafolio.fr';

interface Props {
    params: Promise<{ slug: string }>;
}

interface PublicPortfolio {
    id: number;
    title: string;
    slug: string;
    craft_state: unknown;
    theme: unknown;
    status: string;
    published_at?: string;
    user?: {
        username?: string;
        display_name?: string;
        plan?: string;
        trial_ends_at?: string;
    };
}

/* ── Helpers pour extraire les infos du craft_state ──────── */
function extractBioFromCraft(craft: unknown): string | null {
    try {
        const data = typeof craft === 'string' ? JSON.parse(craft) : craft;
        const nodes = data?.nodes ?? data;
        for (const key of Object.keys(nodes)) {
            const node = nodes[key];
            if (node?.type?.resolvedName === 'BioBlock' || node?.displayName === 'BioBlock') {
                return node.props?.bio ?? node.props?.text ?? null;
            }
        }
    } catch { /* ignore */ }
    return null;
}

function extractSocialLinksFromCraft(craft: unknown): { platform: string; url: string }[] {
    const links: { platform: string; url: string }[] = [];
    try {
        const data = typeof craft === 'string' ? JSON.parse(craft) : craft;
        const nodes = data?.nodes ?? data;
        for (const key of Object.keys(nodes)) {
            const node = nodes[key];
            if (node?.type?.resolvedName === 'SocialLinksBlock' || node?.displayName === 'SocialLinksBlock') {
                const socialLinks = node.props?.links ?? [];
                for (const link of socialLinks) {
                    if (link.url) links.push({ platform: link.platform ?? 'other', url: link.url });
                }
            }
        }
    } catch { /* ignore */ }
    return links;
}

/**
 * Route publique creafolio.fr/[slug]
 * Rendu statique (pas de Craft.js) du portfolio publié.
 * Accessible sans auth.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    let portfolio: PublicPortfolio | null = null;
    try {
        const data = await api.get<{ data: PublicPortfolio }>(`/portfolios/by-slug/${slug}`);
        portfolio = data.data;
    } catch {
        return { title: 'Portfolio introuvable' };
    }

    if (!portfolio) return { title: 'Portfolio introuvable' };
    const isPublished = portfolio.status === 'published';

    const creatorName = portfolio.user?.username ?? portfolio.title;
    const title = `${creatorName} — Créateur UGC | Creafolio`;
    const bio = extractBioFromCraft(portfolio.craft_state);
    const description = bio
        ? bio.slice(0, 160)
        : `Découvrez le portfolio UGC de ${creatorName} sur Creafolio.`;
    const canonicalUrl = `${APP_URL}/${portfolio.slug}`;

    return {
        title,
        description,
        alternates: { canonical: canonicalUrl },
        robots: isPublished
            ? { index: true, follow: true }
            : { index: false, follow: false },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: 'Creafolio',
            type: 'profile',
            locale: 'fr_FR',
            images: [{
                url: `${APP_URL}/images/og-default.png`,
                width: 1200,
                height: 630,
                alt: `Portfolio UGC de ${creatorName}`,
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`${APP_URL}/images/og-default.png`],
        },
    };
}

export default async function PublicPortfolioPage({ params }: Props) {
    const { slug } = await params;

    let portfolioData: PublicPortfolio | null = null;
    try {
        const res = await api.get<{ data: PublicPortfolio }>(`/portfolios/by-slug/${slug}`);
        portfolioData = res.data;
    } catch {
        notFound();
    }

    if (!portfolioData || !portfolioData.craft_state) notFound();

    const profile = portfolioData.user;
    const isPremium =
        profile?.plan === 'premium' ||
        (profile?.plan === 'trial' &&
            !!profile.trial_ends_at &&
            new Date(profile.trial_ends_at) > new Date());

    // Normaliser : Supabase peut retourner un objet ou une string
    const craftJson = typeof portfolioData!.craft_state === 'string'
        ? portfolioData!.craft_state
        : JSON.stringify(portfolioData!.craft_state);

    // Résoudre le thème — EPIC 15
    const portfolioTheme: PortfolioTheme = (() => {
        if (!portfolioData!.theme || portfolioData!.theme === 'default') return DEFAULT_THEME;
        if (typeof portfolioData!.theme !== 'string') return portfolioData!.theme as unknown as PortfolioTheme;
        try { return JSON.parse(portfolioData!.theme) as PortfolioTheme; } catch { return DEFAULT_THEME; }
    })();

    // Enrichir avec les variantes de couleurs si l'utilisateur n'a pas encore sauvegardé les siennes
    const variant = COLOR_VARIANTS[portfolioTheme.id];
    const resolvedTheme: PortfolioTheme = {
        ...portfolioTheme,
        darkColors: portfolioTheme.darkColors ?? variant?.dark,
        lightColors: portfolioTheme.lightColors ?? variant?.light,
    };

    const themeModeCSS = themeToModeStyleTag(resolvedTheme);
    const fontsUrl = getGoogleFontsUrl(resolvedTheme);
    // Toggle visible si une variante claire existe
    const hasLightMode = !!(resolvedTheme.lightColors);

    // Schema.org JSON-LD — US-705
    const creatorName = profile?.username ?? portfolioData!.title;
    const bio = extractBioFromCraft(portfolioData!.craft_state);
    const socialLinks = extractSocialLinksFromCraft(portfolioData!.craft_state);
    const canonicalUrl = `${APP_URL}/${portfolioData!.slug}`;

    const schemaOrg = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: creatorName,
        url: canonicalUrl,
        ...(bio ? { description: bio.slice(0, 300) } : {}),
        image: `${APP_URL}/images/og-default.png`,
        ...(socialLinks.length > 0
            ? { sameAs: socialLinks.map((l) => l.url) }
            : {}),
    };

    return (
        <main className="min-h-screen" style={{ background: 'var(--theme-bg, #030712)', fontFamily: 'var(--theme-font-body, inherit)' } as React.CSSProperties}>
            {/* Theme CSS vars — both dark + light modes */}
            <style dangerouslySetInnerHTML={{ __html: themeModeCSS }} />
            {/* Google Fonts — EPIC 15 */}
            {fontsUrl && (
                <link rel="stylesheet" href={fontsUrl} />
            )}
            {/* Schema.org — US-705 */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
            />
            {/* Dark/light toggle — top-right, visible uniquement si lightColors défini */}
            <ColorModeToggle hasLight={hasLightMode} />

            <div className="w-full">
                <StaticPortfolioRenderer craftStateJson={craftJson} />
            </div>

            {/* Watermark + Signaler — bottom-right cluster */}
            <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
                {!isPremium && (
                    <a
                        href="https://creafolio.fr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-dashed border-zinc-800 bg-zinc-950/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-zinc-600 backdrop-blur-sm transition-colors hover:border-zinc-600 hover:text-zinc-400"
                    >
                        Creafolio
                    </a>
                )}
                <ReportButton portfolioId={String(portfolioData!.id)} />
            </div>

            {/* US-601 — tracking asynchrone, ne bloque pas le LCP */}
            <AnalyticsTracker portfolioId={String(portfolioData!.id)} />
        </main>
    );
}
