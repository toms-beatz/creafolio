'use client';

import { useNode } from '@craftjs/core';
import { SPACING_PX, RADIUS_PX } from '@/lib/block-styles';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';

interface GalleryItem {
    imageUrl?: string;
    caption?: string;
    link?: string;
}

interface GalleryBlockProps {
    heading?: string;
    items?: GalleryItem[];
    columns?: 2 | 3;
    paddingTop?: string;
    paddingBottom?: string;
    bgColor?: string;
    cardRadius?: string;
    aspectRatio?: string;
    customId?: string;
    customClass?: string;
    hideOnMobile?: boolean;
    hideOnDesktop?: boolean;
    animateIn?: string;
}

const defaultItems: GalleryItem[] = [
    { caption: 'Projet 1' },
    { caption: 'Projet 2' },
    { caption: 'Projet 3' },
];

export function GalleryBlock({
    heading = 'Mes projets',
    items = defaultItems,
    columns = 3,
    paddingTop = 'md',
    paddingBottom = 'md',
    bgColor = '',
    cardRadius = 'md',
    aspectRatio = 'video',
    customId = '',
    customClass = '',
    hideOnMobile = false,
    hideOnDesktop = false,
    animateIn = 'none',
}: GalleryBlockProps) {
    const { connectors: { connect, drag }, selected } = useNode((node) => ({
        selected: node.events.selected,
    }));

    const cardRadiusPx = RADIUS_PX[cardRadius ?? 'md'] ?? '12px';
    const aspectStyle = { aspectRatio: aspectRatio === 'square' ? '1/1' : aspectRatio === 'portrait' ? '3/4' : '16/9' };

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            id={customId || undefined}
            className={[
                'px-4 rounded-xl transition-all',
                hideOnMobile ? 'hidden md:block' : '',
                hideOnDesktop ? 'block md:hidden' : '',
                animateIn !== 'none' ? `bp-animate-${animateIn}` : '',
                customClass,
                selected ? 'ring-2 ring-sky-400' : 'ring-1 ring-transparent hover:ring-zinc-700',
            ].filter(Boolean).join(' ')}
            style={{ paddingTop: SPACING_PX[paddingTop] ?? '48px', paddingBottom: SPACING_PX[paddingBottom] ?? '48px', background: bgColor || undefined }}
        >
            {heading && (
                <h2 className="mb-6 text-xl font-bold" style={{ color: 'var(--theme-text, #f4f4f5)' }}>{heading}</h2>
            )}

            <div className={`grid gap-3 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {items.map((item, i) => (
                    <div key={i} className="group relative overflow-hidden border border-dashed border-zinc-700" style={{ borderRadius: cardRadiusPx, ...aspectStyle }}>
                        {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={item.imageUrl}
                                alt={item.caption ?? `Projet ${i + 1}`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <ImagePlaceholder
                                label={item.caption ?? `Projet ${i + 1}`}
                                className="w-full h-full"
                            />
                        )}
                        {item.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs text-white">{item.caption}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

GalleryBlock.craft = {
    displayName: 'Galerie',
    props: {
        heading: 'Mes projets',
        items: defaultItems,
        columns: 3,
        paddingTop: 'md', paddingBottom: 'md', bgColor: '', cardRadius: 'md', aspectRatio: 'video',
        customId: '', customClass: '', hideOnMobile: false, hideOnDesktop: false, animateIn: 'none',
    },
    rules: { canDrag: () => true },
};
