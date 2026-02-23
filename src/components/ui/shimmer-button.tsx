'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShimmerButtonProps {
    children: ReactNode;
    className?: string;
    /** Couleur du shimmer */
    shimmerColor?: string;
    /** Couleur de fond */
    background?: string;
    /** Durée de l'animation du shimmer (s) */
    shimmerDuration?: number;
    onClick?: () => void;
}

/**
 * ShimmerButton — bouton avec effet de brillance qui traverse.
 * Style premium pour les CTA principaux.
 */
export function ShimmerButton({
    children,
    className,
    shimmerColor = 'rgba(255, 255, 255, 0.3)',
    background = '#38bdf8',
    shimmerDuration = 2.5,
    onClick,
}: ShimmerButtonProps) {
    return (
        <motion.button
            className={cn(
                'group relative inline-flex items-center justify-center overflow-hidden rounded-lg px-8 py-3 font-semibold text-zinc-950 transition-all',
                className,
            )}
            style={{ background }}
            onClick={onClick}
            whileHover={{ scale: 1.02, boxShadow: `0 8px 30px ${background}40` }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Shimmer overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(110deg, transparent 25%, ${shimmerColor} 50%, transparent 75%)`,
                    backgroundSize: '250% 100%',
                    animation: `shimmer-slide ${shimmerDuration}s linear infinite`,
                }}
            />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">{children}</span>

            <style>{`
                @keyframes shimmer-slide {
                    0% { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }
            `}</style>
        </motion.button>
    );
}
