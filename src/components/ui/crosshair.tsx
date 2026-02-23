import * as React from 'react';
import { cn } from '@/lib/utils';

interface CrosshairProps {
    /** Position dans le coin du parent — nécessite `position: relative` sur parent */
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    /** Taille en px, défaut 16 */
    size?: number;
    className?: string;
}

/**
 * Croix de repérage style plan d'architecte.
 * Se positionne en `absolute` dans les coins du parent.
 */
export function Crosshair({ position, size = 16, className }: CrosshairProps) {
    const posClasses = {
        'top-left': 'top-0 left-0',
        'top-right': 'top-0 right-0',
        'bottom-left': 'bottom-0 left-0',
        'bottom-right': 'bottom-0 right-0',
    }[position];

    const half = size / 2;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className={cn('absolute pointer-events-none text-zinc-500', posClasses, className)}
            aria-hidden="true"
        >
            {/* Ligne horizontale */}
            <line x1="0" y1={half} x2={size} y2={half} stroke="currentColor" strokeWidth="0.75" />
            {/* Ligne verticale */}
            <line x1={half} y1="0" x2={half} y2={size} stroke="currentColor" strokeWidth="0.75" />
            {/* Cercle central */}
            <circle cx={half} cy={half} r="2" fill="none" stroke="currentColor" strokeWidth="0.75" />
        </svg>
    );
}
