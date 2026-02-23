'use client';

import { useNode } from '@craftjs/core';
import { SPACING_PX } from '@/lib/block-styles';

interface StatItem {
    value: string;
    label: string;
}

interface StatsBlockProps {
    stats?: StatItem[];
    title?: string;
    paddingTop?: string;
    paddingBottom?: string;
    bgColor?: string;
    statColor?: string;
    statsColumns?: number;
    customId?: string;
    customClass?: string;
    hideOnMobile?: boolean;
    hideOnDesktop?: boolean;
    animateIn?: string;
}

const defaultStats: StatItem[] = [
    { value: '50+', label: 'Projets UGC' },
    { value: '2M+', label: 'Vues générées' },
    { value: '30+', label: 'Marques' },
];

export function StatsBlock({
    stats = defaultStats,
    title = 'Mes chiffres',
    paddingTop = 'md',
    paddingBottom = 'md',
    bgColor = '',
    statColor = '',
    statsColumns = 3,
    customId = '',
    customClass = '',
    hideOnMobile = false,
    hideOnDesktop = false,
    animateIn = 'none',
}: StatsBlockProps) {
    const { connectors: { connect, drag }, selected } = useNode((node) => ({
        selected: node.events.selected,
    }));

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            id={customId || undefined}
            className={[
                'px-6 rounded-xl border border-dashed transition-all',
                hideOnMobile ? 'hidden md:block' : '',
                hideOnDesktop ? 'block md:hidden' : '',
                animateIn !== 'none' ? `bp-animate-${animateIn}` : '',
                customClass,
                selected ? 'border-sky-400 ring-2 ring-sky-400' : 'border-zinc-700 hover:border-zinc-600',
            ].filter(Boolean).join(' ')}
            style={{ paddingTop: SPACING_PX[paddingTop] ?? '48px', paddingBottom: SPACING_PX[paddingBottom] ?? '48px', background: bgColor || undefined }}
        >
            {title && (
                <h2 className="mb-6 text-center text-sm font-mono uppercase tracking-widest"
                    style={{ color: 'var(--theme-text-muted, #71717a)' }}>
                    {title}
                </h2>
            )}
            <div className={`grid gap-4 grid-cols-${Math.min(statsColumns ?? 3, stats.length) || 3}`}>
                {stats.map((s, i) => (
                    <div key={i} className="text-center">
                        <p className="text-3xl font-bold" style={{ color: statColor || 'var(--theme-text, #f4f4f5)' }}>{s.value}</p>
                        <p className="mt-1 text-xs" style={{ color: 'var(--theme-text-muted, #71717a)' }}>{s.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

StatsBlock.craft = {
    displayName: 'Stats',
    props: {
        title: 'Mes chiffres',
        stats: defaultStats,
        paddingTop: 'md', paddingBottom: 'md', bgColor: '', statColor: '', statsColumns: 3,
        customId: '', customClass: '', hideOnMobile: false, hideOnDesktop: false, animateIn: 'none',
    },
    rules: { canDrag: () => true },
};
