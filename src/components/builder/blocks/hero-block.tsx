'use client';

import { useNode } from '@craftjs/core';
import { SPACING_PX, RADIUS_PX } from '@/lib/block-styles';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { EditableText } from '../editable-text';

interface HeroBlockProps {
    name?: string;
    title?: string;
    description?: string;
    ctaLabel?: string;
    ctaHref?: string;
    imageUrl?: string;
    // Style
    paddingTop?: string;
    paddingBottom?: string;
    bgColor?: string;
    textAlign?: string;
    avatarShape?: string;
    avatarSize?: string;
    ctaBg?: string;
    ctaTextColor?: string;
    ctaRadius?: string;
    // Avancé
    customId?: string;
    customClass?: string;
    hideOnMobile?: boolean;
    hideOnDesktop?: boolean;
    animateIn?: string;
}

export function HeroBlock({
    name = 'Ton Nom',
    title = 'Créateur UGC',
    description = 'Je crée du contenu authentique pour des marques ambitieuses. TikTok · Instagram · YouTube.',
    ctaLabel = 'Voir mes projets',
    ctaHref = '#gallery',
    imageUrl,
    paddingTop = 'lg',
    paddingBottom = 'lg',
    bgColor = '',
    textAlign = 'center',
    avatarShape = 'circle',
    avatarSize = 'md',
    ctaBg = '',
    ctaTextColor = '',
    ctaRadius = 'md',
    customId = '',
    customClass = '',
    hideOnMobile = false,
    hideOnDesktop = false,
    animateIn = 'none',
}: HeroBlockProps) {
    const { connectors: { connect, drag }, selected } = useNode((node) => ({
        selected: node.events.selected,
    }));

    const avatarSizeCls = avatarSize === 'sm' ? 'w-16 h-16' : avatarSize === 'lg' ? 'w-32 h-32' : 'w-24 h-24';
    const avatarRadiusCls = avatarShape === 'square' ? 'rounded-none' : avatarShape === 'rounded' ? 'rounded-2xl' : 'rounded-full';
    const alignCls = textAlign === 'left' ? 'items-start text-left' : textAlign === 'right' ? 'items-end text-right' : 'items-center text-center';

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            id={customId || undefined}
            className={[
                'relative flex flex-col gap-6 px-6 rounded-xl transition-all',
                alignCls,
                hideOnMobile ? 'hidden md:block' : '',
                hideOnDesktop ? 'block md:hidden' : '',
                animateIn !== 'none' ? `bp-animate-${animateIn}` : '',
                customClass,
                selected ? 'ring-2 ring-sky-400' : 'ring-1 ring-transparent hover:ring-zinc-700',
            ].filter(Boolean).join(' ')}
            style={{ paddingTop: SPACING_PX[paddingTop] ?? '80px', paddingBottom: SPACING_PX[paddingBottom] ?? '80px', ...(bgColor ? { background: bgColor } : {}) }}
        >
            {/* Avatar */}
            <div className={`${avatarSizeCls} ${avatarRadiusCls} overflow-hidden border-2 border-dashed border-zinc-600`}>
                {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <ImagePlaceholder label="Photo" className="w-full h-full" />
                )}
            </div>

            <div>
                <EditableText
                    propKey="name"
                    value={name}
                    as="h1"
                    singleLine
                    className="text-3xl font-bold"
                    style={{ color: 'var(--theme-text, #f4f4f5)', fontFamily: 'var(--theme-font-heading, inherit)', fontWeight: 'var(--theme-heading-weight, 700)' } as React.CSSProperties}
                    placeholder="Ton Nom"
                />
                <EditableText
                    propKey="title"
                    value={title}
                    as="p"
                    singleLine
                    className="mt-1 font-medium"
                    style={{ color: 'var(--theme-primary, #22d3ee)' }}
                    placeholder="Créateur UGC"
                />
            </div>

            <EditableText
                propKey="description"
                value={description}
                as="p"
                className="max-w-md text-sm leading-relaxed"
                style={{ color: 'var(--theme-text-muted, #a1a1aa)' }}
                placeholder="Ta description…"
            />

            <a
                href={ctaHref}
                className="inline-flex items-center px-5 py-2.5 text-sm font-semibold transition-colors"
                style={{ background: ctaBg || 'var(--theme-primary, #22d3ee)', color: ctaTextColor || 'var(--theme-bg, #030712)', borderRadius: RADIUS_PX[ctaRadius ?? 'md'] ?? '12px' }}
            >
                <EditableText
                    propKey="ctaLabel"
                    value={ctaLabel}
                    as="span"
                    singleLine
                    placeholder="Call to action"
                />
            </a>
        </section>
    );
}

HeroBlock.craft = {
    displayName: 'Hero',
    props: {
        name: 'Ton Nom',
        title: 'Créateur UGC',
        description: 'Je crée du contenu authentique pour des marques ambitieuses.',
        ctaLabel: 'Voir mes projets',
        ctaHref: '#gallery',
        imageUrl: '',
        paddingTop: 'lg', paddingBottom: 'lg', bgColor: '', textAlign: 'center',
        avatarShape: 'circle', avatarSize: 'md', ctaBg: '', ctaTextColor: '', ctaRadius: 'md',
        customId: '', customClass: '', hideOnMobile: false, hideOnDesktop: false, animateIn: 'none',
    },
    rules: { canDrag: () => true },
};

