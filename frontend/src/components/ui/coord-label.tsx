import { cn } from '@/lib/utils';

interface CoordLabelProps {
    text: string;
    /** Positionnement absolu optionnel */
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    className?: string;
}

/**
 * Label de coordonnée style plan d'architecte.
 * Ex: `[HERO // 00.02]`  |  `[X: 0.512]`
 */
export function CoordLabel({ text, position, className }: CoordLabelProps) {
    const posClasses = position
        ? {
            'top-left': 'absolute top-3 left-4',
            'top-right': 'absolute top-3 right-4',
            'bottom-left': 'absolute bottom-3 left-4',
            'bottom-right': 'absolute bottom-3 right-4',
        }[position]
        : undefined;

    return (
        <span
            className={cn(
                'font-mono text-[10px] tracking-widest text-zinc-600 select-none uppercase',
                posClasses,
                className,
            )}
        >
            {text}
        </span>
    );
}
