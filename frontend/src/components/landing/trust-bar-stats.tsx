'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, animate } from 'framer-motion';

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
                        className="group relative rounded-[25px] bg-[#e8c9b5] shadow-[0px_0px_8px_5px_rgba(0,0,0,0.1)] p-6 text-center transition-all duration-300 hover:shadow-[0px_0px_16px_6px_rgba(173,123,96,0.25)]"
                    >
                        {/* Glow dot */}
                        {/* <div className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-[#ad7b60]/60 group-hover:bg-[#ad7b60] transition-colors" aria-hidden="true" /> */}

                        <p className="text-3xl sm:text-4xl font-bold text-[#f4eeea] font-mono tracking-tight mb-1">
                            {stat.numericValue > 0 ? (
                                <AnimatedCounter value={stat.numericValue} suffix={stat.suffix} />
                            ) : (
                                '—'
                            )}
                        </p>
                        <p className="text-[11px] text-white uppercase tracking-widest font-mono">
                            {stat.label}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
