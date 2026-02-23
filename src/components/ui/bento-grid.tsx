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
                'border border-zinc-800 bg-zinc-900/50',
                'p-6 transition-all duration-300',
                'hover:border-sky-400/20 hover:bg-zinc-900/80',
                'hover:shadow-[0_0_40px_-10px_rgba(56,189,248,0.1)]',
                className,
            )}
        >
            {/* Gradient hover overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400/[0.03] via-transparent to-transparent" />
            </div>

            <div className="relative z-10">
                {/* Icon */}
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-sky-400 transition-colors group-hover:border-sky-400/30 group-hover:bg-sky-400/10">
                    {icon}
                </div>

                {/* Title */}
                <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>

                {/* Description */}
                <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
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
