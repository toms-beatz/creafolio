'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Stat {
    label: string;
    numericValue: number;
    suffix: string;
}

/**
 * AnimatedCounter — nombre qui s'incrémente avec un spring effect.
 */
function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const [display, setDisplay] = useState('0');

    const animateValue = useCallback(() => {
        const controls = animate(0, value, {
            duration: 2,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => setDisplay(Math.round(v).toString()),
        });
        return () => controls.stop();
    }, [value]);

    useEffect(() => {
        if (!isInView) return;
        return animateValue();
    }, [isInView, animateValue]);

    return (
        <span ref={ref} className="tabular-nums">
            {display}
            {suffix}
        </span>
    );
}

/**
 * TrustBarStats — cartes stat individuelles avec glow au hover + animated counters.
 */
export function TrustBarStats({ stats }: { stats: Stat[] }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div
                        className={cn(
                            'group relative rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-center',
                            'transition-all duration-300',
                            'hover:border-sky-400/30 hover:bg-zinc-900/80',
                            'hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.15)]',
                        )}
                    >
                        {/* Glow dot */}
                        <div className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-sky-400/60 group-hover:bg-sky-400 transition-colors" aria-hidden="true" />

                        <p className="text-3xl sm:text-4xl font-bold text-white font-mono tracking-tight mb-1">
                            {stat.numericValue > 0 ? (
                                <AnimatedCounter value={stat.numericValue} suffix={stat.suffix} />
                            ) : (
                                '—'
                            )}
                        </p>
                        <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono">
                            {stat.label}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
