'use client';

import { cn } from '@/lib/utils';

interface BorderBeamProps {
    className?: string;
    /** Taille du gradient beam en px */
    size?: number;
    /** Durée d'un tour complet en secondes */
    duration?: number;
    /** Délai initial en secondes */
    delay?: number;
    /** Couleur de départ */
    colorFrom?: string;
    /** Couleur d'arrivée */
    colorTo?: string;
    /** border-radius hérité */
    borderRadius?: string;
}

/**
 * BorderBeam — rayon lumineux animé qui parcourt le contour d'un élément.
 * Inspiré de Magic UI. À placer dans un conteneur `relative overflow-hidden rounded-*`.
 */
export function BorderBeam({
    className,
    size: _size,
    duration = 8,
    delay = 0,
    colorFrom = '#38bdf8',
    colorTo = '#0c4a6e',
    borderRadius = '1rem',
}: BorderBeamProps) {
    // _size reserved for future gradient arc sizing
    void _size;
    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-0 z-10',
                className,
            )}
            style={{ borderRadius }}
        >
            <div
                className="absolute inset-0"
                style={{
                    borderRadius,
                    padding: '1.5px',
                    WebkitMask:
                        'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    background: `conic-gradient(from calc(var(--bp-beam-angle, 0) * 1deg), transparent 0%, transparent 75%, ${colorFrom} 85%, ${colorTo} 95%, transparent 100%)`,
                    animation: `bp-border-beam ${duration}s linear ${delay}s infinite`,
                }}
            />
            <style>{`
                @property --bp-beam-angle {
                    syntax: "<number>";
                    inherits: false;
                    initial-value: 0;
                }
                @keyframes bp-border-beam {
                    from { --bp-beam-angle: 0; }
                    to { --bp-beam-angle: 360; }
                }
            `}</style>
        </div>
    );
}
