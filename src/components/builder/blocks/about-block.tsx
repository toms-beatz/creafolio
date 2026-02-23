'use client';

import { useNode } from '@craftjs/core';
import { SPACING_PX } from '@/lib/block-styles';
import { EditableText } from '../editable-text';

interface AboutBlockProps {
    heading?: string;
    bio?: string;
    niches?: string[];
    paddingTop?: string;
    paddingBottom?: string;
    bgColor?: string;
    textAlign?: string;
    tagStyle?: string;
    customId?: string;
    customClass?: string;
    hideOnMobile?: boolean;
    hideOnDesktop?: boolean;
    animateIn?: string;
}

const defaultNiches = ['Beauté', 'Lifestyle', 'Food', 'Tech'];

export function AboutBlock({
    heading = 'À propos',
    bio = 'Créateur UGC passionné, je collabore avec des marques pour créer du contenu vidéo authentique qui convertit. Spécialisé dans le storytelling visuel et les formats courts.',
    niches = defaultNiches,
    paddingTop = 'md',
    paddingBottom = 'md',
    bgColor = '',
    textAlign = 'left',
    tagStyle = 'outline',
    customId = '',
    customClass = '',
    hideOnMobile = false,
    hideOnDesktop = false,
    animateIn = 'none',
}: AboutBlockProps) {
    const { connectors: { connect, drag }, selected } = useNode((node) => ({
        selected: node.events.selected,
    }));

    const alignCls = textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left';

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            id={customId || undefined}
            className={[
                'px-6 rounded-xl transition-all',
                alignCls,
                hideOnMobile ? 'hidden md:block' : '',
                hideOnDesktop ? 'block md:hidden' : '',
                animateIn !== 'none' ? `bp-animate-${animateIn}` : '',
                customClass,
                selected ? 'ring-2 ring-sky-400' : 'ring-1 ring-transparent hover:ring-zinc-700',
            ].filter(Boolean).join(' ')}
            style={{ paddingTop: SPACING_PX[paddingTop] ?? '48px', paddingBottom: SPACING_PX[paddingBottom] ?? '48px', background: bgColor || 'var(--theme-surface, transparent)' }}
        >
            <EditableText
                propKey="heading"
                value={heading}
                as="h2"
                singleLine
                className="mb-4 text-xl font-bold"
                style={{ color: 'var(--theme-text, #f4f4f5)', fontFamily: 'var(--theme-font-heading, inherit)', fontWeight: 'var(--theme-heading-weight, 700)' } as React.CSSProperties}
                placeholder="Titre de section"
            />
            <EditableText
                propKey="bio"
                value={bio}
                as="p"
                className="mb-6 text-sm leading-relaxed"
                style={{ color: 'var(--theme-text-muted, #a1a1aa)' }}
                placeholder="Ta bio…"
            />

            {niches.length > 0 && (
                <div className={`flex flex-wrap gap-2 ${textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : ''}`}>
                    {niches.map((n) => (
                        <span
                            key={n}
                            className={`px-3 py-0.5 text-xs ${tagStyle === 'filled' ? 'rounded-full' : tagStyle === 'subtle' ? 'rounded-md' : 'rounded-full border border-dashed'}`}
                            style={tagStyle === 'filled'
                                ? { background: 'var(--theme-primary, #22d3ee)', color: 'var(--theme-bg, #030712)' }
                                : tagStyle === 'subtle'
                                    ? { background: 'color-mix(in srgb, var(--theme-primary, #22d3ee) 6%, transparent)', color: 'var(--theme-text-muted, #a1a1aa)' }
                                    : { borderColor: 'var(--theme-primary, #22d3ee)', color: 'var(--theme-primary, #22d3ee)', background: 'color-mix(in srgb, var(--theme-primary, #22d3ee) 8%, transparent)' }
                            }
                        >
                            {n}
                        </span>
                    ))}
                </div>
            )}
        </section>
    );
}

AboutBlock.craft = {
    displayName: 'À propos',
    props: {
        heading: 'À propos',
        bio: 'Créateur UGC passionné, je collabore avec des marques pour créer du contenu vidéo authentique qui convertit.',
        niches: defaultNiches,
        paddingTop: 'md', paddingBottom: 'md', bgColor: '', textAlign: 'left', tagStyle: 'outline',
        customId: '', customClass: '', hideOnMobile: false, hideOnDesktop: false, animateIn: 'none',
    },
    rules: { canDrag: () => true },
};
