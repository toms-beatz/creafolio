'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BentoGridProps {
    children: ReactNode;
    className?: string;
}

/**
 * BentoGrid — grille asymétrique type Magic UI.
 * Les enfants utilisent BentoCard avec des tailles variées via className.
 */
export function BentoGrid({ children, className }: BentoGridProps) {
    return (
        <div
            className={cn(
                'grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
                className,
            )}
        >
            {children}
        </div>
    );
}

interface BentoCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    className?: string;
    /** Optionnel: contenu visuel supplémentaire (preview, illustration) */
    visual?: ReactNode;
    index?: number;
}

/**
 * BentoCard — carte individuelle du BentoGrid.
 * Hover glow + stagger animation.
 */
export function BentoCard({
    title,
    description,
    icon,
    className,
    visual,
    index = 0,
}: BentoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
            }}
            className={cn(
                'group relative flex flex-col justify-between overflow-hidden rounded-xl',
                ' bg-[#D4A485] p-6 transition-all duration-300',
                'shadow-[inset_0_2px_0_rgba(255,255,255,0.35),inset_0_-6px_16px_rgba(0,0,0,0.28),inset_2px_0_8px_rgba(0,0,0,0.12),inset_-2px_0_8px_rgba(0,0,0,0.12)]',
                'hover:border-[#ad7b60]/30 hover:shadow-[inset_0_2px_0_rgba(255,255,255,0.35),inset_0_-8px_20px_rgba(0,0,0,0.35),inset_2px_0_10px_rgba(0,0,0,0.15),inset_-2px_0_10px_rgba(0,0,0,0.15),0_0_40px_-10px_rgba(173,123,96,0.15)]',
                className,
            )}
        >
            {/* Gradient hover overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ad7b60]/[0.03] via-transparent to-transparent" />
            </div>

            <div className="relative z-10">
                {/* Icon */}
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[#e8c9b5] bg-[#e8c9b5]/30 text-[#ad7b60] transition-colors group-hover:border-[#ad7b60]/30 group-hover:bg-[#e8c9b5]/60">
                    {icon}
                </div>

                {/* Title */}
                <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>

                {/* Description */}
                <p className="text-xs text-white/70 leading-relaxed">{description}</p>
            </div>

            {/* Visual area (optional) */}
            {visual && (
                <div className="relative z-10 mt-4">
                    {visual}
                </div>
            )}
        </motion.div>
    );
}
