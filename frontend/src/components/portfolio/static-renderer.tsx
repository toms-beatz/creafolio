'use client';

import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Music2, Play, Camera } from 'lucide-react';
import type { ReactNode } from 'react';
import { ViewportCtx, useViewport } from './viewport-context';
import { SPACING_PX, RADIUS_PX } from '@/lib/block-styles';

/* ── Helper props avancés (shared) ───────────────────────── */
interface AdvancedProps {
    paddingTop?: string;
    paddingBottom?: string;
    paddingTopMobile?: string;
    paddingBottomMobile?: string;
    paddingTopTablet?: string;
    paddingBottomTablet?: string;
    bgColor?: string;
    bgColorMobile?: string;
    bgColorTablet?: string;
    borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
    borderColor?: string;
    borderWidth?: string;
    textSize?: string; // 'sm'|'base'|'lg'|'xl'
    customId?: string;
    customClass?: string;
    hideOnMobile?: boolean;
    hideOnDesktop?: boolean;
    animateIn?: string;
}

const FONT_SIZE_PX: Record<string, string> = { sm: '14px', base: '16px', lg: '18px', xl: '20px' };

function advancedStyle(p: AdvancedProps, viewport?: 'desktop' | 'tablet' | 'mobile'): React.CSSProperties {
    const pt = (viewport === 'mobile' && p.paddingTopMobile)
        ? SPACING_PX[p.paddingTopMobile]
        : (viewport === 'tablet' && p.paddingTopTablet)
            ? SPACING_PX[p.paddingTopTablet]
            : SPACING_PX[p.paddingTop ?? ''];
    const pb = (viewport === 'mobile' && p.paddingBottomMobile)
        ? SPACING_PX[p.paddingBottomMobile]
        : (viewport === 'tablet' && p.paddingBottomTablet)
            ? SPACING_PX[p.paddingBottomTablet]
            : SPACING_PX[p.paddingBottom ?? ''];
    const bg = (viewport === 'mobile' && p.bgColorMobile)
        ? p.bgColorMobile
        : (viewport === 'tablet' && p.bgColorTablet)
            ? p.bgColorTablet
            : p.bgColor || undefined;

    const borderProps: React.CSSProperties = {};
    if (p.borderStyle === 'none') {
        borderProps.border = 'none';
    } else if (p.borderStyle) {
        borderProps.border = `${p.borderWidth ?? '1px'} ${p.borderStyle} ${p.borderColor ?? 'var(--theme-border, #27272a)'}`;
    }

    return {
        paddingTop: pt ?? 'var(--theme-section-spacing, 2.5rem)',
        paddingBottom: pb ?? 'var(--theme-section-spacing, 2.5rem)',
        background: bg,
        fontSize: p.textSize ? FONT_SIZE_PX[p.textSize] : undefined,
        ...borderProps,
    };
}
function advancedCls(p: AdvancedProps, base: string): string {
    const anim = p.animateIn && p.animateIn !== 'none' ? `bp-animate-${p.animateIn}` : '';
    return [base, p.hideOnMobile ? 'hidden md:block' : '', p.hideOnDesktop ? 'md:hidden' : '', p.customClass ?? '', anim].filter(Boolean).join(' ');
}

/** Hook: retourne style + viewport courant — à utiliser dans les blocs client */
function useAdvancedStyle(p: AdvancedProps, ptDefault?: string, pbDefault?: string): React.CSSProperties {
    const viewport = useViewport();
    return advancedStyle(
        { ...p, paddingTop: p.paddingTop ?? ptDefault, paddingBottom: p.paddingBottom ?? pbDefault },
        viewport,
    );
}

/* ── Types pour le JSON sérialisé Craft.js ─────────────────── */
export interface CraftNode {
    type: { resolvedName: string } | string;
    isCanvas?: boolean;
    props: Record<string, unknown>;
    displayName?: string;
    custom?: Record<string, unknown>;
    parent?: string;
    nodes: string[];
    linkedNodes?: Record<string, string>;
}

export type CraftNodes = Record<string, CraftNode>;

/* ── Parseur Craft.js JSON → arbre de composants ──────────── */
export function parseCraftState(json: string): CraftNodes | null {
    try {
        let parsed = JSON.parse(json) as unknown;
        // Protection double-encodage : si le résultat est encore une string, re-parser
        if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed) as unknown;
        }
        const nodes = parsed as CraftNodes;
        if (!nodes || typeof nodes !== 'object' || !nodes.ROOT) return null;
        return nodes;
    } catch {
        return null;
    }
}

/* ── Rendu statique d'un nœud + ses enfants ───────────────── */
function StaticNode({ nodeId, nodes }: { nodeId: string; nodes: CraftNodes }) {
    const node = nodes[nodeId];
    if (!node) return null;

    // Anchor for builder scroll-to-section
    const isRootChild = (nodes.ROOT?.nodes ?? []).includes(nodeId);
    const anchor = isRootChild
        ? <span id={nodeId} aria-hidden="true" style={{ display: 'block', height: 0, overflow: 'hidden' }} />
        : null;

    const children = node.nodes.map((childId) => (
        <StaticNode key={childId} nodeId={childId} nodes={nodes} />
    ));

    const resolvedName = typeof node.type === 'string' ? node.type : node.type?.resolvedName;

    // Nœud natif HTML (div, span, etc.)
    if (!resolvedName || resolvedName === 'div') {
        const { className, ...rest } = (node.props || {}) as { className?: string;[k: string]: unknown };
        // Strip legacy centering classes baked into older Craft.js states
        const cleanedClass = className
            ? (className.replace(/\bmax-w-\S+\b/g, '').replace(/\bmx-auto\b/g, '').replace(/\bp-4\b/g, '').trim() + ' px-4 md:px-24 md:pt-16').trim()
            : 'px-4 md:px-8';
        return (
            <>
                {anchor}
                <div className={cleanedClass} {...filterHtmlProps(rest)}>
                    {children}
                </div>
            </>
        );
    }

    // Dispatch vers les renderers statiques
    const Renderer = STATIC_RENDERERS[resolvedName];
    if (!Renderer) {
        console.warn(`[static-render] Unknown component: ${resolvedName}`);
        return null;
    }

    return (
        <>
            {anchor}
            <Renderer {...(node.props as Record<string, unknown>)}>{children}</Renderer>
        </>
    );
}

/* ── Composant principal — point d'entrée ─────────────────── */
interface StaticPortfolioRendererProps {
    craftStateJson: string;
    /** En mode preview (template picker), pas de min-h-screen */
    compact?: boolean;
    /** Viewport actif dans le builder — contrôle le rendu viewport-aware */
    viewport?: 'desktop' | 'tablet' | 'mobile';
}

export function StaticPortfolioRenderer({ craftStateJson, compact, viewport = 'desktop' }: StaticPortfolioRendererProps) {
    const nodes = parseCraftState(craftStateJson);
    if (!nodes) {
        return (
            <div className={`flex items-center justify-center bg-zinc-950 ${compact ? 'py-8' : 'min-h-screen'}`}>
                <p className="text-sm text-zinc-600 font-mono">Aucun contenu à afficher.</p>
            </div>
        );
    }

    return (
        <ViewportCtx.Provider value={viewport}>
            <div
                className={compact ? '' : 'min-h-screen'}
                style={{
                    background: 'var(--theme-bg, #030712)',
                    fontFamily: 'var(--theme-font-body, system-ui, sans-serif)',
                }}
            >
                <StaticNode nodeId="ROOT" nodes={nodes} />
            </div>
        </ViewportCtx.Provider>
    );
}

/* ── Renderers statiques (pas de Craft.js, pas de useNode) ── */

function StaticHeroBlock({
    name = 'Ton Nom',
    title = 'Créateur UGC',
    description = 'Je crée du contenu authentique pour des marques ambitieuses. TikTok · Instagram · YouTube.',
    ctaLabel = 'Voir mes projets',
    ctaHref = '#gallery',
    imageUrl,
    textAlign = 'center',
    avatarShape = 'circle',
    avatarSize = 'md',
    ctaBg = '',
    ctaTextColor = '',
    ctaRadius = 'md',
    ...adv
}: {
    name?: string;
    title?: string;
    description?: string;
    ctaLabel?: string;
    ctaHref?: string;
    imageUrl?: string;
    textAlign?: string;
    avatarShape?: string;
    avatarSize?: string;
    ctaBg?: string;
    ctaTextColor?: string;
    ctaRadius?: string;
} & AdvancedProps) {
    const sizeCls = { sm: 'w-16 h-16', md: 'w-24 h-24', lg: 'w-32 h-32', xl: 'w-40 h-40' }[avatarSize] ?? 'w-24 h-24';
    const radiusCls = avatarShape === 'square' ? 'rounded-lg' : avatarShape === 'rounded' ? 'rounded-2xl' : 'rounded-full';
    const alignCls = { left: 'items-start text-left', center: 'items-center text-center', right: 'items-end text-right' }[textAlign] ?? 'items-center text-center';
    const sectionStyle = useAdvancedStyle(adv, 'lg', 'lg');
    return (
        <section
            id={adv.customId || undefined}
            className={advancedCls(adv, `relative flex flex-col gap-6 px-6 rounded-xl ${alignCls}`)}
            style={sectionStyle}
        >
            <div className={`${sizeCls} ${radiusCls} overflow-hidden border-2 border-dashed border-zinc-600`}>
                {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <ImagePlaceholder label="Photo" className="w-full h-full" />
                )}
            </div>
            <div>
                <h1 style={{ color: 'var(--theme-heading, var(--theme-text, #f4f4f5))', fontFamily: 'var(--theme-font-heading)', fontWeight: 'var(--theme-heading-weight)' as React.CSSProperties['fontWeight'], letterSpacing: 'var(--theme-heading-tracking)', textTransform: 'var(--theme-heading-transform)' as React.CSSProperties['textTransform'] }}>{name}</h1>
                <p className="mt-1 font-medium" style={{ color: 'var(--theme-primary, #22d3ee)' }}>{title}</p>
            </div>
            <p className="max-w-md text-sm leading-relaxed" style={{ color: 'var(--theme-text-muted, #a1a1aa)' }}>{description}</p>
            <a
                href={ctaHref}
                className="inline-flex items-center px-5 py-2.5 text-sm font-semibold transition-colors"
                style={{
                    background: ctaBg || 'var(--theme-primary, #22d3ee)',
                    color: ctaTextColor || 'var(--theme-bg, #030712)',
                    borderRadius: RADIUS_PX[ctaRadius] ?? 'var(--theme-radius, 12px)',
                }}
            >
                {ctaLabel}
            </a>
        </section>
    );
}

function StaticAboutBlock({
    heading = 'À propos',
    bio = 'Créateur UGC passionné, je collabore avec des marques pour créer du contenu vidéo authentique qui convertit.',
    niches = ['Beauté', 'Lifestyle', 'Food', 'Tech'],
    textAlign = 'left',
    tagStyle = 'outline',
    ...adv
}: {
    heading?: string;
    bio?: string;
    niches?: string[];
    textAlign?: string;
    tagStyle?: string;
} & AdvancedProps) {
    const alignCls = { left: 'text-left', center: 'text-center', right: 'text-right' }[textAlign] ?? 'text-left';
    const sectionStyle = useAdvancedStyle(adv, 'md', 'md');
    const tagCls = tagStyle === 'filled'
        ? 'rounded-full px-3 py-1 text-xs font-medium'
        : tagStyle === 'subtle'
            ? 'rounded-full px-3 py-1 text-xs font-medium'
            : 'rounded-full border border-dashed px-3 py-1 text-xs';
    const tagStyle_ = tagStyle === 'filled'
        ? { background: 'var(--theme-primary, #22d3ee)', color: 'var(--theme-bg, #030712)' }
        : tagStyle === 'subtle'
            ? { background: 'var(--theme-primary-15, rgba(34,211,238,.15))', color: 'var(--theme-primary, #22d3ee)' }
            : { color: 'var(--theme-primary, #22d3ee)', borderColor: 'var(--theme-primary, #22d3ee)' };
    return (
        <section
            id={adv.customId || undefined}
            className={advancedCls(adv, `px-6 rounded-xl ${alignCls}`)}
            style={sectionStyle}
        >
            <h2 className="text-xl mb-4" style={{ color: 'var(--theme-heading, var(--theme-text, #f4f4f5))', fontFamily: 'var(--theme-font-heading)', fontWeight: 'var(--theme-heading-weight)' as React.CSSProperties['fontWeight'], letterSpacing: 'var(--theme-heading-tracking)', textTransform: 'var(--theme-heading-transform)' as React.CSSProperties['textTransform'] }}>{heading}</h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--theme-text-muted, #a1a1aa)' }}>{bio}</p>
            <div className="flex flex-wrap gap-2">
                {(niches ?? []).map((niche) => (
                    <span key={niche} className={tagCls} style={tagStyle_}>{niche}</span>
                ))}
            </div>
        </section>
    );
}

function StaticStatsBlock({
    title = 'Mes chiffres',
    stats = [
        { value: '50+', label: 'Projets UGC' },
        { value: '2M+', label: 'Vues générées' },
        { value: '30+', label: 'Marques' },
    ],
    statColor = '',
    statsColumns = 3,
    ...adv
}: {
    title?: string;
    stats?: { value: string; label: string }[];
    statColor?: string;
    statsColumns?: number;
} & AdvancedProps) {
    const cols = statsColumns === 2 ? 'grid-cols-2' : statsColumns === 4 ? 'grid-cols-4' : 'grid-cols-3';
    const sectionStyle = useAdvancedStyle(adv, 'md', 'md');
    return (
        <section
            id={adv.customId || undefined}
            className={advancedCls(adv, 'rounded-xl border border-dashed border-zinc-800 px-6')}
            style={sectionStyle}
        >
            {title && <h2 className="mb-6 text-center font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--theme-text-muted, #a1a1aa)' }}>{title}</h2>}
            <div className={`grid ${cols} gap-4 text-center`}>
                {(stats ?? []).map((stat, i) => (
                    <div key={i}>
                        <p className="text-2xl font-bold" style={{ color: statColor || 'var(--theme-text, #f4f4f5)' }}>{stat.value}</p>
                        <p className="mt-1 text-xs" style={{ color: 'var(--theme-text-muted, #a1a1aa)' }}>{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function StaticGalleryBlock({
    heading = 'Mes projets',
    items = [{ caption: 'Projet 1' }, { caption: 'Projet 2' }, { caption: 'Projet 3' }],
    columns = 3,
    columnsMobile = 1,
    columnsTablet,
    columnsDesktop,
    cardRadius = 'md',
    aspectRatio = 'video',
    ...adv
}: {
    heading?: string;
    items?: { imageUrl?: string; caption?: string; link?: string }[];
    columns?: 2 | 3;
    columnsMobile?: 1 | 2;
    columnsTablet?: 2 | 3;
    columnsDesktop?: 2 | 3;
    cardRadius?: string;
    aspectRatio?: string;
} & AdvancedProps) {
    const viewport = useViewport();
    const effectiveCols: number =
        viewport === 'mobile' ? (columnsMobile ?? 1) :
            viewport === 'tablet' ? (columnsTablet ?? columns) :
                (columnsDesktop ?? columns);
    const cardBorderRadius = RADIUS_PX[cardRadius] ?? 'var(--theme-radius, 12px)';
    const aspectCls = aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-video';
    const colsClass = effectiveCols === 1 ? 'grid-cols-1' : effectiveCols === 2 ? 'grid-cols-2' : 'grid-cols-3';
    const sectionStyle = useAdvancedStyle(adv, 'md', 'md');
    return (
        <section
            id={adv.customId || undefined}
            className={advancedCls(adv, 'px-6 rounded-xl')}
            style={sectionStyle}
        >
            {heading && <h2 className="text-xl mb-6" style={{ color: 'var(--theme-heading, var(--theme-text, #f4f4f5))', fontFamily: 'var(--theme-font-heading)', fontWeight: 'var(--theme-heading-weight)' as React.CSSProperties['fontWeight'], letterSpacing: 'var(--theme-heading-tracking)', textTransform: 'var(--theme-heading-transform)' as React.CSSProperties['textTransform'] }}>{heading}</h2>}
            <div className={`grid gap-3 ${colsClass}`}>
                {(items ?? []).map((item, i) => (
                    <div key={i} className={`group relative ${aspectCls} overflow-hidden border border-dashed border-zinc-700 bg-zinc-900`} style={{ borderRadius: cardBorderRadius }}>
                        {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageUrl} alt={item.caption ?? ''} className="w-full h-full object-cover" />
                        ) : (
                            <ImagePlaceholder className="w-full h-full" />
                        )}
                        {item.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs text-white truncate">{item.caption}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

function StaticContactBlock({
    heading = 'Travaillons ensemble',
    description = 'Tu cherches un créateur UGC pour ta prochaine campagne ? Écris-moi.',
    email = 'ton@email.com',
    ctaLabel = 'Envoie-moi un message',
    socials = [],
    ctaBg = '',
    ctaTextColor = '',
    ctaRadius = 'md',
    ...adv
}: {
    heading?: string;
    description?: string;
    email?: string;
    ctaLabel?: string;
    socials?: { platform: string; url: string }[];
    ctaBg?: string;
    ctaTextColor?: string;
    ctaRadius?: string;
} & AdvancedProps) {
    const sectionStyle = useAdvancedStyle(adv, 'md', 'md');
    return (
        <section
            id={adv.customId || undefined}
            className={advancedCls(adv, 'flex flex-col items-center gap-4 rounded-xl border border-dashed border-zinc-800 px-6 text-center')}
            style={sectionStyle}
        >
            <h2 className="text-xl" style={{ color: 'var(--theme-heading, var(--theme-text, #f4f4f5))', fontFamily: 'var(--theme-font-heading)', fontWeight: 'var(--theme-heading-weight)' as React.CSSProperties['fontWeight'], letterSpacing: 'var(--theme-heading-tracking)', textTransform: 'var(--theme-heading-transform)' as React.CSSProperties['textTransform'] }}>{heading}</h2>
            <p className="max-w-md text-sm leading-relaxed" style={{ color: 'var(--theme-text-muted, #a1a1aa)' }}>{description}</p>
            <a
                href={`mailto:${email}`}
                className="px-5 py-2.5 text-sm font-semibold transition-colors"
                style={{
                    background: ctaBg || 'var(--theme-primary, #22d3ee)',
                    color: ctaTextColor || 'var(--theme-bg, #030712)',
                    borderRadius: RADIUS_PX[ctaRadius] ?? 'var(--theme-radius, 12px)',
                }}
            >
                {ctaLabel}
            </a>
            {socials && socials.length > 0 && (
                <div className="mt-3 flex gap-4">
                    {socials.map((s) => (
                        <a
                            key={s.platform}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium uppercase tracking-wide text-zinc-500 hover:text-sky-400 transition-colors"
                        >
                            {s.platform}
                        </a>
                    ))}
                </div>
            )}
        </section>
    );
}

const fontSizeMap: Record<string, string> = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
};

const alignMap: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
};

function StaticTextBlock({
    text = 'Clique pour éditer ce texte.',
    fontSize = 'base',
    align = 'left',
    color = '#ffffff',
    ...adv
}: {
    text?: string;
    fontSize?: string;
    align?: string;
    color?: string;
} & AdvancedProps) {
    return (
        <div
            id={adv.customId || undefined}
            className={advancedCls(adv, `px-6 ${fontSizeMap[fontSize ?? 'base'] ?? 'text-base'} ${alignMap[align ?? 'left'] ?? 'text-left'}`)}
            style={{
                color,
                paddingTop: SPACING_PX[adv.paddingTop ?? ''] ?? '16px',
                paddingBottom: SPACING_PX[adv.paddingBottom ?? ''] ?? '16px',
                background: adv.bgColor || undefined,
            }}
        >
            {text}
        </div>
    );
}

/* ── Before/After statique ─────────────────────────────────── */
function StaticBeforeAfterBlock({
    heading = 'Résultats',
    beforeLabel = 'Avant',
    afterLabel = 'Après ma vidéo',
    beforeImage,
    afterImage,
    description = 'Une vidéo UGC qui a boosté les ventes de +340%.',
    metric = '+340%',
    metricColor = '',
    ...adv
}: {
    heading?: string;
    beforeLabel?: string;
    afterLabel?: string;
    beforeImage?: string;
    afterImage?: string;
    description?: string;
    metric?: string;
    metricColor?: string;
} & AdvancedProps) {
    const sectionStyle = useAdvancedStyle(adv, 'md', 'md');
    return (
        <section
            id={adv.customId || undefined}
            className={advancedCls(adv, 'px-6 rounded-xl')}
            style={sectionStyle}
        >
            {heading && <h2 className="text-xl mb-6" style={{ color: 'var(--theme-heading, var(--theme-text, #f4f4f5))', fontFamily: 'var(--theme-font-heading)', fontWeight: 'var(--theme-heading-weight)' as React.CSSProperties['fontWeight'], letterSpacing: 'var(--theme-heading-tracking)', textTransform: 'var(--theme-heading-transform)' as React.CSSProperties['textTransform'] }}>{heading}</h2>}
            <div className="grid grid-cols-2 gap-4">
                <div className="relative overflow-hidden rounded-lg border border-dashed border-zinc-700">
                    {beforeImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={beforeImage} alt={beforeLabel} className="w-full aspect-video object-cover" />
                    ) : (
                        <ImagePlaceholder label={beforeLabel} className="aspect-video" />
                    )}
                    <span className="absolute top-2 left-2 rounded-md bg-zinc-900/80 px-2 py-0.5 text-[10px] font-mono uppercase text-zinc-400 backdrop-blur-sm">
                        {beforeLabel}
                    </span>
                </div>
                <div className="relative overflow-hidden rounded-lg border border-dashed border-sky-400/30">
                    {afterImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={afterImage} alt={afterLabel} className="w-full aspect-video object-cover" />
                    ) : (
                        <ImagePlaceholder label={afterLabel} className="aspect-video" />
                    )}
                    <span className="absolute top-2 left-2 rounded-md bg-sky-400/20 px-2 py-0.5 text-[10px] font-mono uppercase text-sky-300 backdrop-blur-sm">
                        {afterLabel}
                    </span>
                </div>
            </div>
            <div className="mt-4 flex items-start gap-4">
                {metric && <span className="shrink-0 text-2xl font-bold" style={{ color: metricColor || 'var(--theme-primary, #22d3ee)' }}>{metric}</span>}
                {description && <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-text-muted, #a1a1aa)' }}>{description}</p>}
            </div>
        </section>
    );
}

/* ── Video Showcase statique ──────────────────────────────── */
function getEmbedUrl(platform: string, url: string): string | null {
    try {
        const u = new URL(url);
        if (platform === 'youtube') {
            const id = u.searchParams.get('v') ?? u.pathname.slice(1);
            if (!id) return null;
            return `https://www.youtube.com/embed/${id}`;
        }
        if (platform === 'tiktok') {
            const match = u.pathname.match(/video\/(\d+)/);
            if (!match) return null;
            return `https://www.tiktok.com/embed/v2/${match[1]}`;
        }
        if (platform === 'instagram') {
            const match = u.pathname.match(/\/(reel|p)\/([^/]+)/);
            if (!match) return null;
            return `https://www.instagram.com/${match[1]}/${match[2]}/embed`;
        }
        return null;
    } catch {
        return null;
    }
}

const PLATFORM_ICONS: Record<string, ReactNode> = { tiktok: <Music2 className="h-8 w-8" />, youtube: <Play className="h-8 w-8" />, instagram: <Camera className="h-8 w-8" /> };

function StaticVideoShowcaseBlock({
    heading = 'Mes créations vidéo',
    items = [],
    cardRadius = 'md',
    ...adv
}: {
    heading?: string;
    items?: { platform: string; url: string; title?: string }[];
    cardRadius?: string;
} & AdvancedProps) {
    const cardBorderRadius = RADIUS_PX[cardRadius] ?? 'var(--theme-radius, 12px)';
    const sectionStyle = useAdvancedStyle(adv, 'md', 'md');
    return (
        <section
            id={adv.customId || undefined}
            className={advancedCls(adv, 'px-6 rounded-xl')}
            style={sectionStyle}
        >
            {heading && <h2 className="text-xl mb-6" style={{ color: 'var(--theme-heading, var(--theme-text, #f4f4f5))', fontFamily: 'var(--theme-font-heading)', fontWeight: 'var(--theme-heading-weight)' as React.CSSProperties['fontWeight'], letterSpacing: 'var(--theme-heading-tracking)', textTransform: 'var(--theme-heading-transform)' as React.CSSProperties['textTransform'] }}>{heading}</h2>}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(items ?? []).map((item, i) => {
                    const embedUrl = getEmbedUrl(item.platform, item.url);
                    return (
                        <div key={i} className="overflow-hidden border border-dashed border-zinc-700 bg-zinc-900" style={{ borderRadius: cardBorderRadius }}>
                            {embedUrl ? (
                                <iframe
                                    src={embedUrl}
                                    className="aspect-video w-full"
                                    allowFullScreen
                                    loading="lazy"
                                    title={item.title ?? `Vidéo ${i + 1}`}
                                />
                            ) : (
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex aspect-video flex-col items-center justify-center gap-2 bg-zinc-900 text-zinc-500 hover:text-sky-400 transition-colors"
                                >
                                    <span className="text-zinc-500">{PLATFORM_ICONS[item.platform] ?? <Play className="h-8 w-8" />}</span>
                                    <span className="text-xs font-medium">{item.title ?? 'Voir la vidéo'}</span>
                                    <span className="text-[10px] font-mono uppercase text-zinc-600">{item.platform}</span>
                                </a>
                            )}
                            {item.title && (
                                <div className="px-3 py-2 border-t border-dashed border-zinc-800">
                                    <p className="text-xs text-zinc-400 truncate">{item.title}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

/* ── Testimonials statique ────────────────────────────────── */
function StaticTestimonialsBlock({
    heading = 'Ce qu\'ils disent',
    items = [],
    cardBg = '',
    ...adv
}: {
    heading?: string;
    items?: { quote: string; brand: string; contact?: string; role?: string }[];
    cardBg?: string;
} & AdvancedProps) {
    const sectionStyle = useAdvancedStyle(adv, 'md', 'md');
    return (
        <section
            id={adv.customId || undefined}
            className={advancedCls(adv, 'px-6 rounded-xl')}
            style={sectionStyle}
        >
            {heading && <h2 className="text-xl mb-6" style={{ color: 'var(--theme-heading, var(--theme-text, #f4f4f5))', fontFamily: 'var(--theme-font-heading)', fontWeight: 'var(--theme-heading-weight)' as React.CSSProperties['fontWeight'], letterSpacing: 'var(--theme-heading-tracking)', textTransform: 'var(--theme-heading-transform)' as React.CSSProperties['textTransform'] }}>{heading}</h2>}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(items ?? []).slice(0, 10).map((item, i) => (
                    <div key={i} className="rounded-lg border border-dashed border-zinc-700 p-5" style={{ background: cardBg || 'rgba(24,24,27,0.5)' }}>
                        <div className="mb-4 text-sky-400/40 font-serif text-3xl leading-none">&ldquo;</div>
                        <p className="text-sm leading-relaxed italic mb-4" style={{ color: 'var(--theme-text-muted, #d4d4d8)' }}>{item.quote}</p>
                        <div className="flex items-center gap-3 border-t border-dashed border-zinc-800 pt-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold" style={{ color: 'var(--theme-primary, #22d3ee)' }}>
                                {item.brand.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-medium" style={{ color: 'var(--theme-text, #f4f4f5)' }}>{item.brand}</p>
                                {item.contact && (
                                    <p className="text-[10px] text-zinc-500">
                                        {item.contact}{item.role ? ` · ${item.role}` : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ── Brands statique ──────────────────────────────────────── */
function StaticBrandsBlock({
    heading = 'Ils m\'ont fait confiance',
    items = [],
    grayscale = true,
    logoSize = 'md',
    ...adv
}: {
    heading?: string;
    items?: { name: string; logoUrl?: string; link?: string }[];
    grayscale?: boolean;
    logoSize?: string;
} & AdvancedProps) {
    const logoImgCls = `${{ sm: 'h-7', md: 'h-10', lg: 'h-14' }[logoSize] ?? 'h-10'} w-auto object-contain transition-all duration-300 ${grayscale ? 'grayscale hover:grayscale-0' : ''}`;
    const sectionStyle = useAdvancedStyle(adv, 'md', 'md');
    return (
        <section
            id={adv.customId || undefined}
            className={advancedCls(adv, 'px-6 rounded-xl')}
            style={sectionStyle}
        >
            {heading && (
                <h2 className="mb-6 text-center font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--theme-text-muted, #a1a1aa)' }}>
                    {heading}
                </h2>
            )}
            <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
                {(items ?? []).map((brand, i) => {
                    const content = brand.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className={logoImgCls}
                        />
                    ) : (
                        <div className="flex h-16 w-full items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 transition-colors hover:border-sky-400/30">
                            <span className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
                                {brand.name}
                            </span>
                        </div>
                    );
                    return brand.link ? (
                        <a key={i} href={brand.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center" aria-label={brand.name}>
                            {content}
                        </a>
                    ) : (
                        <div key={i} className="flex items-center justify-center">{content}</div>
                    );
                })}
            </div>
        </section>
    );
}

/* ── Footer statique ──────────────────────────────────────── */
function StaticFooterBlock({
    copyright = '© 2026 Mon Nom',
    links = [],
    showWatermark = true,
    textAlign = 'center',
    showDivider = false,
    ...adv
}: {
    copyright?: string;
    links?: { label: string; url: string }[];
    showWatermark?: boolean;
    textAlign?: string;
    showDivider?: boolean;
} & AdvancedProps) {
    const alignCls = { left: 'items-start text-left', center: 'items-center text-center', right: 'items-end text-right' }[textAlign] ?? 'items-center text-center';
    const sectionStyle = useAdvancedStyle(adv, 'sm', 'sm');
    return (
        <footer
            id={adv.customId || undefined}
            className={advancedCls(adv, 'px-6 rounded-xl')}
            style={sectionStyle}
        >
            {showDivider && <div className="mb-6 border-t border-dashed border-zinc-700" />}
            <div className={`flex flex-col gap-4 ${alignCls}`}>
                {links && links.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-4">
                        {links.map((link, i) => (
                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium uppercase tracking-wide text-zinc-500 hover:text-sky-400 transition-colors">
                                {link.label}
                            </a>
                        ))}
                    </div>
                )}
                <p className="text-xs text-zinc-600">{copyright}</p>
                {showWatermark && (
                    <div className="mt-2 border-t border-dashed border-zinc-800 pt-3 w-full text-center">
                        <a href="https://creafolio.fr" target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] uppercase tracking-widest text-zinc-700 hover:text-sky-400/60 transition-colors">
                            Built with Creafolio
                        </a>
                    </div>
                )}
            </div>
        </footer>
    );
}

/* ── Registre des renderers statiques ─────────────────────── */
const STATIC_RENDERERS: Record<string, React.ComponentType<Record<string, unknown>>> = {
    HeroBlock: StaticHeroBlock as React.ComponentType<Record<string, unknown>>,
    AboutBlock: StaticAboutBlock as React.ComponentType<Record<string, unknown>>,
    StatsBlock: StaticStatsBlock as React.ComponentType<Record<string, unknown>>,
    GalleryBlock: StaticGalleryBlock as React.ComponentType<Record<string, unknown>>,
    ContactBlock: StaticContactBlock as React.ComponentType<Record<string, unknown>>,
    TextBlock: StaticTextBlock as React.ComponentType<Record<string, unknown>>,
    BeforeAfterBlock: StaticBeforeAfterBlock as React.ComponentType<Record<string, unknown>>,
    VideoShowcaseBlock: StaticVideoShowcaseBlock as React.ComponentType<Record<string, unknown>>,
    TestimonialsBlock: StaticTestimonialsBlock as React.ComponentType<Record<string, unknown>>,
    BrandsBlock: StaticBrandsBlock as React.ComponentType<Record<string, unknown>>,
    FooterBlock: StaticFooterBlock as React.ComponentType<Record<string, unknown>>,
};

/* ── Helpers ──────────────────────────────────────────────── */
function filterHtmlProps(props: Record<string, unknown>): Record<string, string> {
    const safe: Record<string, string> = {};
    const allowed = ['id', 'style'];
    for (const key of allowed) {
        if (typeof props[key] === 'string') {
            safe[key] = props[key] as string;
        }
    }
    return safe;
}
