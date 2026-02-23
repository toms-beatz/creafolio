'use client';

import { useNode } from '@craftjs/core';
import { SPACING_PX } from '@/lib/block-styles';

interface FooterBlockProps {
    copyright?: string;
    links?: { label: string; url: string }[];
    showWatermark?: boolean;
    paddingTop?: string;
    paddingBottom?: string;
    bgColor?: string;
    textAlign?: string;
    showDivider?: boolean;
    customId?: string;
    customClass?: string;
    hideOnMobile?: boolean;
    hideOnDesktop?: boolean;
    animateIn?: string;
}

export function FooterBlock({
    copyright = '© 2026 Mon Nom',
    links = [],
    showWatermark = true,
    paddingTop = 'sm',
    paddingBottom = 'sm',
    bgColor = '',
    textAlign = 'center',
    showDivider = false,
    customId = '',
    customClass = '',
    hideOnMobile = false,
    hideOnDesktop = false,
    animateIn = 'none',
}: FooterBlockProps) {
    const { connectors: { connect, drag }, selected } = useNode((node) => ({
        selected: node.events.selected,
    }));

    const alignCls = textAlign === 'left' ? 'items-start text-left' : textAlign === 'right' ? 'items-end text-right' : 'items-center text-center';

    return (
        <footer
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            id={customId || undefined}
            className={[
                'px-6 rounded-xl transition-all',
                hideOnMobile ? 'hidden md:block' : '',
                hideOnDesktop ? 'block md:hidden' : '',
                animateIn !== 'none' ? `bp-animate-${animateIn}` : '',
                customClass,
                selected ? 'ring-2 ring-sky-400' : 'ring-1 ring-transparent hover:ring-zinc-700',
            ].filter(Boolean).join(' ')}
            style={{ paddingTop: SPACING_PX[paddingTop] ?? '32px', paddingBottom: SPACING_PX[paddingBottom] ?? '32px', background: bgColor || undefined }}
        >
            {showDivider && <div className="mb-6 border-t border-zinc-800" />}

            <div className={`flex flex-col gap-4 ${alignCls}`}>
                {links && links.length > 0 && (
                    <div className={`flex flex-wrap gap-4 ${textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : ''}`}>
                        {links.map((link, i) => (
                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                                className="text-xs font-medium uppercase tracking-wide text-zinc-500 hover:text-sky-400 transition-colors">
                                {link.label}
                            </a>
                        ))}
                    </div>
                )}
                <p className="text-xs" style={{ color: 'var(--theme-text-muted, #52525b)' }}>{copyright}</p>
                {showWatermark && (
                    <div className="mt-2 border-t border-dashed border-zinc-800 pt-3 w-full">
                        <a href="https://blooprint.fr" target="_blank" rel="noopener noreferrer"
                            className="font-mono text-[9px] uppercase tracking-widest text-zinc-700 hover:text-sky-400/60 transition-colors">
                            Built with Blooprint
                        </a>
                    </div>
                )}
            </div>
        </footer>
    );
}

FooterBlock.craft = {
    displayName: 'Footer',
    props: {
        copyright: '© 2026 Mon Nom',
        links: [],
        showWatermark: true,
        paddingTop: 'sm', paddingBottom: 'sm', bgColor: '', textAlign: 'center', showDivider: false,
        customId: '', customClass: '', hideOnMobile: false, hideOnDesktop: false, animateIn: 'none',
    },
    rules: { canDrag: () => true },
};
