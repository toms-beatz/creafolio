'use client';

import { useNode } from '@craftjs/core';
import { SPACING_PX } from '@/lib/block-styles';

interface BrandItem {
    name: string;
    logoUrl?: string;
    link?: string;
}

interface BrandsBlockProps {
    heading?: string;
    items?: BrandItem[];
    paddingTop?: string;
    paddingBottom?: string;
    bgColor?: string;
    grayscale?: boolean;
    logoSize?: string;
    customId?: string;
    customClass?: string;
    hideOnMobile?: boolean;
    hideOnDesktop?: boolean;
    animateIn?: string;
}

export function BrandsBlock({
    heading = 'Ils m\'ont fait confiance',
    items = [
        { name: 'Nike' }, { name: 'L\'Oréal' }, { name: 'Samsung' },
        { name: 'Sephora' }, { name: 'Adidas' }, { name: 'Netflix' },
    ],
    paddingTop = 'md',
    paddingBottom = 'md',
    bgColor = '',
    grayscale = true,
    logoSize = 'md',
    customId = '',
    customClass = '',
    hideOnMobile = false,
    hideOnDesktop = false,
    animateIn = 'none',
}: BrandsBlockProps) {
    const { connectors: { connect, drag }, selected } = useNode((node) => ({
        selected: node.events.selected,
    }));

    const logoImgCls = `${logoSize === 'sm' ? 'h-8' : logoSize === 'lg' ? 'h-16' : 'h-12'} w-auto object-contain ${grayscale ? 'grayscale hover:grayscale-0' : ''} transition-all duration-300`;

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
            {heading && (
                <h2 className="mb-6 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {heading}
                </h2>
            )}

            <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
                {(items ?? []).map((brand, i) => {
                    const content = brand.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={brand.logoUrl} alt={brand.name} className={logoImgCls} />
                    ) : (
                        <div className="flex h-16 w-full items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 transition-colors hover:border-sky-400/30">
                            <span className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">{brand.name}</span>
                        </div>
                    );

                    return brand.link ? (
                        <a key={i} href={brand.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center" aria-label={brand.name}>{content}</a>
                    ) : (
                        <div key={i} className="flex items-center justify-center">{content}</div>
                    );
                })}
            </div>
        </section>
    );
}

BrandsBlock.craft = {
    displayName: 'Marques',
    props: {
        heading: 'Ils m\'ont fait confiance',
        items: [{ name: 'Nike' }, { name: 'L\'Oréal' }, { name: 'Samsung' }, { name: 'Sephora' }, { name: 'Adidas' }, { name: 'Netflix' }],
        paddingTop: 'md', paddingBottom: 'md', bgColor: '', grayscale: true, logoSize: 'md',
        customId: '', customClass: '', hideOnMobile: false, hideOnDesktop: false, animateIn: 'none',
    },
    rules: { canDrag: () => true },
};
