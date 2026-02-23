'use client';

import { useNode } from '@craftjs/core';
import { SPACING_PX } from '@/lib/block-styles';

interface TestimonialItem {
    quote: string;
    brand: string;
    contact?: string;
    role?: string;
}

interface TestimonialsBlockProps {
    heading?: string;
    items?: TestimonialItem[];
    paddingTop?: string;
    paddingBottom?: string;
    bgColor?: string;
    cardBg?: string;
    customId?: string;
    customClass?: string;
    hideOnMobile?: boolean;
    hideOnDesktop?: boolean;
    animateIn?: string;
}

export function TestimonialsBlock({
    heading = 'Ce qu\'ils disent',
    items = [
        { quote: 'Excellente collaboration, contenu livré en avance et au-delà de nos attentes.', brand: 'Marque A', contact: 'Marie D.', role: 'Brand Manager' },
        { quote: 'ROI incroyable sur notre campagne TikTok grâce à son contenu authentique.', brand: 'Marque B', contact: 'Thomas L.', role: 'CMO' },
    ],
    paddingTop = 'md',
    paddingBottom = 'md',
    bgColor = '',
    cardBg = '',
    customId = '',
    customClass = '',
    hideOnMobile = false,
    hideOnDesktop = false,
    animateIn = 'none',
}: TestimonialsBlockProps) {
    const { connectors: { connect, drag }, selected } = useNode((node) => ({
        selected: node.events.selected,
    }));

    return (
        <section
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
            style={{ paddingTop: SPACING_PX[paddingTop] ?? '48px', paddingBottom: SPACING_PX[paddingBottom] ?? '48px', background: bgColor || undefined }}
        >
            {heading && <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--theme-text, #f4f4f5)' }}>{heading}</h2>}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(items ?? []).slice(0, 10).map((item, i) => (
                    <div
                        key={i}
                        className="rounded-lg border border-dashed border-zinc-700 p-5"
                        style={{ background: cardBg || 'rgba(24,24,27,0.5)' }}
                    >
                        <div className="mb-4 text-sky-400/40 font-serif text-3xl leading-none">&ldquo;</div>
                        <p className="text-sm text-zinc-300 leading-relaxed italic mb-4">{item.quote}</p>
                        <div className="flex items-center gap-3 border-t border-dashed border-zinc-800 pt-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-sky-400">
                                {item.brand.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-medium text-white">{item.brand}</p>
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

TestimonialsBlock.craft = {
    displayName: 'Témoignages',
    props: {
        heading: 'Ce qu\'ils disent',
        items: [
            { quote: 'Excellente collaboration, contenu livré en avance.', brand: 'Marque A', contact: 'Marie D.', role: 'Brand Manager' },
            { quote: 'ROI incroyable sur notre campagne TikTok.', brand: 'Marque B', contact: 'Thomas L.', role: 'CMO' },
        ],
        paddingTop: 'md', paddingBottom: 'md', bgColor: '', cardBg: '',
        customId: '', customClass: '', hideOnMobile: false, hideOnDesktop: false, animateIn: 'none',
    },
    rules: { canDrag: () => true },
};
