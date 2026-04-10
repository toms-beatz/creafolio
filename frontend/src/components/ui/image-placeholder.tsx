interface ImagePlaceholderProps {
    width?: number;
    height?: number;
    label?: string;
    className?: string;
}

/**
 * Placeholder visuel pour les images non encore disponibles.
 */
export function ImagePlaceholder({ width, height, label, className }: ImagePlaceholderProps) {
    const ratio = width && height ? (height / width) * 100 : 56.25; // 16:9 par défaut
    const useRatio = !!(width && height);

    return (
        <div
            role="img"
            aria-label={label ?? 'Image non disponible'}
            className={`relative w-full overflow-hidden bg-zinc-900 rounded-lg ${className ?? ''}`}
            style={useRatio ? { paddingBottom: `${ratio}%` } : { height: '100%' }}
        >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                {/* Croix centrale décorative */}
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    className="text-zinc-700"
                    aria-hidden="true"
                >
                    <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1" />
                    <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="1" />
                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
                {label && (
                    <span className="font-mono text-[10px] text-zinc-600 text-center select-none tracking-widest uppercase">
                        {label}
                    </span>
                )}
                <span className="font-mono text-[9px] text-zinc-700 select-none">
                    {width}×{height}
                </span>
            </div>
        </div>
    );
}
