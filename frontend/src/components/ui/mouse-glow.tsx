'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface MouseGlowProps {
    /** Rayon du spotlight de révélation en px, défaut 280 */
    radius?: number;
    /** Taille de cellule de la grille, doit correspondre à la BlueprintGrid parente */
    cellSize?: number;
    className?: string;
}

/**
 * Révèle la grille blueprint au survol de la souris via CSS mask.
 * Superpose un duplicata de la grille en bright, masqué par un radial-gradient
 * centré sur la position de la souris. Effet "flashlight on blueprint".
 * Placer directement dans un conteneur `relative overflow-hidden`.
 */
export function MouseGlow({ radius = 280, cellSize = 40, className }: MouseGlowProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const parent = ref.current?.parentElement;
        if (!parent) return;

        const onMove = (e: MouseEvent) => {
            const rect = parent.getBoundingClientRect();
            setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        };
        const onLeave = () => setPos(null);

        parent.addEventListener('mousemove', onMove);
        parent.addEventListener('mouseleave', onLeave);
        return () => {
            parent.removeEventListener('mousemove', onMove);
            parent.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    const mask = pos
        ? `radial-gradient(circle ${radius}px at ${pos.x}px ${pos.y}px, black 0%, black 35%, transparent 70%)`
        : 'none';

    return (
        <div
            ref={ref}
            className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}
            aria-hidden="true"
            style={{
                maskImage: mask,
                WebkitMaskImage: mask,
                opacity: pos ? .5 : 0,
                transition: 'opacity 0.25s ease',
            }}
        >
            {/* Grille bright — révélée par le mask */}
            <svg className="absolute inset-0 h-full w-full">
                <defs>
                    <pattern
                        id="bp-reveal-grid"
                        x="0"
                        y="0"
                        width={cellSize}
                        height={cellSize}
                        patternUnits="userSpaceOnUse"
                    >
                        <line
                            x1="0" y1={cellSize} x2={cellSize} y2={cellSize}
                            stroke="#38bdf8"
                            strokeWidth="1.2"
                            strokeDasharray="3 5"
                        />
                        <line
                            x1={cellSize} y1="0" x2={cellSize} y2={cellSize}
                            stroke="#38bdf8"
                            strokeWidth="1.2"
                            strokeDasharray="3 5"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#bp-reveal-grid)" opacity="0.5" />
            </svg>

            {/* Halo subtil au centre du spotlight */}
            {pos && (
                <div
                    className="absolute rounded-full"
                    style={{
                        left: pos.x,
                        top: pos.y,
                        transform: 'translate(-50%, -50%)',
                        width: radius,
                        height: radius,
                        background: `radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)`,
                    }}
                />
            )}
        </div>
    );
}

