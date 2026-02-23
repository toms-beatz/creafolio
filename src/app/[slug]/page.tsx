import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StaticPortfolioRenderer } from '@/components/portfolio/static-renderer';
import { AnalyticsTracker } from '@/components/analytics/analytics-tracker';
import { ReportButton } from '@/components/portfolio/report-modal';
import { DEFAULT_THEME, getGoogleFontsUrl } from '@/lib/themes';
import { themeToCssVars } from '@/types/theme';
import type { PortfolioTheme } from '@/types/theme';
import type { Metadata } from 'next';

/* ── ISR : revalidate toutes les 60 secondes ─────────────── */
export const revalidate = 60;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://blooprint.fr';

interface Props {
    params: Promise<{ slug: string }>;
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
 * Route publique blooprint.fr/[slug]
 * Rendu statique (pas de Craft.js) du portfolio publié.
 * Accessible sans auth.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: portfolio } = await supabase
        .from('portfolios')
        .select('title, slug, craft_state, user_id, status')
        .eq('slug', slug)
        .is('deleted_at', null)
        .single();

    if (!portfolio) return { title: 'Portfolio introuvable' };

    const isPublished = portfolio.status === 'published';

    // Récupérer le username du créateur
    const { data: profile } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('id', portfolio.user_id)
        .single();

    const creatorName = profile?.username ?? portfolio.title;
    const title = `${creatorName} — Créateur UGC | Blooprint`;
    const bio = extractBioFromCraft(portfolio.craft_state);
    const description = bio
        ? bio.slice(0, 160)
        : `Découvrez le portfolio UGC de ${creatorName} sur Blooprint.`;
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
            siteName: 'Blooprint',
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
    const supabase = await createClient();

    // Fetch portfolio publié (RLS policy "select published" autorise sans auth)
    const { data: portfolio } = await supabase
        .from('portfolios')
        .select('id, title, slug, craft_state, user_id, theme')
        .eq('slug', slug)
        .eq('status', 'published')
        .is('deleted_at', null)
        .single();

    if (!portfolio || !portfolio.craft_state) notFound();

    // Vérifier si l'user est premium (watermark ou pas)
    const { data: profile } = await supabase
        .from('profiles')
        .select('plan, trial_ends_at, username')
        .eq('id', portfolio.user_id)
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

    // Résoudre le thème — EPIC 15
    const portfolioTheme: PortfolioTheme = portfolio.theme
        ? (typeof portfolio.theme === 'string'
            ? JSON.parse(portfolio.theme) as PortfolioTheme
            : portfolio.theme as unknown as PortfolioTheme)
        : DEFAULT_THEME;
    const themeCssVars = themeToCssVars(portfolioTheme);
    const fontsUrl = getGoogleFontsUrl(portfolioTheme);

    // Schema.org JSON-LD — US-705
    const creatorName = profile?.username ?? portfolio.title;
    const bio = extractBioFromCraft(portfolio.craft_state);
    const socialLinks = extractSocialLinksFromCraft(portfolio.craft_state);
    const canonicalUrl = `${APP_URL}/${portfolio.slug}`;

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
        <main className="min-h-screen" style={{ ...themeCssVars, background: 'var(--theme-bg, #030712)', fontFamily: 'var(--theme-font-body, inherit)' } as React.CSSProperties}>
            {/* Google Fonts — EPIC 15 */}
            {fontsUrl && (
                <link rel="stylesheet" href={fontsUrl} />
            )}
            {/* Schema.org — US-705 */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
            />
            {/* Watermark Free — US-206 CA-4 */}
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

            <div className="mx-auto max-w-2xl px-4 py-8">
                <StaticPortfolioRenderer craftStateJson={craftJson} />
            </div>

            {/* Signaler — US-807 (floating bottom-right) */}
            <ReportButton portfolioId={portfolio.id} />

            {/* US-601 — tracking asynchrone, ne bloque pas le LCP */}
            <AnalyticsTracker portfolioId={portfolio.id} />
        </main>
    );
}
