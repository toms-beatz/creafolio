'use client';

import { useNode } from '@craftjs/core';
import { SPACING_PX } from '@/lib/block-styles';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';

interface BeforeAfterBlockProps {
    heading?: string;
    beforeLabel?: string;
    afterLabel?: string;
    beforeImage?: string;
    afterImage?: string;
    description?: string;
    metric?: string;
    paddingTop?: string;
    paddingBottom?: string;
    bgColor?: string;
    metricColor?: string;
    customId?: string;
    customClass?: string;
    hideOnMobile?: boolean;
    hideOnDesktop?: boolean;
    animateIn?: string;
}

export function BeforeAfterBlock({
    heading = 'Résultats',
    beforeLabel = 'Avant',
    afterLabel = 'Après ma vidéo',
    beforeImage,
    afterImage,
    description = 'Une vidéo UGC qui a boosté les ventes de +340%.',
    metric = '+340%',
    paddingTop = 'md',
    paddingBottom = 'md',
    bgColor = '',
    metricColor = '',
    customId = '',
    customClass = '',
    hideOnMobile = false,
    hideOnDesktop = false,
    animateIn = 'none',
}: BeforeAfterBlockProps) {
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

            <div className="grid grid-cols-2 gap-4">
                {/* Before */}
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

                {/* After */}
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

            {/* Metric + Description */}
            <div className="mt-4 flex items-start gap-4">
                {metric && (
                    <span className="shrink-0 text-2xl font-bold" style={{ color: metricColor || 'var(--theme-primary, #22d3ee)' }}>{metric}</span>
                )}
                {description && (
                    <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
                )}
            </div>
        </section>
    );
}

BeforeAfterBlock.craft = {
    displayName: 'Before/After',
    props: {
        heading: 'Résultats',
        beforeLabel: 'Avant',
        afterLabel: 'Après ma vidéo',
        beforeImage: '',
        afterImage: '',
        description: 'Une vidéo UGC qui a boosté les ventes de +340%.',
        metric: '+340%',
        paddingTop: 'md', paddingBottom: 'md', bgColor: '', metricColor: '',
        customId: '', customClass: '', hideOnMobile: false, hideOnDesktop: false, animateIn: 'none',
    },
    rules: { canDrag: () => true },
};
