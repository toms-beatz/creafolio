'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
    children: ReactNode;
    className?: string;
    /** Durée d'un cycle complet en secondes */
    duration?: number;
    /** Direction du défilement */
    reverse?: boolean;
    /** Pause au hover */
    pauseOnHover?: boolean;
    /** Nombre de copies du contenu pour boucle continue */
    repeat?: number;
}

/**
 * Marquee — défilement horizontal infini de contenu.
 * Inspiré de Magic UI. Idéal pour logos de confiance, témoignages.
 */
export function Marquee({
    children,
    className,
    duration = 30,
    reverse = false,
    pauseOnHover = true,
    repeat = 4,
}: MarqueeProps) {
    return (
        <div
            className={cn(
                'group flex overflow-hidden [--duration:30s] [--gap:1rem]',
                className,
            )}
            style={{
                '--duration': `${duration}s`,
            } as React.CSSProperties}
        >
            {Array.from({ length: repeat }, (_, i) => (
                <div
                    key={i}
                    className={cn(
                        'flex shrink-0 items-center justify-around gap-[var(--gap)]',
                        'animate-marquee',
                        reverse && '[animation-direction:reverse]',
                        pauseOnHover && 'group-hover:[animation-play-state:paused]',
                    )}
                >
                    {children}
                </div>
            ))}

            <style>{`
                @keyframes marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(calc(-100% - var(--gap))); }
                }
                .animate-marquee {
                    animation: marquee var(--duration) linear infinite;
                }
            `}</style>
        </div>
    );
}

/**
 * MarqueeItem — wrapper pour chaque élément du Marquee.
 */
export function MarqueeItem({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex items-center gap-2 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/60 px-4 py-2',
                className,
            )}
        >
            {children}
        </div>
    );
}
