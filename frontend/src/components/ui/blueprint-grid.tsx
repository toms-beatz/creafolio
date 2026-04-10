import { cn } from '@/lib/utils';

interface BlueprintGridProps {
    /** Opacité de la grille (0-100), défaut 12 */
    opacity?: number;
    /** Taille de cellule en px, défaut 40 */
    cellSize?: number;
    /** Affiche une ligne de scan animée */
    scanLine?: boolean;
    className?: string;
}

/**
 * Grille blueprint en arrière-plan — positionnement absolu, pointer-events-none.
 * Lignes dashed teintées bleu cyanotype. À placer dans conteneur `relative overflow-hidden`.
 */
export function BlueprintGrid({
    opacity = 12,
    cellSize = 40,
    scanLine = false,
    className,
}: BlueprintGridProps) {
    const id = `bp-grid-${cellSize}-${opacity}`;
    const pct = opacity / 100;

    return (
        <div
            className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}
            aria-hidden="true"
        >
            <svg className="absolute inset-0 h-full w-full">
                <defs>
                    <pattern
                        id={id}
                        x="0"
                        y="0"
                        width={cellSize}
                        height={cellSize}
                        patternUnits="userSpaceOnUse"
                    >
                        {/* Ligne horizontale */}
                        <line
                            x1="0" y1={cellSize} x2={cellSize} y2={cellSize}
                            stroke="#38bdf8"
                            strokeWidth="0.9"
                            strokeDasharray="3 5"
                        />
                        {/* Ligne verticale */}
                        <line
                            x1={cellSize} y1="0" x2={cellSize} y2={cellSize}
                            stroke="#38bdf8"
                            strokeWidth="0.9"
                            strokeDasharray="3 5"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${id})`} opacity={pct} />
            </svg>

            {/* Ligne de scan animée */}
            {scanLine && (
                <div
                    className="animate-bp-scan absolute left-0 right-0 h-px"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, #38bdf8 40%, #7dd3fc 50%, #38bdf8 60%, transparent 100%)',
                        opacity: 0.4,
                    }}
                />
            )}
        </div>
    );
}