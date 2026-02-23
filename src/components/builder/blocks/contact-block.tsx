'use client';

import { useNode } from '@craftjs/core';
import { SPACING_PX, RADIUS_PX } from '@/lib/block-styles';

interface ContactBlockProps {
    heading?: string;
    description?: string;
    email?: string;
    ctaLabel?: string;
    socials?: { platform: string; url: string }[];
    paddingTop?: string;
    paddingBottom?: string;
    bgColor?: string;
    ctaBg?: string;
    ctaTextColor?: string;
    ctaRadius?: string;
    customId?: string;
    customClass?: string;
    hideOnMobile?: boolean;
    hideOnDesktop?: boolean;
    animateIn?: string;
}

export function ContactBlock({
    heading = 'Travaillons ensemble',
    description = 'Tu cherches un créateur UGC pour ta prochaine campagne ? Écris-moi.',
    email = 'ton@email.com',
    ctaLabel = 'Envoie-moi un message',
    socials = [],
    paddingTop = 'md',
    paddingBottom = 'md',
    bgColor = '',
    ctaBg = '',
    ctaTextColor = '',
    ctaRadius = 'md',
    customId = '',
    customClass = '',
    hideOnMobile = false,
    hideOnDesktop = false,
    animateIn = 'none',
}: ContactBlockProps) {
    const { connectors: { connect, drag }, selected } = useNode((node) => ({
        selected: node.events.selected,
    }));

    const animCls = animateIn && animateIn !== 'none' ? `bp-animate-${animateIn}` : '';

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            id={customId || undefined}
            className={[
                'px-6 rounded-xl border border-dashed transition-all text-center',
                selected ? 'border-sky-400 ring-2 ring-sky-400' : 'border-zinc-700 hover:border-zinc-600',
                hideOnMobile ? 'hidden md:block' : '',
                hideOnDesktop ? 'md:hidden' : '',
                customClass,
                animCls,
            ].filter(Boolean).join(' ')}
            style={{
                paddingTop: SPACING_PX[paddingTop] ?? '48px',
                paddingBottom: SPACING_PX[paddingBottom] ?? '48px',
                background: bgColor || undefined,
            }}
        >
            <h2 className="mb-3 text-2xl font-bold" style={{ color: 'var(--theme-text, #f4f4f5)' }}>{heading}</h2>
            <p className="mb-6 text-sm max-w-sm mx-auto leading-relaxed" style={{ color: 'var(--theme-text-muted, #a1a1aa)' }}>{description}</p>

            <a
                href={`mailto:${email}`}
                className="inline-flex items-center px-6 py-2.5 text-sm font-semibold transition-colors"
                style={{
                    background: ctaBg || 'var(--theme-primary, #22d3ee)',
                    color: ctaTextColor || 'var(--theme-bg, #030712)',
                    borderRadius: RADIUS_PX[ctaRadius] ?? '12px',
                }}
            >
                {ctaLabel}
            </a>

            {socials.length > 0 && (
                <div className="mt-6 flex items-center justify-center gap-4">
                    {socials.map((s) => (
                        <a
                            key={s.platform}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-zinc-500 hover:text-sky-400 transition-colors uppercase tracking-wide"
                        >
                            {s.platform}
                        </a>
                    ))}
                </div>
            )}
        </section>
    );
}

ContactBlock.craft = {
    displayName: 'Contact',
    props: {
        heading: 'Travaillons ensemble',
        description: 'Tu cherches un créateur UGC pour ta prochaine campagne ? Écris-moi.',
        email: 'ton@email.com',
        ctaLabel: 'Envoie-moi un message',
        socials: [],
        paddingTop: 'md', paddingBottom: 'md', bgColor: '', ctaBg: '', ctaTextColor: '', ctaRadius: 'md',
        customId: '', customClass: '', hideOnMobile: false, hideOnDesktop: false, animateIn: 'none',
    },
    rules: { canDrag: () => true },
};
